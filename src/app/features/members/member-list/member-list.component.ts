import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminMemberService } from '../../../core/services/admin-member.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppMember } from '../../../core/models/app-member.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { JalaliDatePipe } from '../../../shared/pipes/jalali-date.pipe';
import { MemberPlanPipe } from '../../../shared/pipes/member-plan.pipe';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent, JalaliDatePipe, MemberPlanPipe],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
})
export class MemberListComponent implements OnInit {
  private readonly memberService = inject(AdminMemberService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly members = signal<AppMember[]>([]);
  readonly loading = signal(true);
  readonly deletingId = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.loadMembers();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.loadMembers(term));
  }

  deleteMember(member: AppMember): void {
    const label = member.displayName || member.mobile || member.id;
    if (!confirm(`آیا از حذف «${label}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`)) {
      return;
    }

    this.deletingId.set(member.id);
    this.memberService.delete(member.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadMembers(this.searchControl.value);
        this.toast.success('کاربر حذف شد');
      },
      error: (err) => {
        this.deletingId.set(null);
        this.toast.error(err?.error?.message || 'حذف کاربر ناموفق بود');
      },
    });
  }

  private loadMembers(search?: string): void {
    this.loading.set(true);
    this.memberService.list(search).subscribe({
      next: (items) => {
        this.members.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
