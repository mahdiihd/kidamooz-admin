import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  pending_review: 'در انتظار تأیید',
  published: 'منتشرشده',
  deleted: 'حذف‌شده',
  rejected: 'ردشده',
  ready: 'آماده ضبط',
  audio_uploaded: 'صدا آپلود شده',
  failed: 'ناموفق',
  archived: 'بایگانی',
};

const TONES: Record<string, string> = {
  pending_review: 'warn',
  published: 'ok',
  deleted: 'muted',
  rejected: 'danger',
  ready: 'info',
  audio_uploaded: 'info',
  failed: 'danger',
  archived: 'muted',
};

@Pipe({ name: 'submissionStatus', standalone: true })
export class SubmissionStatusPipe implements PipeTransform {
  transform(status: string, mode: 'label' | 'tone' = 'label'): string {
    if (mode === 'tone') {
      return TONES[status] ?? 'muted';
    }
    return LABELS[status] ?? status;
  }
}
