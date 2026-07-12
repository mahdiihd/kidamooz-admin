import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems: NavItem[] = [
    { label: 'داشبورد', icon: '📊', path: '/dashboard' },
    { label: 'دسته‌بندی‌ها', icon: '🗂️', path: '/categories' },
    { label: 'قصه‌ها', icon: '📖', path: '/stories' },
    { label: 'کاربران', icon: '👥', path: '/users' },
    { label: 'نوتیفیکیشن', icon: '🔔', path: '/notifications' },
    { label: 'تاریخچه', icon: '📋', path: '/audit-log' },
  ];

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.auth.clearTokens();
    void this.router.navigate(['/login']);
  }
}
