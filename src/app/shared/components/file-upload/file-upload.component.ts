import { Component, effect, inject, input, output, signal } from '@angular/core';
import { MediaService, MediaType } from '../../../core/services/media.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  template: `
    <div class="file-upload">
      @if (label()) {
        <label class="field-label">{{ label() }}</label>
      }

      @if (previewUrl()) {
        <div class="preview" [class.preview--audio]="mediaType() === 'audio'">
          @if (mediaType() === 'audio') {
            <audio [src]="previewUrl()" controls></audio>
          } @else {
            <img [src]="previewUrl()" [alt]="label() || 'preview'" />
          }
          <button type="button" class="remove-btn" (click)="clearPreview()">حذف</button>
        </div>
      } @else {
        <label class="dropzone" [class.dropzone--loading]="uploading()">
          <input
            type="file"
            [accept]="accept()"
            (change)="onFileSelected($event)"
            [disabled]="uploading()"
          />
          @if (uploading()) {
            <span class="dropzone-text">در حال آپلود...</span>
          } @else {
            <span class="dropzone-icon">📁</span>
            <span class="dropzone-text">{{ hint() }}</span>
          }
        </label>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    .field-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border: 2px dashed var(--border);
      border-radius: var(--radius-md);
      background: var(--surface-muted);
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;

      &:hover {
        border-color: var(--primary);
        background: color-mix(in srgb, var(--primary) 5%, var(--surface-muted));
      }

      input {
        display: none;
      }
    }

    .dropzone--loading {
      opacity: 0.7;
      pointer-events: none;
    }

    .dropzone-icon {
      font-size: 1.5rem;
    }

    .dropzone-text {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .preview {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border);

      img {
        display: block;
        width: 100%;
        max-height: 200px;
        object-fit: cover;
      }

      audio {
        display: block;
        width: 100%;
        padding: 1rem;
        background: var(--surface-muted);
      }
    }

    .remove-btn {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.25rem 0.625rem;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      cursor: pointer;
      font-family: inherit;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    .error {
      margin: 0.375rem 0 0;
      font-size: 0.75rem;
      color: var(--danger);
    }
  `,
})
export class FileUploadComponent {
  private readonly mediaService = inject(MediaService);

  readonly label = input<string>();
  readonly mediaType = input<MediaType>('cover');
  readonly accept = input('image/webp,image/jpeg,image/png');
  readonly hint = input('فایل را انتخاب کنید یا اینجا بکشید');
  readonly maxSizeMb = input(2);
  readonly initialUrl = input('');

  readonly urlChange = output<string>();

  readonly previewUrl = signal<string | null>(null);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const url = this.initialUrl();
      if (url) {
        this.previewUrl.set(url);
      }
    });
  }

  setInitialUrl(url: string): void {
    this.previewUrl.set(url || null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const maxBytes = this.maxSizeMb() * 1024 * 1024;
    if (file.size > maxBytes) {
      this.error.set(`حجم فایل نباید بیشتر از ${this.maxSizeMb()} مگابایت باشد`);
      return;
    }

    this.error.set(null);
    this.uploading.set(true);

    this.mediaService.uploadLocal(file, this.mediaType()).subscribe({
      next: (url) => {
        this.previewUrl.set(url);
        this.urlChange.emit(url);
        this.uploading.set(false);
      },
      error: () => {
        this.error.set('آپلود با خطا مواجه شد');
        this.uploading.set(false);
      },
    });

    input.value = '';
  }

  clearPreview(): void {
    this.previewUrl.set(null);
    this.urlChange.emit('');
  }
}
