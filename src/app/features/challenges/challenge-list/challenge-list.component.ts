import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminChallengeService } from '../../../core/services/admin-challenge.service';
import { ToastService } from '../../../core/services/toast.service';
import { WeeklyChallenge } from '../../../core/models/weekly-challenge.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { JalaliDatePipe } from '../../../shared/pipes/jalali-date.pipe';

@Component({
  selector: 'app-challenge-list',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent, JalaliDatePipe],
  templateUrl: './challenge-list.component.html',
  styleUrl: './challenge-list.component.scss',
})
export class ChallengeListComponent implements OnInit {
  private readonly challenges = inject(AdminChallengeService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<WeeklyChallenge[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editing = signal<WeeklyChallenge | null>(null);
  readonly formOpen = signal(false);

  readonly form = this.fb.nonNullable.group({
    titleFa: ['', [Validators.required, Validators.maxLength(200)]],
    themeTag: ['', [Validators.required, Validators.maxLength(64)]],
    descriptionFa: ['', [Validators.required, Validators.maxLength(1000)]],
    weekStart: ['', Validators.required],
    weekEnd: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  openCreate(): void {
    this.editing.set(null);
    const start = this.currentWeekStart();
    this.form.reset({
      titleFa: '',
      themeTag: '',
      descriptionFa: '',
      weekStart: start,
      weekEnd: this.addDays(start, 6),
      isActive: true,
    });
    this.formOpen.set(true);
  }

  openEdit(item: WeeklyChallenge): void {
    this.editing.set(item);
    this.form.reset({
      titleFa: item.titleFa,
      themeTag: item.themeTag,
      descriptionFa: item.descriptionFa,
      weekStart: item.weekStart.slice(0, 10),
      weekEnd: item.weekEnd.slice(0, 10),
      isActive: item.isActive,
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      titleFa: value.titleFa.trim(),
      themeTag: value.themeTag.trim(),
      descriptionFa: value.descriptionFa.trim(),
      weekStart: value.weekStart,
      weekEnd: value.weekEnd || null,
      isActive: value.isActive,
    };

    this.saving.set(true);
    const editing = this.editing();
    const request$ = editing
      ? this.challenges.update(editing.id, payload)
      : this.challenges.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
        this.toast.success(editing ? 'چالش به‌روز شد' : 'چالش اضافه شد');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message || 'ذخیره چالش ناموفق بود');
      },
    });
  }

  toggleActive(item: WeeklyChallenge): void {
    this.challenges.setActive(item.id, !item.isActive).subscribe({
      next: () => {
        this.load();
        this.toast.success(item.isActive ? 'چالش غیرفعال شد' : 'چالش فعال شد');
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'تغییر وضعیت ناموفق بود');
      },
    });
  }

  deleteItem(item: WeeklyChallenge): void {
    if (!confirm(`آیا از حذف «${item.titleFa}» مطمئن هستید؟`)) {
      return;
    }

    this.challenges.delete(item.id).subscribe({
      next: () => {
        this.load();
        this.toast.success('چالش حذف شد');
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'حذف چالش ناموفق بود');
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.challenges.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private currentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const daysSinceSaturday = (day + 1) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - daysSinceSaturday);
    return this.toDateInput(start);
  }

  private addDays(isoDate: string, days: number): string {
    const date = new Date(`${isoDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    return this.toDateInput(date);
  }

  private toDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
