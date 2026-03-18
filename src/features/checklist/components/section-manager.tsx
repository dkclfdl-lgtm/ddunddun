'use client';

import { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChecklistStore } from '../store';

export function SectionManager() {
  const sections = useChecklistStore((s) => s.data.sections);
  const addSection = useChecklistStore((s) => s.addSection);
  const removeSection = useChecklistStore((s) => s.removeSection);
  const reorderSections = useChecklistStore((s) => s.reorderSections);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('📋');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addSection({
      id: `section-${Date.now()}`,
      title: newTitle.trim(),
      icon: newIcon || '📋',
      items: [],
    });
    setNewTitle('');
    setNewIcon('📋');
    setDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">섹션 관리</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus size={14} className="mr-1.5" />
              섹션 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <span className="text-base">{sec.icon}</span>
                <span className="flex-1 text-sm font-medium">{sec.title}</span>
                <span className="text-xs text-muted-foreground">
                  {sec.items.length}개 항목
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === 0}
                  onClick={() => reorderSections(idx, idx - 1)}
                >
                  <ArrowUp size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === sections.length - 1}
                  onClick={() => reorderSections(idx, idx + 1)}
                >
                  <ArrowDown size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeSection(sec.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>새 섹션 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>아이콘</Label>
              <Input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="이모지"
                className="w-20"
              />
            </div>
            <div className="space-y-2">
              <Label>
                섹션명 <span className="text-destructive">*</span>
              </Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="예: 홀 운영 체크리스트"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAdd} disabled={!newTitle.trim()}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
