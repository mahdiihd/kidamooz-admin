import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'داشبورد', icon: '📊', path: '/dashboard' },
    { label: 'دسته‌بندی‌ها', icon: '🗂️', path: '/categories' },
    { label: 'قصه‌ها', icon: '📖', path: '/stories' },
    { label: 'کاربران', icon: '👥', path: '/users' },
    { label: 'تاریخچه', icon: '📋', path: '/audit-log' },
  ];

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.auth.clearTokens();
      window.location.href = '/login';
    });
  }
}
