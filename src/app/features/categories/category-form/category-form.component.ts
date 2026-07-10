import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LocalizedInputComponent } from '../../../shared/components/localized-input/localized-input.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    LocalizedInputComponent,
    FileUploadComponent,
    RouterLink,
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly iconUpload = viewChild<FileUploadComponent>('iconUpload');

  readonly isEdit = signal(false);
  readonly saving = signal(false);
  readonly categoryId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: [{ fa: '', en: '' }, Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    iconUrl: ['', Validators.required],
    color: ['#7bc950', Validators.required],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
    published: [false],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.categoryId.set(id);
      this.loadCategory(id);
    }
  }

  onIconUrlChange(url: string): void {
    this.form.patchValue({ iconUrl: url });
  }

  submit(): void {
    const icon = this.iconUpload();
    if (!icon?.hasMedia()) {
      this.form.controls.iconUrl.markAsTouched();
      this.toast.error('آیکون الزامی است');
      return;
    }

    if (this.form.invalid && !icon.pendingFile()) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.title.invalid || this.form.controls.slug.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    if (icon.remoteUrl()) {
      payload.iconUrl = icon.remoteUrl()!;
    }
    const id = this.categoryId();
    const file = icon.pendingFile();

    const request$ = id
      ? this.categoryService.update(id, payload, file)
      : this.categoryService.create(payload, file);

    request$.subscribe({
      next: () => {
        this.toast.success('دسته‌بندی ذخیره شد');
        this.router.navigate(['/categories']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(this.resolveError(err));
      },
    });
  }

  private loadCategory(id: string): void {
    this.categoryService.getById(id).subscribe({
      next: (category) => {
        this.form.patchValue({
          title: category.title,
          slug: category.slug,
          iconUrl: category.iconUrl,
          color: category.color,
          sortOrder: category.sortOrder,
          published: category.published,
        });
        this.iconUpload()?.setInitialUrl(category.iconUrl);
      },
    });
  }

  private resolveError(err: HttpErrorResponse): string {
    const message = err.error?.message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    if (err.status === 422) {
      return 'آپلود فایل ناموفق بود؛ رکورد ذخیره نشد';
    }
    if (err.status === 409) {
      return 'اسلاگ یا شناسه تکراری است';
    }
    return 'خطا در ذخیره دسته‌بندی';
  }
}
