import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StorySubmission, StorySubmissionService } from '../../core/services/story-submission.service';

type StatusFilter = 'all' | 'pending_review' | 'published' | 'deleted' | 'rejected' | 'ready' | 'audio_uploaded';

@Component({
  selector: 'app-story-submission-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './story-submission-list.component.html',
  styleUrl: './story-submission-list.component.scss',
})
export class StorySubmissionListComponent implements OnInit {
  private readonly api = inject(StorySubmissionService);

  readonly items = signal<StorySubmission[]>([]);
  readonly selected = signal<StorySubmission | null>(null);
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly filter = signal<StatusFilter>('all');

  readonly filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'همه' },
    { id: 'pending_review', label: 'در انتظار' },
    { id: 'published', label: 'منتشرشده' },
    { id: 'deleted', label: 'حذف‌شده' },
    { id: 'rejected', label: 'ردشده' },
    { id: 'ready', label: 'آماده ضبط' },
    { id: 'audio_uploaded', label: 'صدا آپلود شده' },
  ];

  readonly canModerate = computed(() => this.selected()?.status === 'pending_review');

  ngOnInit(): void {
    this.reload();
  }

  setFilter(filter: StatusFilter): void {
    this.filter.set(filter);
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    const status = this.filter() === 'all' ? null : this.filter();
    this.api.list(status).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
        const current = this.selected();
        if (current && !items.some((x) => x.id === current.id)) {
          this.selected.set(null);
        }
      },
      error: () => {
        this.error.set('بارگذاری قصه‌های کاربر ناموفق بود.');
        this.loading.set(false);
      },
    });
  }

  select(item: StorySubmission): void {
    this.selected.set(item);
    this.message.set('');
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'pending_review':
        return 'در انتظار تأیید';
      case 'published':
        return 'منتشرشده';
      case 'deleted':
        return 'حذف‌شده از کاتالوگ';
      case 'rejected':
        return 'ردشده';
      case 'ready':
        return 'آماده ضبط';
      case 'audio_uploaded':
        return 'صدا آپلود شده';
      case 'failed':
        return 'ناموفق';
      case 'archived':
        return 'بایگانی کاربر';
      default:
        return status;
    }
  }

  approve(): void {
    const item = this.selected();
    if (!item || this.acting() || item.status !== 'pending_review') {
      return;
    }
    this.acting.set(true);
    this.message.set('');
    this.api.approve(item.id).subscribe({
      next: (res) => {
        this.acting.set(false);
        this.message.set(
          `منتشر شد با نام «${res.draft.authorName ?? 'کاربر'}» — شناسه قصه: ${res.storyId}`
        );
        this.selected.set(null);
        this.reload();
      },
      error: () => {
        this.acting.set(false);
        this.error.set('تأیید ناموفق بود.');
      },
    });
  }

  reject(): void {
    const item = this.selected();
    if (!item || this.acting() || item.status !== 'pending_review') {
      return;
    }
    const reason = window.prompt('دلیل رد (اختیاری):') ?? undefined;
    this.acting.set(true);
    this.message.set('');
    this.api.reject(item.id, reason || undefined).subscribe({
      next: () => {
        this.acting.set(false);
        this.message.set('رد شد.');
        this.selected.set(null);
        this.reload();
      },
      error: () => {
        this.acting.set(false);
        this.error.set('رد کردن ناموفق بود.');
      },
    });
  }
}
