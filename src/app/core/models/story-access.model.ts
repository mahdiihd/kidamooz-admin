export type StoryVisibility = 'public' | 'restricted';

export interface StoryAudience {
  segmentIds: string[];
  userIds: string[];
}

export interface StoryAccess {
  visibility: StoryVisibility;
  audience: StoryAudience;
}

export interface AudienceSegment {
  id: string;
  label: string;
  description: string;
}

export interface AudienceUser {
  id: string;
  label: string;
  email: string;
}

export const DEFAULT_STORY_ACCESS: StoryAccess = {
  visibility: 'public',
  audience: { segmentIds: [], userIds: [] },
};

export function normalizeStoryAccess(access?: Partial<StoryAccess> | null): StoryAccess {
  if (!access) {
    return structuredClone(DEFAULT_STORY_ACCESS);
  }

  return {
    visibility: access.visibility ?? 'public',
    audience: {
      segmentIds: access.audience?.segmentIds ?? [],
      userIds: access.audience?.userIds ?? [],
    },
  };
}
