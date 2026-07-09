import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuditLogEntry } from '../../core/models/audit-log.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AuditActionPipe } from '../../shared/pipes/audit-action.pipe';
import { JalaliDatePipe } from '../../shared/pipes/jalali-date.pipe';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent, AuditActionPipe, JalaliDatePipe],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss',
})
export class AuditLogComponent implements OnInit {
  private readonly auditService = inject(AuditLogService);
  private readonly fb = inject(FormBuilder);

  readonly logs = signal<AuditLogEntry[]>([]);
  readonly loading = signal(true);

  readonly filterForm = this.fb.nonNullable.group({
    entityType: [''],
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  applyFilter(): void {
    this.loadLogs();
  }

  entityLabel(type: string): string {
    const labels: Record<string, string> = {
      story: 'قصه',
      category: 'دسته',
      catalog: 'کاتالوگ',
    };
    return labels[type] ?? type;
  }

  private loadLogs(): void {
    this.loading.set(true);
    const entityType = this.filterForm.value.entityType || undefined;
    this.auditService.getAll({ entityType, limit: 100 }).subscribe({
      next: (items) => {
        this.logs.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
