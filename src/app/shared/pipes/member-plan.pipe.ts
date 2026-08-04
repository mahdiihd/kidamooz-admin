import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'memberPlan', standalone: true })
export class MemberPlanPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return 'رایگان';
    }
    return value.toLowerCase() === 'plus' ? 'پلاس' : 'رایگان';
  }
}
