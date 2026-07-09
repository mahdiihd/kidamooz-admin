import { Component, inject, OnInit, signal } from '@angular/core';
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

  ngOnInit(): void {
    this.catalogService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.auditService.getAll({ limit: 5 }).subscribe({
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
        this.auditService.getAll({ limit: 5 }).subscribe({
          next: (logs) => this.recentLogs.set(logs),
        });
      },
      error: () => {
        this.rebuilding.set(false);
        this.toast.error('خطا در بازسازی نسخه');
      },
    });
  }
}
