import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge" [class.badge--published]="published()" [class.badge--draft]="!published()">
      {{ published() ? 'منتشر شده' : 'پیش‌نویس' }}
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

    .badge--published {
      background: #e8f8ef;
      color: #1a7f4b;
    }

    .badge--draft {
      background: #fff3e0;
      color: #e65100;
    }
  `,
})
export class StatusBadgeComponent {
  readonly published = input(false);
}
