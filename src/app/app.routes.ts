import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from './permission.service';
import { TasksComponent } from './tasks/tasks.component';
import { ProfileComponent } from './profile/profile.component';
import { CategoriesComponent } from './categories/categories.component';
import { UsersComponent } from './users/users.component';
<<<<<<< HEAD
import { AdminDashboardComponent } from '../app/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

// Functional guard for authentication
const authGuard = () => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const isAuthenticated = permissionService.isAuthenticated();
  
  console.log('Auth guard - User authenticated:', isAuthenticated);
  
  if (isAuthenticated) {
    return true;
  }
  
  console.log('Auth guard - Redirecting to login');
  permissionService.redirectToLogin();
  return false;
};

// Functional guard for admin role
const adminGuard = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  
  const isAdmin = permissionService.isAdmin();
  const message = route.data['deniedMessage'] || 'Access denied';
  
  if (isAdmin) return true;
  
  window.alert(message);
  router.navigate(['/tasks']);
  return false;
};

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' }, // Changed to redirect to tasks
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'tasks', 
    component: TasksComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'profile/:id', 
    component: ProfileComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'categories', 
    component: CategoriesComponent,
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'users', 
    component: UsersComponent,
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard]
    // REMOVE the data property - it's not used in your current guard
  },
  { path: '**', component: PageNotFoundComponent } // 404 page
];
=======
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
  // { 
  //   path: '**', 
  //   component: NotFoundComponent,
  //   title: 'Page Not Found'
  // }
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
