import { Component } from '@angular/core';

@Component({
  selector: 'app-drag-handle',
  standalone: true,
  template: `<span class="drag-handle" title="بکشید برای جابجایی">⠿</span>`,
  styles: `
    .drag-handle {
      cursor: grab;
      color: var(--text-muted);
      font-size: 1.125rem;
      user-select: none;
      padding: 0.25rem;

      &:active {
        cursor: grabbing;
      }
    }
  `,
})
export class DragHandleComponent {}

export function reorderItems<T extends { id: string }>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}
