import { Component, DestroyRef, HostListener, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

  readonly menuOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'داشبورد', icon: '📊', path: '/dashboard' },
    { label: 'دسته‌بندی‌ها', icon: '🗂️', path: '/categories' },
    { label: 'قصه‌ها', icon: '📖', path: '/stories' },
    { label: 'تأیید قصه‌ها', icon: '🎧', path: '/submissions' },
    { label: 'کاربران اپ', icon: '📱', path: '/members' },
    { label: 'چالش‌ها', icon: '🏆', path: '/challenges' },
    { label: 'کاربران ادمین', icon: '👥', path: '/users' },
    { label: 'نوتیفیکیشن', icon: '🔔', path: '/notifications' },
    { label: 'تاریخچه', icon: '📋', path: '/audit-log' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.closeMenu());

    effect(() => {
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });

    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1100) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.closeMenu();
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
