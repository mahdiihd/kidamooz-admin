export interface BroadcastNotificationRequest {
  title: string;
  body: string;
  audience: 'all' | 'users';
  userIds?: string[];
  data?: {
    storyId?: string;
  };
}

export interface BroadcastNotificationResponse {
  totalTokens: number;
  successCount: number;
  failureCount: number;
}
