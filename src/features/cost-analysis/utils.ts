import * as XLSX from 'xlsx';
import type { MenuItem, Ingredient, CategorySummary } from './types';

// Sheet names that are NOT menu cost sheets and should be skipped
const SKIP_SHEET_PATTERNS = [
  '식재료',
  '리스트',
  '목록',
  'Sheet',
  '삭제메뉴',
  '메뉴별 원가',
  '요약',
  '참고',
  '변경',
  '히스토리',
];

// Validate whether a sheet has the standard cost table format
// Look through the first 10 rows for the header row containing key columns
function isValidCostSheet(sheet: XLSX.WorkSheet): boolean {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    range: 0,
  });
  if (rows.length < 2) return false;

  // Look for header row that contains keywords - check up to 10 rows since
  // some sheets have empty rows or title rows before the actual header
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    const joined = row.map((c) => String(c ?? '')).join('|');

    // The header should contain some combination of these keywords
    const hasMenu = joined.includes('메뉴명') || joined.includes('메뉴');
    const hasIngredient =
      joined.includes('재료명') || joined.includes('재료');
    const hasUnit = joined.includes('단위');
    const hasQuantity = joined.includes('투입량');
    const hasUnitPrice = joined.includes('적용단가') || joined.includes('단가');
    const hasNo = joined.includes('No') || joined.includes('NO') || joined.includes('no');

    // Need at least 2 of these key columns to identify as a cost sheet
    const matchCount = [hasMenu, hasIngredient, hasUnit, hasQuantity, hasUnitPrice, hasNo]
      .filter(Boolean).length;

    if (matchCount >= 3) {
      return true;
    }

    // Also accept if it has menu + ingredient (the two most important columns)
    if (hasMenu && hasIngredient) {
      return true;
    }
  }
  return false;
}

// Find the header row index (0-based) that contains the standard columns
function findHeaderRow(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    const joined = row.map((c) => String(c ?? '')).join('|');

    const hasMenu = joined.includes('메뉴명') || joined.includes('메뉴');
    const hasIngredient =
      joined.includes('재료명') || joined.includes('재료');
    const hasUnit = joined.includes('단위');
    const hasQuantity = joined.includes('투입량');

    if (hasMenu && hasIngredient) {
      return i;
    }
    // Fallback: if we have unit and quantity that's also good enough
    if (hasUnit && hasQuantity && (hasMenu || hasIngredient)) {
      return i;
    }
  }
  return 0;
}

