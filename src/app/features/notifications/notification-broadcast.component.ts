import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-notification-broadcast',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './notification-broadcast.component.html',
  styleUrl: './notification-broadcast.component.scss',
})
export class NotificationBroadcastComponent {
  private readonly notifications = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly sending = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    body: ['', [Validators.required, Validators.maxLength(500)]],
    storyId: [''],
  });

  submit(): void {
    if (this.form.invalid || this.sending()) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending.set(true);

    const value = this.form.getRawValue();
    const storyId = value.storyId.trim();

    this.notifications
      .broadcast({
        title: value.title.trim(),
        body: value.body.trim(),
        audience: 'all',
        data: storyId ? { storyId } : undefined,
      })
      .subscribe({
        next: (response) => {
          this.toast.success(
            `ارسال انجام شد — کل: ${response.totalTokens} | موفق: ${response.successCount} | ناموفق: ${response.failureCount}`,
          );
          this.sending.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message || 'ارسال نوتیفیکیشن ناموفق بود');
          this.sending.set(false);
        },
      });
  }
}
