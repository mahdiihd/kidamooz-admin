import { Component, forwardRef, inject, OnInit, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  AudienceSegment,
  AudienceUser,
  DEFAULT_STORY_ACCESS,
  StoryAccess,
} from '../../../core/models/story-access.model';
import { AudienceService } from '../../../core/services/audience.service';

@Component({
  selector: 'app-story-access-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StoryAccessEditorComponent),
      multi: true,
    },
  ],
  templateUrl: './story-access-editor.component.html',
  styleUrl: './story-access-editor.component.scss',
})
export class StoryAccessEditorComponent implements ControlValueAccessor, OnInit {
  private readonly audienceService = inject(AudienceService);

  readonly segments = signal<AudienceSegment[]>([]);
  readonly users = signal<AudienceUser[]>([]);
  readonly value = signal<StoryAccess>(structuredClone(DEFAULT_STORY_ACCESS));

  private onChange: (value: StoryAccess) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.audienceService.getSegments().subscribe({
      next: (items) => this.segments.set(items),
    });
    this.audienceService.getUsers().subscribe({
      next: (items) => this.users.set(items),
    });
  }

  writeValue(value: StoryAccess | null): void {
    this.value.set(value ?? structuredClone(DEFAULT_STORY_ACCESS));
  }

  registerOnChange(fn: (value: StoryAccess) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setVisibility(visibility: StoryAccess['visibility']): void {
    const next: StoryAccess = {
      visibility,
      audience:
        visibility === 'public'
          ? { segmentIds: [], userIds: [] }
          : { ...this.value().audience },
    };
    this.updateValue(next);
  }

  isSegmentSelected(id: string): boolean {
    return this.value().audience.segmentIds.includes(id);
  }

  isUserSelected(id: string): boolean {
    return this.value().audience.userIds.includes(id);
  }

  toggleSegment(id: string): void {
    const current = this.value();
    const segmentIds = current.audience.segmentIds.includes(id)
      ? current.audience.segmentIds.filter((s) => s !== id)
      : [...current.audience.segmentIds, id];
    this.updateValue({
      ...current,
      audience: { ...current.audience, segmentIds },
    });
  }

  toggleUser(id: string): void {
    const current = this.value();
    const userIds = current.audience.userIds.includes(id)
      ? current.audience.userIds.filter((u) => u !== id)
      : [...current.audience.userIds, id];
    this.updateValue({
      ...current,
      audience: { ...current.audience, userIds },
    });
  }

  private updateValue(value: StoryAccess): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }
}
