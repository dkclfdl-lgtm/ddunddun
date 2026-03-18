'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CUSTOM_CATEGORY_VALUE = '__custom__';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionTitle: string;
  existingCategories?: string[];
  onAdd: (item: {
    category: string;
    title: string;
    responsible: string;
    notes: string;
    guide: string;
  }) => void;
}

export function AddItemDialog({
  open,
  onOpenChange,
  sectionTitle,
  existingCategories = [],
  onAdd,
}: AddItemDialogProps) {
  const [categorySelect, setCategorySelect] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [responsible, setResponsible] = useState('');
  const [notes, setNotes] = useState('');
  const [guide, setGuide] = useState('');

  const isCustom = categorySelect === CUSTOM_CATEGORY_VALUE;
  const resolvedCategory = isCustom ? customCategory.trim() : categorySelect;

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      category: resolvedCategory || '기타',
      title: title.trim(),
      responsible: responsible.trim(),
      notes: notes.trim(),
      guide: guide.trim(),
    });
    setCategorySelect('');
    setCustomCategory('');
    setTitle('');
    setResponsible('');
    setNotes('');
    setGuide('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>항목 추가 — {sectionTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>구분 (카테고리)</Label>
            {existingCategories.length > 0 ? (
              <>
                <Select value={categorySelect} onValueChange={setCategorySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_CATEGORY_VALUE}>
                      기타 (직접입력)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isCustom && (
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="새 카테고리명 입력"
                    className="mt-2"
                  />
                )}
              </>
            ) : (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="예: 서류, 매장컨디션"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>
              항목 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="체크리스트 항목명"
            />
          </div>
          <div className="space-y-2">
            <Label>담당자</Label>
            <Input
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="예: SV, 점주"
            />
          </div>
          <div className="space-y-2">
            <Label>메모/비고</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="참고 사항"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>가이드</Label>
            <Textarea
              value={guide}
              onChange={(e) => setGuide(e.target.value)}
              placeholder="상세 가이드"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim()}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
