// permission.service.ts - COMPLETE FIXED VERSION
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User, RoleObject } from './auth/auth.service'; // Import User interface

// Extend User interface to include is_admin
interface UserWithAdmin extends User {
  is_admin?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private adminStatus: boolean = false;
  private authService = inject(AuthService);
  private router = inject(Router); // Use inject() instead of constructor

  // Use AuthService's methods instead of localStorage directly
  getCurrentUser(): User | null {
    return this.authService.getUser();
  }

  isAuthenticated(): boolean {
    const token = this.authService.getToken();
    return !!token;
  }

  getToken(): string | null {
    return this.authService.getToken();
  }

  // Synchronous method for guards - uses AuthService's data
  isAdmin(): boolean {
    const user = this.authService.getUser() as UserWithAdmin;
    console.log('👑 PermissionService.isAdmin() - User object:', user);

    if (!user) {
      console.log('❌ No user found');
      return false;
    }

    // Check is_admin flag from API response (most reliable)
    if (user.is_admin !== undefined) {
      return user.is_admin === true;
    }

    // Check role_id (admin = 1)
    if (user.role_id === 1) {
      return true;
    }

    // Check role name
    if (user.role && typeof user.role === 'string') {
      return user.role.toLowerCase() === 'admin';
    }

    // Check role object
    if (user.role && typeof user.role === 'object' && user.role !== null) {
      const roleObj = user.role as RoleObject;
      return roleObj.name?.toLowerCase() === 'admin' || 
             roleObj.role_name?.toLowerCase() === 'admin';
    }

    return false;
  }

  // Private method to check admin status with backend
  private async checkAdminStatusWithBackend(token: string): Promise<boolean> {
    try {
      console.log('🔍 Checking admin status with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('📊 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error:', errorText);
        return false;
      }
      
      const userData = await response.json();
      console.log('✅ User data received:', userData);
      
      // Use the explicit is_admin flag from the backend
      const isAdmin = userData.is_admin === true;
      console.log('👤 Admin status determined:', isAdmin);
      
      return isAdmin;
      
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  }

  redirectToLogin(returnUrl: string = ''): void {
    this.router.navigate(['/login'], { 
      queryParams: returnUrl ? { returnUrl } : {} 
    });
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;

    const role = user.role;

    // String-based role
    if (typeof role === 'string') {
      return role.toLowerCase() === roleName.toLowerCase();
    }

    // Object-based role
    if (typeof role === 'object' && role !== null) {
      return (
        role.name?.toLowerCase() === roleName.toLowerCase() ||
        role.role_name?.toLowerCase() === roleName.toLowerCase()
      );
    }

    return false;
  }
  
  canAccess(routePath: string): boolean {
    const publicRoutes = ['/login', '/register'];
    if (publicRoutes.includes(routePath)) return true;
    return this.isAuthenticated();
  }

  // Clear all auth data using AuthService
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.adminStatus = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force cleanup even if API call fails
        this.authService.clearAuthData();
        this.adminStatus = false;
        this.router.navigate(['/login']);
      }
    });
  }

  // Initialize admin status (for use after login)
  async initializeAdminStatus(): Promise<void> {
    const token = this.getToken();
    if (token) {
      this.adminStatus = await this.checkAdminStatusWithBackend(token);
    }
  }
}