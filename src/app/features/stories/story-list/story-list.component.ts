import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StoryService } from '../../../core/services/story.service';
import { CategoryService } from '../../../core/services/category.service';
import { AudienceService } from '../../../core/services/audience.service';
import { ToastService } from '../../../core/services/toast.service';
import { Story } from '../../../core/models/story.model';
import { Category } from '../../../core/models/category.model';
import { AudienceSegment, AudienceUser } from '../../../core/models/story-access.model';
import { environment } from '../../../../environments/environment';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { VisibilityBadgeComponent } from '../../../shared/components/visibility-badge/visibility-badge.component';
import { DragHandleComponent, reorderItems } from '../../../shared/components/drag-handle/drag-handle.component';
import { LocalizedPipe } from '../../../shared/pipes/localized.pipe';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { StoryAudienceSummaryPipe } from '../../../shared/pipes/story-visibility.pipe';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    VisibilityBadgeComponent,
    DragHandleComponent,
    LocalizedPipe,
    DurationPipe,
    StoryAudienceSummaryPipe,
    RouterLink,
  ],
  templateUrl: './story-list.component.html',
  styleUrl: './story-list.component.scss',
})
export class StoryListComponent implements OnInit {
  private readonly storyService = inject(StoryService);
  private readonly categoryService = inject(CategoryService);
  private readonly audienceService = inject(AudienceService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly stories = signal<Story[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly segments = signal<AudienceSegment[]>([]);
  readonly users = signal<AudienceUser[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly viewMode = signal<ViewMode>('grid');
  readonly sortMode = signal(false);
  readonly savingOrder = signal(false);
  readonly dragIndex = signal<number | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    categoryId: [''],
    ageMin: ['' as string | number],
    ageMax: ['' as string | number],
    featured: [''],
    published: [''],
    visibility: [''],
  });

  ngOnInit(): void {
    const featured = this.route.snapshot.queryParamMap.get('featured');
    if (featured) {
      this.filterForm.patchValue({ featured });
    }

    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
    });
    this.audienceService.getSegments().subscribe({
      next: (items) => this.segments.set(items),
    });
    this.audienceService.getUsers().subscribe({
      next: (items) => this.users.set(items),
    });
    this.loadStories();
  }

  applyFilter(): void {
    this.loadStories();
  }

  resetFilter(): void {
    this.filterForm.reset({
      categoryId: '',
      ageMin: '',
      ageMax: '',
      featured: '',
      published: '',
      visibility: '',
    });
    this.loadStories();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'grid') {
      this.sortMode.set(false);
    }
  }

  toggleSortMode(): void {
    this.sortMode.update((v) => !v);
    if (this.sortMode()) {
      this.viewMode.set('list');
    }
  }

  onDragStart(index: number): void {
    this.dragIndex.set(index);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(targetIndex: number): void {
    const fromIndex = this.dragIndex();
    if (fromIndex === null || fromIndex === targetIndex) {
      return;
    }
    this.stories.set(reorderItems(this.stories(), fromIndex, targetIndex));
    this.dragIndex.set(null);
  }

  saveOrder(): void {
    this.savingOrder.set(true);
    const ids = this.stories().map((s) => s.id);
    this.storyService.reorder(ids).subscribe({
      next: () => {
        this.sortMode.set(false);
        this.savingOrder.set(false);
        this.loadStories();
        this.toast.success('ترتیب قصه‌ها ذخیره شد');
      },
      error: () => {
        this.savingOrder.set(false);
        this.toast.error('خطا در ذخیره ترتیب');
      },
    });
  }

  togglePublish(story: Story): void {
    this.storyService.publish(story.id, !story.published).subscribe({
      next: () => {
        this.loadStories();
        this.toast.success(story.published ? 'انتشار لغو شد' : 'قصه منتشر شد');
      },
    });
  }

  toggleFeatured(story: Story): void {
    this.storyService.toggleFeatured(story.id, !story.featured).subscribe({
      next: () => {
        this.loadStories();
        this.toast.success(story.featured ? 'از ویژه خارج شد' : 'به ویژه اضافه شد');
      },
    });
  }

  deleteStory(story: Story): void {
    const title = story.title.fa || story.title.en;
    if (!confirm(`آیا از حذف «${title}» مطمئن هستید؟`)) {
      return;
    }
    this.storyService.delete(story.id).subscribe({
      next: () => {
        this.loadStories();
        this.toast.success('قصه حذف شد');
      },
    });
  }

  getCategoryTitle(categoryId: string): string {
    const cat = this.categories().find((c) => c.id === categoryId);
    return cat?.title.fa || categoryId;
  }

  getMobilePreviewUrl(storyId: string): string {
    return `${environment.mobileAppDeepLink}/${storyId}`;
  }

  private loadStories(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    const ageMin = raw.ageMin === '' ? undefined : Number(raw.ageMin);
    const ageMax = raw.ageMax === '' ? undefined : Number(raw.ageMax);

    this.storyService
      .getAll({
        categoryId: raw.categoryId || undefined,
        ageMin,
        ageMax,
        featured: raw.featured === '' ? undefined : raw.featured === 'true',
        published: raw.published === '' ? undefined : raw.published === 'true',
        visibility: raw.visibility === '' ? undefined : (raw.visibility as 'public' | 'restricted'),
        limit: 100,
        sortBy: 'sortOrder',
      })
      .subscribe({
        next: (response) => {
          this.stories.set(response.items);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
