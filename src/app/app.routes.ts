import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list/category-list.component').then(
            (m) => m.CategoryListComponent,
          ),
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./features/categories/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('./features/categories/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: 'stories',
        loadComponent: () =>
          import('./features/stories/story-list/story-list.component').then(
            (m) => m.StoryListComponent,
          ),
      },
      {
        path: 'stories/new',
        loadComponent: () =>
          import('./features/stories/story-form/story-form.component').then(
            (m) => m.StoryFormComponent,
          ),
      },
      {
        path: 'stories/:id/edit',
        loadComponent: () =>
          import('./features/stories/story-form/story-form.component').then(
            (m) => m.StoryFormComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./features/users/user-form/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'audit-log',
        loadComponent: () =>
          import('./features/audit-log/audit-log.component').then((m) => m.AuditLogComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
