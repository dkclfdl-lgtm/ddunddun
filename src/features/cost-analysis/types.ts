export interface Ingredient {
  no: number;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  hqMarginRate: number;
  hqMarginAmount: number;
}

export interface MenuItem {
  id: string;
  menuName: string;
  category: string;
  sellingPrice: number;
  cost: number;
  costRatio: number;
  ingredients: Ingredient[];
}

export interface CostSimulation {
  menuItemId: string;
  originalCost: number;
  simulatedCost: number;
  originalCostRatio: number;
  simulatedCostRatio: number;
  changes: IngredientChange[];
}

export interface IngredientChange {
  ingredientName: string;
  originalPrice: number;
  newPrice: number;
  changePercent: number;
}

export interface CategorySummary {
  category: string;
  menuCount: number;
  avgCostRatio: number;
  totalCost: number;
  totalSellingPrice: number;
  minCostRatio: number;
  maxCostRatio: number;
}
