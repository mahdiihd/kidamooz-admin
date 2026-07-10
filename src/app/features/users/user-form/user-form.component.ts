import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminRole } from '../../../core/models/admin-user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(AdminUserService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: this.fb.nonNullable.control<AdminRole>('editor', Validators.required),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.userService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('کاربر ساخته شد');
        this.router.navigate(['/users']);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
