'use client';

import { useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/format';
import type { Review } from '../types';

interface ReviewDetailDialogProps {
  review: Review | null;
  open: boolean;
  onClose: () => void;
  onReply: (reviewId: string, reply: string) => void;
}

const sentimentLabels: Record<string, { label: string; color: string }> = {
  positive: { label: '긍정', color: 'bg-green-100 text-green-700' },
  neutral: { label: '중립', color: 'bg-gray-100 text-gray-700' },
  negative: { label: '부정', color: 'bg-red-100 text-red-700' },
};

export function ReviewDetailDialog({ review, open, onClose, onReply }: ReviewDetailDialogProps) {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!review) return null;

  const sentimentConfig = sentimentLabels[review.sentiment];

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onReply(review.id, replyText.trim());
    setReplyText('');
    setIsSubmitting(false);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setReplyText('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>리뷰 상세</DialogTitle>
          <DialogDescription>리뷰 내용을 확인하고 답글을 작성할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 리뷰 메타 정보 */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-transparent bg-muted">
              {review.storeName}
            </Badge>
            <Badge variant="outline" className="border-transparent bg-muted">
              {review.platform}
            </Badge>
            <Badge variant="outline" className={`border-transparent ${sentimentConfig?.color}`}>
              {sentimentConfig?.label}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDate(review.reviewDate, 'yyyy.MM.dd')}
            </span>
          </div>

          {/* 작성자 및 별점 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{review.author}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed">{review.content}</p>
          </div>

          {/* 키워드 */}
          {review.keywords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">키워드:</span>
              {review.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* 기존 답글 또는 답글 작성 */}
          {review.reply ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-primary" />
                <span className="text-sm font-medium">사장님 답글</span>
                {review.repliedAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.repliedAt, 'yyyy.MM.dd')}
                  </span>
                )}
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm">{review.reply}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">답글 작성</span>
              </div>
              <Textarea
                placeholder="답글을 입력해 주세요..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmitting}
                >
                  {isSubmitting ? '등록 중...' : '답글 등록'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
