import { Component, forwardRef, inject, input, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoryChapter } from '../../../core/models/story.model';
import { LocalizedInputComponent } from '../localized-input/localized-input.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-chapters-editor',
  standalone: true,
  imports: [ReactiveFormsModule, LocalizedInputComponent, FileUploadComponent, DurationPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChaptersEditorComponent),
      multi: true,
    },
  ],
  templateUrl: './chapters-editor.component.html',
  styleUrl: './chapters-editor.component.scss',
})
export class ChaptersEditorComponent implements ControlValueAccessor, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private sub?: Subscription;

  readonly storyDuration = input(0);

  readonly form = this.fb.group({
    chapters: this.fb.array<FormGroup>([]),
  });

  get chapters(): FormArray<FormGroup> {
    return this.form.controls.chapters;
  }

  private onChange: (value: StoryChapter[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.sub = this.chapters.valueChanges.subscribe(() => this.emitChange());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  writeValue(value: StoryChapter[] | null): void {
    this.chapters.clear();
    (value ?? []).forEach((chapter) => {
      this.chapters.push(this.createChapterGroup(chapter));
    });
  }

  registerOnChange(fn: (value: StoryChapter[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  addChapter(): void {
    this.chapters.push(
      this.createChapterGroup({
        title: { fa: '', en: '' },
        startSeconds: 0,
        imageUrl: '',
      }),
    );
    this.emitChange();
  }

  removeChapter(index: number): void {
    this.chapters.removeAt(index);
    this.emitChange();
  }

  onImageChange(index: number, url: string): void {
    this.chapters.at(index).patchValue({ imageUrl: url }, { emitEvent: false });
    this.emitChange();
  }

  private createChapterGroup(chapter: StoryChapter): FormGroup {
    return this.fb.nonNullable.group({
      title: [chapter.title, Validators.required],
      startSeconds: [chapter.startSeconds, [Validators.required, Validators.min(0)]],
      imageUrl: [chapter.imageUrl, Validators.required],
    });
  }

  private emitChange(): void {
    this.onChange(this.chapters.getRawValue() as StoryChapter[]);
    this.onTouched();
  }
}
