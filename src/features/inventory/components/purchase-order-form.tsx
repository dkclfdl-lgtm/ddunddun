'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/format';
import type { PurchaseOrder } from '../types';
import { getStoreOptions, getInventoryItems } from '../mock';

interface PurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
}

interface OrderLineItem {
  inventoryId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
}

export function PurchaseOrderForm({ open, onOpenChange, onSubmit }: PurchaseOrderFormProps) {
  const stores = useMemo(() => getStoreOptions(), []);
  const allItems = useMemo(() => getInventoryItems(), []);

  const [storeId, setStoreId] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expectedAt, setExpectedAt] = useState('');
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');

  const storeItems = useMemo(() => {
    if (!storeId) return [];
    return allItems.filter((item) => item.storeId === storeId);
  }, [allItems, storeId]);

  const suppliers = useMemo(() => {
    const set = new Set(storeItems.map((item) => item.supplier));
    return Array.from(set);
  }, [storeItems]);

  const selectedStoreName = stores.find((s) => s.id === storeId)?.name ?? '';

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  const handleAddItem = () => {
    const inventoryItem = storeItems.find((i) => i.id === selectedItemId);
    if (!inventoryItem) return;

    if (lineItems.some((li) => li.inventoryId === selectedItemId)) return;

    setLineItems((prev) => [
      ...prev,
      {
        inventoryId: inventoryItem.id,
        itemName: inventoryItem.itemName,
        quantity: 1,
        unitCost: inventoryItem.unitCost,
      },
    ]);
    setSelectedItemId('');
  };

  const handleRemoveItem = (inventoryId: string) => {
    setLineItems((prev) => prev.filter((li) => li.inventoryId !== inventoryId));
  };

  const handleQuantityChange = (inventoryId: string, quantity: number) => {
    setLineItems((prev) =>
      prev.map((li) =>
        li.inventoryId === inventoryId ? { ...li, quantity: Math.max(1, quantity) } : li
      )
    );
  };

  const handleSubmit = () => {
    if (!storeId || !supplier || !expectedAt || lineItems.length === 0) return;

    onSubmit({
      brandId: 'brand-1',
      storeId,
      storeName: selectedStoreName,
      supplier,
      items: lineItems.map((li) => ({
        inventoryId: li.inventoryId,
        itemName: li.itemName,
        quantity: li.quantity,
        unitCost: li.unitCost,
        totalCost: li.quantity * li.unitCost,
      })),
      totalAmount,
      status: 'draft',
      orderedAt: new Date().toISOString(),
      expectedAt,
      receivedAt: null,
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setStoreId('');
    setSupplier('');
    setExpectedAt('');
    setLineItems([]);
    setSelectedItemId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>발주서 작성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>매장</Label>
              <Select value={storeId} onValueChange={(v) => { setStoreId(v); setLineItems([]); setSupplier(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="매장 선택" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>공급업체</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="공급업체 선택" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>예상 입고일</Label>
            <Input
              type="date"
              value={expectedAt}
              onChange={(e) => setExpectedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>품목 추가</Label>
            <div className="flex gap-2">
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="품목 선택" />
                </SelectTrigger>
                <SelectContent>
                  {storeItems
                    .filter((item) => !supplier || item.supplier === supplier)
                    .filter((item) => !lineItems.some((li) => li.inventoryId === item.id))
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.itemName} ({item.category}) - 현재: {item.currentStock}
                        {item.unit}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddItem}
                disabled={!selectedItemId}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {lineItems.length > 0 && (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">품목</th>
                    <th className="px-3 py-2 text-left font-medium">수량</th>
                    <th className="px-3 py-2 text-left font-medium">단가</th>
                    <th className="px-3 py-2 text-left font-medium">합계</th>
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li) => (
                    <tr key={li.inventoryId} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{li.itemName}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={1}
                          value={li.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              li.inventoryId,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="h-8 w-20"
                        />
                      </td>
                      <td className="px-3 py-2">{formatCurrency(li.unitCost)}</td>
                      <td className="px-3 py-2 font-medium">
                        {formatCurrency(li.quantity * li.unitCost)}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRemoveItem(li.inventoryId)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-end rounded-lg bg-muted p-3">
            <div className="text-sm">
              <span className="text-muted-foreground">총 발주 금액: </span>
              <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!storeId || !supplier || !expectedAt || lineItems.length === 0}
          >
            발주서 저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