// Map column names to their indices based on the header row
function buildColumnMap(headerRow: unknown[]): Record<string, number> {
  const map: Record<string, number> = {};
  if (!Array.isArray(headerRow)) return map;

  for (let col = 0; col < headerRow.length; col++) {
    const val = String(headerRow[col] ?? '').trim();
    if (!val) continue;

    if (val === 'No' || val === 'NO' || val === 'no') map['no'] = col;
    else if (val.includes('메뉴명') || val === '메뉴') map['menuName'] = col;
    else if (val.includes('재료명') || val === '재료') map['ingredientName'] = col;
    else if (val === '단위') map['unit'] = col;
    else if (val.includes('투입량')) map['quantity'] = col;
    else if (val.includes('적용단가') || val === '단가') map['unitPrice'] = col;
    else if (val.includes('금액')) map['amount'] = col;
    else if (val.includes('마진율')) map['hqMarginRate'] = col;
    else if (val.includes('마진액')) map['hqMarginAmount'] = col;
    else if (val === '판매가') map['sellingPrice'] = col;
    else if (val === '원가') map['cost'] = col;
    else if (val.includes('원가율')) map['costRatio'] = col;
  }

  return map;
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

function toString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

// Check if a cost ratio value looks like a decimal (e.g., 0.38) rather than percent (38)
// Heuristic: if the value is between 0 and 1 (exclusive), treat it as a decimal
function normalizeToPercent(value: number): number {
  if (value > 0 && value < 1) {
    // Decimal like 0.3835 -> 38.35%
    return value * 100;
  }
  // Already in percent form (e.g., 38.35)
  return value;
}

export async function parseCostExcel(file: File): Promise<MenuItem[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const allMenuItems: MenuItem[] = [];
  let idCounter = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    // Skip sheets matching skip patterns
    const shouldSkip = SKIP_SHEET_PATTERNS.some((pattern) =>
      sheetName.includes(pattern)
    );
    if (shouldSkip) continue;

    if (!isValidCostSheet(sheet)) continue;

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      range: 0,
    });

    const headerIdx = findHeaderRow(rows);
    const headerRow = rows[headerIdx];
    const colMap = buildColumnMap(headerRow as unknown[]);
    const dataRows = rows.slice(headerIdx + 1);

    // Use column map with fallback to default positions
    const colNo = colMap['no'] ?? 0;
    const colMenuName = colMap['menuName'] ?? 1;
    const colIngredient = colMap['ingredientName'] ?? 2;
    const colUnit = colMap['unit'] ?? 3;
    const colQuantity = colMap['quantity'] ?? 4;
    const colUnitPrice = colMap['unitPrice'] ?? 5;
    const colAmount = colMap['amount'] ?? 6;
    const colMarginRate = colMap['hqMarginRate'] ?? 7;
    const colMarginAmount = colMap['hqMarginAmount'] ?? 8;
    const colSellingPrice = colMap['sellingPrice'] ?? 9;
    const colCost = colMap['cost'] ?? 10;
    const colCostRatio = colMap['costRatio'] ?? 11;

    let currentMenuName = '';
    let currentSellingPrice = 0;
    let currentCost = 0;
    let currentCostRatio = 0;
    let currentIngredients: Ingredient[] = [];
    let ingredientNo = 0;

    const saveCurrentMenu = () => {
      if (currentMenuName && currentIngredients.length > 0) {
        idCounter++;
        // Normalize costRatio to percent
        const normalizedRatio = normalizeToPercent(currentCostRatio);
        allMenuItems.push({
          id: `menu-${idCounter}`,
          menuName: currentMenuName,
          category: sheetName,
          sellingPrice: currentSellingPrice,
          cost: currentCost,
          costRatio: normalizedRatio,
          ingredients: [...currentIngredients],
        });
      }
      currentMenuName = '';
      currentIngredients = [];
      ingredientNo = 0;
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!Array.isArray(row) || row.length < 3) {
        // Blank row - if we have a menu, save it
        saveCurrentMenu();
        continue;
      }

      const rNo = toString(row[colNo]);
      const rMenuName = toString(row[colMenuName]);
      const rIngredient = toString(row[colIngredient]);
      const rUnit = toString(row[colUnit]);
      const rQuantity = toNumber(row[colQuantity]);
      const rUnitPrice = toNumber(row[colUnitPrice]);
      const rAmount = toNumber(row[colAmount]);
      const rMarginRate = toNumber(row[colMarginRate]);
      const rMarginAmount = toNumber(row[colMarginAmount]);
      const rSellingPrice = toNumber(row[colSellingPrice]);
      const rCost = toNumber(row[colCost]);
      const rCostRatio = toNumber(row[colCostRatio]);

      // Check if this is a total row
      if (
        rIngredient.includes('합계') ||
        rMenuName.includes('합계') ||
        rNo.includes('합계')
      ) {
        // Use the total row's amount as cost if it's set and we don't already have cost
        if (currentMenuName && currentIngredients.length > 0) {
          if (currentCost === 0 && rAmount > 0) {
            currentCost = rAmount;
          }
        }
        saveCurrentMenu();
        continue;
      }

      // Skip header-like or section label rows
      if (
        rMenuName.includes('메뉴명') ||
        rIngredient.includes('재료명') ||
        rNo === 'No' || rNo === 'NO'
      ) {
        continue;
      }

      // If rMenuName has a menu name, this is the start of a new menu item
      if (rMenuName && rMenuName !== currentMenuName) {
        // Save previous menu if exists
        saveCurrentMenu();

        currentMenuName = rMenuName;
        currentSellingPrice = rSellingPrice || currentSellingPrice;
        currentCost = rCost || 0;
        currentCostRatio = rCostRatio || 0;
      }

      // If we have an ingredient name, add it
      if (rIngredient && !rIngredient.includes('합계')) {
        ingredientNo++;
        currentIngredients.push({
          no: toNumber(rNo) || ingredientNo,
          name: rIngredient,
          unit: rUnit,
          quantity: rQuantity,
          unitPrice: rUnitPrice,
          amount: rAmount,
          hqMarginRate: rMarginRate,
          hqMarginAmount: rMarginAmount,
        });
      }
    }

    // Don't forget the last menu item in the sheet
    saveCurrentMenu();
  }

  // Post-process: calculate cost from ingredients if cost is 0, and fix costRatio
  for (const item of allMenuItems) {
    if (item.cost === 0 && item.ingredients.length > 0) {
      item.cost = item.ingredients.reduce((sum, ing) => sum + ing.amount, 0);
    }
    if (
      item.costRatio === 0 &&
      item.sellingPrice > 0 &&
      item.cost > 0
    ) {
      item.costRatio = (item.cost / item.sellingPrice) * 100;
    }
  }

  return allMenuItems;
}

