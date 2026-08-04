import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StorySubmission,
  StorySubmissionService,
} from '../../core/services/story-submission.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SubmissionStatusPipe } from './submission-status.pipe';

type StatusFilter =
  | 'all'
  | 'pending_review'
  | 'published'
  | 'deleted'
  | 'rejected'
  | 'ready'
  | 'audio_uploaded';

@Component({
  selector: 'app-story-submission-list',
  standalone: true,
  imports: [DatePipe, FormsModule, PageHeaderComponent, SubmissionStatusPipe],
  templateUrl: './story-submission-list.component.html',
  styleUrl: './story-submission-list.component.scss',
})
export class StorySubmissionListComponent implements OnInit {
  private readonly api = inject(StorySubmissionService);

  readonly items = signal<StorySubmission[]>([]);
  readonly selected = signal<StorySubmission | null>(null);
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly rejecting = signal(false);
  readonly rejectReason = signal('');
  readonly error = signal('');
  readonly message = signal('');
  readonly filter = signal<StatusFilter>('all');

  readonly filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'همه' },
    { id: 'pending_review', label: 'در انتظار' },
    { id: 'published', label: 'منتشرشده' },
    { id: 'rejected', label: 'ردشده' },
    { id: 'deleted', label: 'حذف‌شده' },
    { id: 'ready', label: 'آماده ضبط' },
    { id: 'audio_uploaded', label: 'صدا آپلود شده' },
  ];

  readonly canModerate = computed(() => {
    const status = this.selected()?.status;
    return status === 'pending_review' || status === 'deleted';
  });
  readonly isRepublish = computed(() => this.selected()?.status === 'deleted');
  readonly subtitle = computed(() => {
    const count = this.items().length;
    const filter = this.filter();
    if (filter === 'pending_review') {
      return count ? `${count} قصه در انتظار بررسی` : 'موردی در صف تأیید نیست';
    }
    return count ? `${count} مورد` : 'موردی یافت نشد';
  });

  ngOnInit(): void {
    this.reload();
  }

  setFilter(filter: StatusFilter): void {
    this.filter.set(filter);
    this.rejecting.set(false);
    this.rejectReason.set('');
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
        if (current) {
          const fresh = items.find((x) => x.id === current.id) ?? null;
          this.selected.set(fresh);
        } else if (items.length > 0) {
          this.selected.set(items[0]);
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
    this.rejecting.set(false);
    this.rejectReason.set('');
  }

  approve(): void {
    const item = this.selected();
    if (!item || this.acting()) {
      return;
    }
    if (item.status !== 'pending_review' && item.status !== 'deleted') {
      return;
    }
    this.acting.set(true);
    this.message.set('');
    this.error.set('');
    this.api.approve(item.id).subscribe({
      next: (res) => {
        this.acting.set(false);
        this.message.set(
          item.status === 'deleted'
            ? `بازانتشار شد در خیال‌خونه — شناسه قصه: ${res.storyId}`
            : `منتشر شد در خیال‌خونه با نام «${res.draft.authorName ?? 'کاربر'}» — شناسه قصه: ${res.storyId}`
        );
        this.selected.set(null);
        this.reload();
      },
      error: () => {
        this.acting.set(false);
        this.error.set(item.status === 'deleted' ? 'بازانتشار ناموفق بود.' : 'تأیید ناموفق بود.');
      },
    });
  }

  startReject(): void {
    this.rejecting.set(true);
    this.rejectReason.set('');
  }

  cancelReject(): void {
    this.rejecting.set(false);
    this.rejectReason.set('');
  }

  confirmReject(): void {
    const item = this.selected();
    if (!item || this.acting() || item.status !== 'pending_review') {
      return;
    }
    this.acting.set(true);
    this.message.set('');
    this.error.set('');
    const reason = this.rejectReason().trim() || undefined;
    this.api.reject(item.id, reason).subscribe({
      next: () => {
        this.acting.set(false);
        this.rejecting.set(false);
        this.rejectReason.set('');
        this.message.set('قصه رد شد.');
        this.selected.set(null);
        this.reload();
      },
      error: () => {
        this.acting.set(false);
        this.error.set('رد کردن ناموفق بود.');
      },
    });
  }

  onRejectReason(value: string): void {
    this.rejectReason.set(value);
  }
}
