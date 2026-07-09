import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'jalaliDate', standalone: true })
export class JalaliDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
