import { Pipe, PipeTransform } from '@angular/core';
import { AuditAction } from '../../core/models/audit-log.model';

const LABELS: Record<AuditAction, string> = {
  create: 'ایجاد',
  update: 'ویرایش',
  delete: 'حذف',
  publish: 'انتشار',
  unpublish: 'لغو انتشار',
  reorder: 'مرتب‌سازی',
  rebuild_version: 'بازسازی نسخه',
};

@Pipe({ name: 'auditAction', standalone: true })
export class AuditActionPipe implements PipeTransform {
  transform(action: AuditAction): string {
    return LABELS[action] ?? action;
  }
}
