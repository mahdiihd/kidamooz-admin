import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StoryService } from '../../../core/services/story.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { StoryChapter } from '../../../core/models/story.model';
import { DEFAULT_STORY_ACCESS } from '../../../core/models/story-access.model';
import { environment } from '../../../../environments/environment';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LocalizedInputComponent } from '../../../shared/components/localized-input/localized-input.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { ChaptersEditorComponent } from '../../../shared/components/chapters-editor/chapters-editor.component';
import { StoryAccessEditorComponent } from '../../../shared/components/story-access-editor/story-access-editor.component';
import { LocalizedPipe } from '../../../shared/pipes/localized.pipe';

@Component({
  selector: 'app-story-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    LocalizedInputComponent,
    FileUploadComponent,
    ChaptersEditorComponent,
    StoryAccessEditorComponent,
    LocalizedPipe,
    RouterLink,
  ],
  templateUrl: './story-form.component.html',
  styleUrl: './story-form.component.scss',
})
export class StoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storyService = inject(StoryService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly coverUpload = viewChild<FileUploadComponent>('coverUpload');
  private readonly audioUpload = viewChild<FileUploadComponent>('audioUpload');
  private readonly chaptersEditor = viewChild<ChaptersEditorComponent>('chaptersEditor');

  readonly isEdit = signal(false);
  readonly saving = signal(false);
  readonly storyId = signal<string | null>(null);
  readonly categories = signal<Category[]>([]);

  readonly form = this.fb.nonNullable.group({
    title: [{ fa: '', en: '' }, Validators.required],
    description: [{ fa: '', en: '' }, Validators.required],
    coverUrl: ['', Validators.required],
    audioUrl: ['', Validators.required],
    durationSeconds: [0, [Validators.required, Validators.min(1)]],
    ageMin: [3, [Validators.required, Validators.min(0)]],
    ageMax: [8, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    featured: [false],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
    published: [false],
    chapters: [[] as StoryChapter[]],
    access: [structuredClone(DEFAULT_STORY_ACCESS)],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.storyId.set(id);
      this.loadStory(id);
    }
  }

  get previewUrl(): string | null {
    const id = this.storyId();
    return id ? `${environment.mobileAppDeepLink}/${id}` : null;
  }

  onCoverUrlChange(url: string): void {
    this.form.patchValue({ coverUrl: url });
  }

  onAudioUrlChange(url: string): void {
    this.form.patchValue({ audioUrl: url });
  }

  submit(): void {
    const cover = this.coverUpload();
    const audio = this.audioUpload();
    const chaptersUi = this.chaptersEditor();

    if (!cover?.hasMedia()) {
      this.toast.error('کاور الزامی است');
      return;
    }
    if (!audio?.hasMedia()) {
      this.toast.error('فایل صوتی الزامی است');
      return;
    }
    if (chaptersUi && !chaptersUi.validateChapterMedia()) {
      this.toast.error('تصویر همه فصل‌ها الزامی است');
      return;
    }

    if (this.form.controls.title.invalid || this.form.controls.description.invalid
      || this.form.controls.categoryId.invalid || this.form.controls.durationSeconds.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.ageMin > raw.ageMax) {
      this.toast.error('حداقل سن نمی‌تواند بیشتر از حداکثر سن باشد');
      return;
    }

    if (
      raw.access.visibility === 'restricted' &&
      raw.access.audience.segmentIds.length === 0 &&
      raw.access.audience.userIds.length === 0
    ) {
      this.toast.error('برای قصه محدود، حداقل یک گروه یا کاربر انتخاب کنید');
      return;
    }

    if (cover.remoteUrl()) {
      raw.coverUrl = cover.remoteUrl()!;
    }
    if (audio.remoteUrl()) {
      raw.audioUrl = audio.remoteUrl()!;
    }

    this.saving.set(true);
    const id = this.storyId();
    const { chapters, ...payload } = raw;
    const media = {
      cover: cover.pendingFile(),
      audio: audio.pendingFile(),
      chapterImages: chaptersUi?.chapterImageFiles() ?? [],
    };

    const save$ = id
      ? this.storyService.update(id, payload, chapters, media)
      : this.storyService.create(payload, chapters, media);

    save$.subscribe({
      next: () => this.finishSave(),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(this.resolveError(err));
      },
    });
  }

  private finishSave(): void {
    this.saving.set(false);
    this.toast.success('قصه ذخیره شد');
    this.router.navigate(['/stories']);
  }

  private loadStory(id: string): void {
    this.storyService.getById(id).subscribe({
      next: (story) => {
        this.form.patchValue({
          title: story.title,
          description: story.description,
          coverUrl: story.coverUrl,
          audioUrl: story.audioUrl,
          durationSeconds: story.durationSeconds,
          ageMin: story.ageMin,
          ageMax: story.ageMax,
          categoryId: story.categoryId,
          featured: story.featured,
          sortOrder: story.sortOrder,
          published: story.published,
          chapters: story.chapters ?? [],
          access: story.access,
        });
        this.coverUpload()?.setInitialUrl(story.coverUrl);
        this.audioUpload()?.setInitialUrl(story.audioUrl);
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
      return 'خطا در ذخیره قصه (تداخل داده)';
    }
    return 'خطا در ذخیره قصه';
  }
}
