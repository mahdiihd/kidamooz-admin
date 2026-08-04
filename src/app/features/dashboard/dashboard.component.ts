import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardStats } from '../../core/models/catalog.model';
import { AuditLogEntry } from '../../core/models/audit-log.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { JalaliDatePipe } from '../../shared/pipes/jalali-date.pipe';
import { AuditActionPipe } from '../../shared/pipes/audit-action.pipe';
import {
  buildBars,
  buildDonutSegments,
  DONUT_CIRCUMFERENCE,
  donutTotal,
} from './dashboard-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent, RouterLink, JalaliDatePipe, AuditActionPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly auditService = inject(AuditLogService);
  private readonly toast = inject(ToastService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly recentLogs = signal<AuditLogEntry[]>([]);
  readonly loading = signal(true);
  readonly rebuilding = signal(false);
  readonly donutCircumference = DONUT_CIRCUMFERENCE;

  readonly storySlices = computed(() => {
    const s = this.stats();
    if (!s) {
      return [];
    }
    return [
      { label: 'منتشرشده', value: s.publishedStories, color: '#2e7d32' },
      { label: 'پیش‌نویس', value: s.draftStories, color: '#f57c00' },
    ];
  });

  readonly storyDonut = computed(() => buildDonutSegments(this.storySlices()));
  readonly storyTotal = computed(() => donutTotal(this.storySlices()));
  readonly featuredCount = computed(() => this.stats()?.featuredStories ?? 0);

  readonly viewBars = computed(() => {
    const s = this.stats();
    if (!s) {
      return [];
    }
    return buildBars([
      { label: 'امروز', value: s.views.today, color: '#6b4eff' },
      { label: 'این هفته', value: s.views.thisWeek, color: '#7bc950' },
      { label: 'کل', value: s.views.total, color: '#1a1625' },
    ]);
  });

  readonly categoryPercent = computed(() => {
    const s = this.stats();
    if (!s || s.totalCategories <= 0) {
      return 0;
    }
    return Math.round((s.publishedCategories / s.totalCategories) * 100);
  });

  ngOnInit(): void {
    this.catalogService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.auditService.getAll({ limit: 6 }).subscribe({
      next: (logs) => this.recentLogs.set(logs),
    });
  }

  rebuildCatalog(): void {
    this.rebuilding.set(true);
    this.catalogService.rebuildVersion().subscribe({
      next: (version) => {
        this.stats.update((s) => (s ? { ...s, catalogVersion: version } : s));
        this.rebuilding.set(false);
        this.toast.success('نسخه کاتالوگ بازسازی شد');
        this.auditService.getAll({ limit: 6 }).subscribe({
          next: (logs) => this.recentLogs.set(logs),
        });
      },
      error: () => {
        this.rebuilding.set(false);
      },
    });
  }
}
