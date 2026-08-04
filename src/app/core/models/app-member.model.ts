export interface AppMember {
  id: string;
  displayName: string;
  mobile: string | null;
  email: string;
  planTier: string;
  plusExpiresAt: string | null;
  listenStreak: number;
  createStreak: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
