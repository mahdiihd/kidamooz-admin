export const PROGRESS_ICON_OPTIONS = [
  { key: 'star', label: 'ستاره' },
  { key: 'boy', label: 'پسر' },
  { key: 'forest', label: 'جنگل' },
  { key: 'magic', label: 'جادو' },
  { key: 'panda', label: 'پاندا' },
  { key: 'rabbit', label: 'خرگوش' },
  { key: 'rocket', label: 'موشک' },
  { key: 'wolf', label: 'گرگ' },
  { key: 'parry', label: 'پری' },
] as const;

export type ProgressIconKey = (typeof PROGRESS_ICON_OPTIONS)[number]['key'];

export const DEFAULT_PROGRESS_ICON: ProgressIconKey = 'star';

export function progressIconAsset(key: string | null | undefined): string {
  const normalized = PROGRESS_ICON_OPTIONS.some((item) => item.key === key)
    ? key!
    : DEFAULT_PROGRESS_ICON;
  return `assets/progress-icons/progress-${normalized}.png`;
}
