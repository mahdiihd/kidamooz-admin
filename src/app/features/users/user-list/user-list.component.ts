import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminUser } from '../../../core/models/admin-user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AdminRolePipe } from '../../../shared/pipes/admin-role.pipe';
import { JalaliDatePipe } from '../../../shared/pipes/jalali-date.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    AdminRolePipe,
    JalaliDatePipe,
    RouterLink,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(AdminUserService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly passwordUser = signal<AdminUser | null>(null);
  readonly resetting = signal(false);

  readonly passwordForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  openPasswordDialog(user: AdminUser): void {
    this.passwordForm.reset({ password: '' });
    this.passwordUser.set(user);
  }

  closePasswordDialog(): void {
    this.passwordUser.set(null);
  }

  submitPassword(): void {
    const user = this.passwordUser();
    if (!user || this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.resetting.set(true);
    this.userService
      .resetPassword(user.id, { password: this.passwordForm.getRawValue().password })
      .subscribe({
        next: () => {
          this.resetting.set(false);
          this.passwordUser.set(null);
          this.toast.success('رمز عبور تغییر کرد');
        },
        error: (err: HttpErrorResponse) => {
          this.resetting.set(false);
          this.toast.error(this.resolveError(err, 'خطا در تغییر رمز'));
        },
      });
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`آیا از حذف «${user.displayName}» مطمئن هستید؟`)) {
      return;
    }

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.toast.success('کاربر حذف شد');
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(this.resolveError(err, 'خطا در حذف کاربر'));
      },
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (items) => {
        this.users.set(items);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.toast.error(this.resolveError(err, 'خطا در بارگذاری کاربران'));
      },
    });
  }

  private resolveError(err: HttpErrorResponse, fallback: string): string {
    const message = err.error?.message;
    return typeof message === 'string' && message.length > 0 ? message : fallback;
  }
}
