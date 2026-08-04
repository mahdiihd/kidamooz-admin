export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

export interface BarItem {
  label: string;
  value: number;
  percent: number;
  color: string;
}

const DonutCircumference = 2 * Math.PI * 42;

export function buildDonutSegments(slices: ChartSlice[]): DonutSegment[] {
  const total = slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);
  if (total <= 0) {
    return [
      {
        label: 'بدون داده',
        value: 0,
        color: '#e4e2ec',
        dashArray: `${DonutCircumference} ${DonutCircumference}`,
        dashOffset: 0,
      },
    ];
  }

  let offset = 0;
  return slices
    .filter((slice) => slice.value > 0)
    .map((slice) => {
      const length = (slice.value / total) * DonutCircumference;
      const segment: DonutSegment = {
        label: slice.label,
        value: slice.value,
        color: slice.color,
        dashArray: `${length} ${DonutCircumference}`,
        dashOffset: -offset,
      };
      offset += length;
      return segment;
    });
}

export function buildBars(
  items: { label: string; value: number; color: string }[]
): BarItem[] {
  const max = Math.max(...items.map((item) => item.value), 1);
  return items.map((item) => ({
    label: item.label,
    value: item.value,
    percent: Math.max(4, Math.round((item.value / max) * 100)),
    color: item.color,
  }));
}

export function donutTotal(slices: ChartSlice[]): number {
  return slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);
}

export const DONUT_CIRCUMFERENCE = DonutCircumference;
