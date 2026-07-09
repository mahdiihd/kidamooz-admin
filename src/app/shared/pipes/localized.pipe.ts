import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedText } from '../../core/models/localized-text.model';

@Pipe({ name: 'localized', standalone: true })
export class LocalizedPipe implements PipeTransform {
  transform(value: LocalizedText | null | undefined, lang: 'fa' | 'en' = 'fa'): string {
    if (!value) {
      return '';
    }
    return value[lang] || value.fa || value.en || '';
  }
}
