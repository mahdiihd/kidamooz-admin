import { Component, input } from '@angular/core';
import { StoryAccess } from '../../../core/models/story-access.model';
import { StoryVisibilityPipe } from '../../pipes/story-visibility.pipe';

@Component({
  selector: 'app-visibility-badge',
  standalone: true,
  imports: [StoryVisibilityPipe],
  template: `
    <span
      class="badge"
      [class.badge--public]="access().visibility === 'public'"
      [class.badge--restricted]="access().visibility === 'restricted'"
    >
      {{ access() | storyVisibility }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge--public {
      background: #e8eaf6;
      color: #3949ab;
    }

    .badge--restricted {
      background: #fce4ec;
      color: #c2185b;
    }
  `,
})
export class VisibilityBadgeComponent {
  readonly access = input.required<StoryAccess>();
}