export function generateCategorySummaries(items: MenuItem[]): CategorySummary[] {
  const categoryMap = new Map<string, MenuItem[]>();
  for (const item of items) {
    const existing = categoryMap.get(item.category) ?? [];
    existing.push(item);
    categoryMap.set(item.category, existing);
  }

  return Array.from(categoryMap.entries()).map(([category, menuItems]) => {
    const validItems = menuItems.filter((m) => m.costRatio > 0);
    const avgCostRatio =
      validItems.length > 0
        ? validItems.reduce((s, m) => s + m.costRatio, 0) / validItems.length
        : 0;
    const totalCost = menuItems.reduce((s, m) => s + m.cost, 0);
    const totalSellingPrice = menuItems.reduce(
      (s, m) => s + m.sellingPrice,
      0
    );
    const costRatios = validItems.map((m) => m.costRatio);

    return {
      category,
      menuCount: menuItems.length,
      avgCostRatio,
      totalCost,
      totalSellingPrice,
      minCostRatio: costRatios.length > 0 ? Math.min(...costRatios) : 0,
      maxCostRatio: costRatios.length > 0 ? Math.max(...costRatios) : 0,
    };
  });
}

/**
 * Simulate cost change by setting new unit prices directly.
 * NOTE: The `amount` field from Excel already includes the 5% loss factor,
 * so we do NOT multiply by 1.05 again. Instead:
 *   newAmount = newUnitPrice * ing.quantity * (ing.amount / (ing.unitPrice * ing.quantity))
 * which simplifies to: newAmount = (newUnitPrice / ing.unitPrice) * ing.amount
 * This preserves the original loss factor built into the amount.
 */
export function simulateCostChange(
  item: MenuItem,
  changes: Map<string, number> // ingredientName -> new unitPrice
): {
  simulatedCost: number;
  simulatedCostRatio: number;
  ingredientChanges: Array<{
    name: string;
    originalAmount: number;
    newAmount: number;
    diff: number;
  }>;
} {
  let simulatedCost = 0;
  const ingredientChanges: Array<{
    name: string;
    originalAmount: number;
    newAmount: number;
    diff: number;
  }> = [];

  for (const ing of item.ingredients) {
    const newUnitPrice = changes.get(ing.name);
    if (newUnitPrice !== undefined && ing.unitPrice > 0) {
      // Scale the amount proportionally to the unit price change
      // This preserves the loss factor already baked into ing.amount
      const newAmount = (newUnitPrice / ing.unitPrice) * ing.amount;
      ingredientChanges.push({
        name: ing.name,
        originalAmount: ing.amount,
        newAmount,
        diff: newAmount - ing.amount,
      });
      simulatedCost += newAmount;
    } else {
      simulatedCost += ing.amount;
    }
  }

  const simulatedCostRatio =
    item.sellingPrice > 0 ? (simulatedCost / item.sellingPrice) * 100 : 0;

  return { simulatedCost, simulatedCostRatio, ingredientChanges };
}

export function simulateCostByPercent(
  item: MenuItem,
  percentChanges: Map<string, number> // ingredientName -> percent change (e.g., 10 = +10%)
): {
  simulatedCost: number;
  simulatedCostRatio: number;
} {
  let simulatedCost = 0;

  for (const ing of item.ingredients) {
    const pct = percentChanges.get(ing.name);
    if (pct !== undefined) {
      const factor = 1 + pct / 100;
      simulatedCost += ing.amount * factor;
    } else {
      simulatedCost += ing.amount;
    }
  }

  const simulatedCostRatio =
    item.sellingPrice > 0 ? (simulatedCost / item.sellingPrice) * 100 : 0;

  return { simulatedCost, simulatedCostRatio };
}

export function calculateTargetSimulation(
  item: MenuItem,
  targetCostRatio: number,
  strategy: 'expensive_first' | 'equal' | 'proportional'
): Map<string, number> {
  // target cost ratio in percent
  const targetCost = (targetCostRatio / 100) * item.sellingPrice;
  const currentCost = item.ingredients.reduce((s, ing) => s + ing.amount, 0);
  const costDiff = targetCost - currentCost; // negative means we need to reduce

  if (Math.abs(costDiff) < 1) return new Map();

  const changes = new Map<string, number>();

  if (strategy === 'equal') {
    // Reduce/increase all ingredients equally by percentage
    const pctChange = (costDiff / currentCost) * 100;
    for (const ing of item.ingredients) {
      changes.set(ing.name, pctChange);
    }
  } else if (strategy === 'expensive_first') {
    // Sort by amount descending, reduce most expensive first
    const sorted = [...item.ingredients].sort(
      (a, b) => b.amount - a.amount
    );
    let remaining = costDiff;
    for (const ing of sorted) {
      if (Math.abs(remaining) < 1) break;
      // Max reduction: 50% of ingredient amount
      const maxChange = ing.amount * (costDiff < 0 ? -0.5 : 0.5);
      const change =
        Math.abs(remaining) < Math.abs(maxChange) ? remaining : maxChange;
      const pct = (change / ing.amount) * 100;
      changes.set(ing.name, pct);
      remaining -= change;
    }
  } else {
    // Proportional: each ingredient changes proportionally to its share of total cost
    for (const ing of item.ingredients) {
      if (currentCost === 0) continue;
      const share = ing.amount / currentCost;
      const ingDiff = costDiff * share;
      const pct = (ingDiff / ing.amount) * 100;
      changes.set(ing.name, pct);
    }
  }

  return changes;
}
