export interface WeeklyChallenge {
  id: string;
  titleFa: string;
  themeTag: string;
  descriptionFa: string;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  createdAt: string;
}

export interface UpsertWeeklyChallengeRequest {
  titleFa: string;
  themeTag: string;
  descriptionFa: string;
  weekStart: string;
  weekEnd?: string | null;
  isActive: boolean;
}
