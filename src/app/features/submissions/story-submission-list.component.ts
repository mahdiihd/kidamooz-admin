import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StorySubmission, StorySubmissionService } from '../../core/services/story-submission.service';

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

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.listPending().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
        const current = this.selected();
        if (current && !items.some((x) => x.id === current.id)) {
          this.selected.set(null);
        }
      },
      error: () => {
        this.error.set('بارگذاری صف بررسی ناموفق بود.');
        this.loading.set(false);
      },
    });
  }

  select(item: StorySubmission): void {
    this.selected.set(item);
    this.message.set('');
  }

  approve(): void {
    const item = this.selected();
    if (!item || this.acting()) {
      return;
    }
    this.acting.set(true);
    this.message.set('');
    this.api.approve(item.id).subscribe({
      next: (res) => {
        this.acting.set(false);
        this.message.set(`منتشر شد با نام «${res.draft.authorName ?? 'کاربر'}» — شناسه قصه: ${res.storyId}`);
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
    if (!item || this.acting()) {
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
