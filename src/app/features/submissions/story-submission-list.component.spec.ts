import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MediaService } from '../../core/services/media.service';
import { StorySubmission, StorySubmissionService } from '../../core/services/story-submission.service';
import { StorySubmissionListComponent } from './story-submission-list.component';

describe('Free cover moderation', () => {
  const draft = {
    id: 'draft-1', status: 'pending_review', coverChoice: 'ai_free',
    drawingUrl: '/drawing.png', coverUrl: '/drawing.png', audioUrl: '/audio.mp3',
  } as StorySubmission;

  function setup() {
    const api = { approve: vi.fn(() => of({ storyId: 'story-1', draft })), list: vi.fn(() => of([])) };
    const media = { uploadLocal: vi.fn(() => of('/cover.png')) };
    TestBed.configureTestingModule({ providers: [
      { provide: StorySubmissionService, useValue: api },
      { provide: MediaService, useValue: media },
    ] });
    const component = TestBed.runInInjectionContext(() => new StorySubmissionListComponent());
    component.selected.set(draft);
    return { component, api, media };
  }

  it('requires a replacement cover before approval', () => {
    const { component, api } = setup();
    component.approve();
    expect(api.approve).not.toHaveBeenCalled();
    expect(component.error()).toContain('جلد رایگان');
  });

  it('uploads the selected cover and includes its URL with approval', () => {
    const { component, api, media } = setup();
    const file = new File(['image'], 'cover.png', { type: 'image/png' });
    component.coverFile.set(file);
    component.approve();
    expect(media.uploadLocal).toHaveBeenCalledWith(file, 'cover');
    expect(api.approve).toHaveBeenCalledWith('draft-1', 'ai', '/cover.png');
  });

  it('does not approve when the upload fails', () => {
    const { component, api, media } = setup();
    media.uploadLocal.mockReturnValue(throwError(() => new Error('upload failed')));
    component.coverFile.set(new File(['image'], 'cover.png'));
    component.approve();
    expect(api.approve).not.toHaveBeenCalled();
    expect(component.acting()).toBe(false);
    expect(component.error()).toBeTruthy();
  });
});
