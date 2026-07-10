import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'adminRole', standalone: true })
export class AdminRolePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value === 'admin') {
      return 'ادمین';
    }
    if (value === 'editor') {
      return 'ویرایشگر';
    }
    return value ?? '—';
  }
}
