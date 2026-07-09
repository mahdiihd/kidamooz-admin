import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DragHandleComponent, reorderItems } from '../../../shared/components/drag-handle/drag-handle.component';
import { LocalizedPipe } from '../../../shared/pipes/localized.pipe';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    DragHandleComponent,
    LocalizedPipe,
    RouterLink,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly sortMode = signal(false);
  readonly savingOrder = signal(false);
  readonly dragIndex = signal<number | null>(null);

  ngOnInit(): void {
    this.loadCategories();
  }

  toggleSortMode(): void {
    this.sortMode.update((v) => !v);
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
    const reordered = reorderItems(this.categories(), fromIndex, targetIndex);
    this.categories.set(reordered);
    this.dragIndex.set(null);
  }

  saveOrder(): void {
    this.savingOrder.set(true);
    const ids = this.categories().map((c) => c.id);
    this.categoryService.reorder(ids).subscribe({
      next: (items) => {
        this.categories.set(items);
        this.sortMode.set(false);
        this.savingOrder.set(false);
        this.toast.success('ترتیب دسته‌ها ذخیره شد');
      },
      error: () => {
        this.savingOrder.set(false);
        this.toast.error('خطا در ذخیره ترتیب');
      },
    });
  }

  togglePublish(category: Category): void {
    this.categoryService.publish(category.id, !category.published).subscribe({
      next: () => {
        this.loadCategories();
        this.toast.success(category.published ? 'انتشار لغو شد' : 'دسته منتشر شد');
      },
    });
  }

  deleteCategory(category: Category): void {
    const title = category.title.fa || category.title.en;
    if (!confirm(`آیا از حذف «${title}» مطمئن هستید؟`)) {
      return;
    }
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.loadCategories();
        this.toast.success('دسته حذف شد');
      },
    });
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (items) => {
        this.categories.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
