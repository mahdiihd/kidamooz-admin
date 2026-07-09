import { Pipe, PipeTransform } from '@angular/core';
import { StoryAccess, StoryVisibility } from '../../core/models/story-access.model';

const VISIBILITY_LABELS: Record<StoryVisibility, string> = {
  public: 'عمومی',
  restricted: 'محدود',
};

@Pipe({ name: 'storyVisibility', standalone: true })
export class StoryVisibilityPipe implements PipeTransform {
  transform(access: StoryAccess | null | undefined): string {
    if (!access) {
      return VISIBILITY_LABELS.public;
    }
    return VISIBILITY_LABELS[access.visibility] ?? access.visibility;
  }
}

@Pipe({ name: 'storyAudienceSummary', standalone: true })
export class StoryAudienceSummaryPipe implements PipeTransform {
  transform(
    access: StoryAccess | null | undefined,
    segments: { id: string; label: string }[] = [],
    users: { id: string; label: string }[] = [],
  ): string {
    if (!access || access.visibility === 'public') {
      return 'همه کاربران';
    }

    const parts: string[] = [];
    const segmentLabels = access.audience.segmentIds
      .map((id) => segments.find((s) => s.id === id)?.label ?? id)
      .filter(Boolean);
    const userLabels = access.audience.userIds
      .map((id) => users.find((u) => u.id === id)?.label ?? id)
      .filter(Boolean);

    if (segmentLabels.length) {
      parts.push(segmentLabels.join('، '));
    }
    if (userLabels.length) {
      parts.push(`${userLabels.length} کاربر`);
    }

    return parts.length ? parts.join(' + ') : 'مخاطب تعیین نشده';
  }
}
