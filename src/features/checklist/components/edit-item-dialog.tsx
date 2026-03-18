'use client';

import { useEffect, useState } from 'react';
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
import type { ChecklistItem } from '../types';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ChecklistItem | null;
  onSave: (updates: Partial<ChecklistItem>) => void;
}

export function EditItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: EditItemDialogProps) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [responsible, setResponsible] = useState('');
  const [notes, setNotes] = useState('');
  const [guide, setGuide] = useState('');

  useEffect(() => {
    if (item) {
      setCategory(item.category);
      setTitle(item.title);
      setResponsible(item.responsible);
      setNotes(item.notes);
      setGuide(item.guide);
    }
  }, [item]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      category: category.trim() || '기타',
      title: title.trim(),
      responsible: responsible.trim(),
      notes: notes.trim(),
      guide: guide.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>항목 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>구분 (카테고리)</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: 서류, 매장컨디션"
            />
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
          <Button onClick={handleSave} disabled={!title.trim()}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
