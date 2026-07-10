export type AdminRole = 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  displayName: string;
  role: AdminRole;
}

export interface ResetAdminPasswordRequest {
  password: string;
}
