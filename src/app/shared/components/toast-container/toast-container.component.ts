import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" (click)="toastService.dismiss(toast.id)">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      left: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 360px;
    }

    .toast {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      animation: slide-in 0.25s ease;
    }

    .toast--success {
      background: #e8f8ef;
      color: #1a7f4b;
      border: 1px solid #c8e6d0;
    }

    .toast--error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ffcdd2;
    }

    .toast--info {
      background: #e8eaf6;
      color: #3949ab;
      border: 1px solid #c5cae9;
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(0.5rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
