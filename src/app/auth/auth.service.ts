import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, firstValueFrom } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  is_admin?: boolean;
  role?: string | RoleObject;
}

export interface RoleObject {
  id?: number;
  name?: string;
  role_name?: string;
  description?: string;
  permissions?: Permission[];
  [key: string]: any; // Allow other properties
}


export interface Permission {
  id?: number;
  name?: string;
  description?: string;
  [key: string]: any;
}

interface LoginResponse {
  status: string;
  token: string;
  user: User;
  refresh_token?: string;
  message?: string;
}

interface UserWithAdmin extends User {
  is_admin?: boolean;
}

interface TokenRefreshResponse {
  token: string;
  refresh_token?: string;
  user: User;
}

interface LogoutResponse {
  success: boolean;
  message?: string;
}

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  role?: string;
  [key: string]: any;
}

@Injectable()
export class SharedService {
  // Common functionality
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private isBrowser: boolean;
  currentToken: string = ''
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);

  public token$ = this.tokenSubject.asObservable();
  public refreshToken$ = this.refreshTokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('🔧 AuthService initialized, isBrowser:', this.isBrowser);
    this.initializeAuthState();
  }


  getUserData(token: string) {
    // Use the token here instead of getting it from AuthService
    return this.http.get('/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
   }
//  getAuthHeaders() {
//  const token = this.getToken();
//  return {
//    headers: {
//      'Authorization': `Bearer ${token}`,
//      'Content-Type': 'application/json'
//    }
//  };
// }

  private isRoleObject(role: any): role is RoleObject {
  return typeof role === 'object' && role !== null;
}

private isPermissionArray(permissions: any): permissions is any[] {
  return Array.isArray(permissions);
}

  private get storage(): Storage | null {
    return this.isBrowser ? window.localStorage : null;
  }

  private initializeAuthState(): void {
    console.log('🔧 Initializing auth state...');
    if (!this.isBrowser) {
      console.log('🚫 Not in browser environment, skipping auth initialization');
      return;
    }

    try {
      const token = this.storage?.getItem('auth_token');
      const refreshToken = this.storage?.getItem('refresh_token');
      const userStr = this.storage?.getItem('user');

      console.log('📦 Storage items - Token:', !!token, 'RefreshToken:', !!refreshToken, 'User:', !!userStr);

      if (token) {
        const isValid = this.isTokenValid(token);
        console.log('✅ Token validity check:', isValid);
        if (isValid) {
          this.tokenSubject.next(token);
          console.log('🔑 Valid token found and set');
        } else {
          this.storage?.removeItem('auth_token');
          console.log('🗑️ Invalid token removed from storage');
        }
      }

      if (refreshToken) {
        this.refreshTokenSubject.next(refreshToken);
        console.log('🔄 Refresh token found and set');
      }

      if (userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          this.userSubject.next(user);
          console.log('👤 User data parsed and set:', user);
        } catch (e) {
          console.error('❌ Failed to parse user data', e);
          this.storage?.removeItem('user');
        }
      }
    } catch (error) {
      console.error('💥 Auth state initialization failed', error);
      this.clearAuthData();
    }
  }

  getToken(): string | null {
    const token = this.storage?.getItem('auth_token') || null;
    console.log('🔑 getToken() returned:', token ? `${token.substring(0, 10)}...` : 'null');
    return token;
  }

//  isAuthenticated(): boolean {
//  const token = this.getToken();
//  return !!token; // Simple check - just verify token exists
// }

  setToken(token: string): void {
    console.log('💾 Setting token...');
    this.validateToken(token);
    try {
      const cleanToken = this.cleanToken(token);
      this.storage?.setItem('auth_token', cleanToken);
      this.tokenSubject.next(cleanToken);
      console.log('✅ Token set successfully');
    } catch (error) {
      console.error('❌ Failed to set token:', error);
      throw error;
    }
  }

  getRefreshToken(): string | null {
    const refreshToken = this.refreshTokenSubject.value;
    console.log('🔄 getRefreshToken() returned:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'null');
    return refreshToken;
  }

  setRefreshToken(refreshToken: string): void {
    console.log('💾 Setting refresh token...');
    try {
      const cleanRefreshToken = this.cleanToken(refreshToken);
      this.storage?.setItem('refresh_token', cleanRefreshToken);
      this.refreshTokenSubject.next(cleanRefreshToken);
      console.log('✅ Refresh token set successfully');
    } catch (error) {
      console.error('❌ Failed to set refresh token:', error);
    }
  }

  getUser(): User | null {
    const user = this.userSubject.value;
    console.log('👤 getUser() returned:', user);
    return user;

  }

  setUser(user: User): void {
    console.log('💾 Setting user data...', user);
    try {
      this.storage?.setItem('user', JSON.stringify(user));
      this.userSubject.next(user);
      console.log('✅ User data set successfully');
    } catch (error) {
      console.error('❌ Failed to set user:', error);
    }
  }



  getUserPermissions(): string[] {
  const user = this.getUser();
  const permissions: string[] = [];

  if (!user || !user.role) {
    return permissions;
  }

  const role = user.role;

  // Handle string role
  if (typeof role === 'string') {
    if (role === 'admin' || role === 'administrator') {
      permissions.push('admin_access');
      permissions.push('manage_tasks');
      permissions.push('manage_categories');
      permissions.push('manage_users');
      permissions.push('view_tasks');
      permissions.push('view_profile');
    } else {
      permissions.push('view_tasks');
      permissions.push('edit_own_tasks');
      permissions.push('update_task_status');
    }
    return permissions;
  }

  // Handle object role
  if (typeof role === 'object' && role !== null) {
    // Admin role has all permissions
    if (role.name === 'admin' || role.role_name === 'admin') {
      permissions.push('admin_access');
      permissions.push('manage_tasks');
      permissions.push('manage_categories');
      permissions.push('manage_users');
      permissions.push('view_tasks');
      permissions.push('view_profile');
      return permissions;
    }

    // Extract permissions from role object
    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach((p: any) => {
        if (typeof p === 'string') {
          permissions.push(p);
        } else if (p && p.name) {
          permissions.push(p.name);
        }
      });
    }
  }

  return permissions;

}


  private cleanToken(token: string): string {
    const cleaned = token.trim().replace(/^["']|["']$/g, '');
    console.log('🧹 Token cleaned:', cleaned.substring(0, 10) + '...');
    return cleaned;
  }

  private storeAuthData(response: LoginResponse | TokenRefreshResponse): void {
  console.log('💾 Storing auth data from response:', response);

  if (!response || !response.token || !response.user) {
    console.error('❌ Invalid response format for auth data storage');
    throw new Error('Invalid response format');
  }

  try {
    // Clean and store the main token
    const cleanToken = this.cleanToken(response.token);
    this.storage?.setItem('auth_token', cleanToken);
    this.tokenSubject.next(cleanToken);
    console.log('✅ Main token stored:', cleanToken.substring(0, 10) + '...');

    // Store refresh token if provided (for login responses)
    if ('refresh_token' in response && response.refresh_token) {
      const cleanRefreshToken = this.cleanToken(response.refresh_token);
      this.storage?.setItem('refresh_token', cleanRefreshToken);
      this.refreshTokenSubject.next(cleanRefreshToken);
      console.log('✅ Refresh token stored:', cleanRefreshToken.substring(0, 10) + '...');
    } else {
      console.log('ℹ️ No refresh token provided in response');
    }

    // Store user data
    const userJson = JSON.stringify(response.user);
    this.storage?.setItem('user', userJson);
    this.userSubject.next(response.user);
    console.log('✅ User data stored:', response.user);

    console.log('✅ All auth data stored successfully');

  } catch (error) {
    console.error('❌ Storage error:', error);
    throw error;
  }
}

  private validateToken(token: string): void {
  console.log('🔍 Validating token format...');

  if (typeof token !== 'string') {
    throw new Error('Token must be a string');
  }

  if (!token || token.trim().length === 0) {
    throw new Error('Token cannot be empty');
  }

  // For Sanctum tokens, they should contain a pipe character
  if (!token.includes('|')) {
    console.warn('⚠️ Token may not be standard Sanctum format (missing pipe)');
  }

  console.log('✅ Token format validation passed');
}

  async tryRefreshToken(): Promise<boolean> {
    console.log('🔄 AuthService.tryRefreshToken() called');

    const refreshToken = this.getRefreshToken();
    console.log('🔄 Refresh token exists:', !!refreshToken);
    console.log('🔑 Refresh token:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'null');

    if (!refreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }

    try {
      console.log('🔄 Attempting token refresh API call...');
      const response = await firstValueFrom(
        this.http.post<TokenRefreshResponse>(
          `${this.apiUrl}/refresh`,
          { refresh_token: refreshToken }
        )
      );

      console.log('✅ Token refresh API response:', response);

      if (response?.token) {
        console.log('✅ New token received');
        const currentUser = this.getUser();
        console.log('👤 Current user data:', currentUser);

        if (!currentUser) {
          console.log('❌ No user data available during refresh');
          throw new Error('No user data available during refresh');
        }

        console.log('💾 Storing new auth data...');
        this.storeAuthData(response);

        console.log('✅ Token refresh completed successfully');
        return true;
      }

      console.log('❌ No token in refresh response');
      return false;

    } catch (error) {
      console.error('💥 Token refresh failed:', error);
      console.log('🧹 Clearing auth data due to refresh failure');
      this.clearAuthData();
      return false;
    }
  }

  logout(): Observable<LogoutResponse> {
    console.log('🚪 Logout initiated');
    const refreshToken = this.getRefreshToken();
    this.clearAuthData();

    if (refreshToken) {
      console.log('🔄 Sending logout API request with refresh token');
      return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, {
        refresh_token: refreshToken
      }).pipe(
        catchError(error => {
          console.error('❌ Logout API error:', error);
          return of({ success: false, message: error.message });
        })
      );
    }
    console.log('✅ Logout completed (no refresh token)');
    return of({ success: true });
  }

  clearAuthData(): void {
    console.log('🧹 Clearing auth data...');
    try {
      this.storage?.removeItem('auth_token');
      this.storage?.removeItem('refresh_token');
      this.storage?.removeItem('user');
      console.log('✅ Auth data cleared from storage');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }

    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.userSubject.next(null);
    console.log('✅ Auth subjects cleared');

    if (this.isBrowser) {
      console.log('🧭 Navigating to login page');
      this.router.navigate(['/login']);
    }
  }

  private extractRoleName(role: any): string | null {
  if (typeof role === 'string') {
    return role;
  }

  if (typeof role === 'object' && role !== null) {
    // Check for all possible role property names
    return role.name || role.role_name || role.roleName || role.role || null;
  }

  return null;
}

  // auth.service.ts - UPDATE THIS METHOD:
// In your auth.service.ts - UPDATED METHODS
// In your auth.service.ts - UPDATED METHODS
isAdmin(): boolean {
  const user = this.getUser() as UserWithAdmin;
  console.log('👑 isAdmin() - User object:', user);

  if (user?.is_admin !== undefined) {
    return user.is_admin === true;
  }

  // Check is_admin flag from API response (most reliable)
  if (user.hasOwnProperty('is_admin')) {
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

  return false;
}

isAuthenticated(): boolean {
  const token = this.getToken();
  // For a more robust check, you could verify token validity
  return !!token && this.isTokenValid(token);
}

// Also make sure you have this method:
private isTokenValid(token: string): boolean {
  // Add your token validation logic here
  // For Sanctum tokens, you might just check if it's not empty
  return token.length > 0 && token.includes('|');
}

getUserRoleName(): string {
  const user = this.getUser();
  if (!user) return 'unknown';

  // Check role_id first (your Laravel structure)
  if (user.role_id !== undefined) {
    console.log('✅ Using role_id:', user.role_id);
    // Map role_id to role name based on your database
    switch(user.role_id) {
      case 1: return 'admin';
      case 2: return 'user';
      default: return `role_${user.role_id}`;
    }
  }

  // Fallback to role property
  if (user.role) {
    const role = user.role;

    // Handle string role
    if (typeof role === 'string') {
      return role;
    }

    // Handle object role
    if (typeof role === 'object' && role !== null) {
      return role.name || role.role_name || 'unknown';
    }
  }

  return 'unknown';
}


// Add this method for permission checking:
hasPermission(permissionName: string): boolean {
  const user = this.getUser();
  if (!user || !user.role) return false;

  // Admin has all permissions
  if (this.isAdmin()) return true;

  const role = user.role;

  // Check if role has permissions array
  if (typeof role === 'object' && role !== null && role.permissions && Array.isArray(role.permissions)) {
    return role.permissions.some((permission: any) => {
      // Check both permission object and string formats
      if (typeof permission === 'string') {
        return permission === permissionName;
      }
      if (typeof permission === 'object' && permission.name) {
        return permission.name === permissionName;
      }
      return false;
    });
  }

  return false;
}

// In auth.service.ts - make sure this method is safe


// Add this method to your auth.service.ts
// In your auth.service.ts
login(credentials: any): Observable<any> {
  return this.http.post('http://localhost:8000/api/login', credentials).pipe(
    map((response: any) => {
      console.log('🔑 AuthService response:', response);
      
      // Store the user data immediately
      if (response.user) {
        this.setUser(response.user);
      }
      
      // Make sure the token is properly returned
      if (response.token) {
        return response;
      } else if (response.access_token) {
        return { ...response, token: response.access_token };
      } else {
        throw new Error('No token in response');
      }
    }),
    catchError(error => {
      console.error('❌ AuthService error:', error);
      return throwError(error);
    })
  );
}

debugUserRole() {
  const user = this.getUser();
  console.log('🐛 DEBUG - Full user object:', user);

  if (user) {
    console.log('🐛 DEBUG - User role_id:', user.role_id);
    console.log('🐛 DEBUG - User role property:', user.role);

    if (user.role) {
      console.log('🐛 DEBUG - Role type:', typeof user.role);

      if (typeof user.role === 'object') {
        console.log('🐛 DEBUG - Role object keys:', Object.keys(user.role));
      }
    }
  }
}


  // In your AuthService, add this debug method:
// auth.service.ts - ADD THIS METHOD:
debugUserStructure(): void {
  const user = this.getUser();
  console.log('🔍 DEBUG - Full user object:', user);
  console.log('🔍 DEBUG - User role structure:', user?.role);
  console.log('🔍 DEBUG - User role type:', typeof user?.role);

  if (user?.role && this.isRoleObject(user.role)) {
    console.log('🔍 DEBUG - Role properties:', Object.keys(user.role));
    console.log('🔍 DEBUG - Role object:', user.role);

    if (this.isPermissionArray(user.role.permissions)) {
      console.log('🔍 DEBUG - Permissions:', user.role.permissions);
    }
  }
}

// Call this in your component to see the actual structure:
// this.authService.debugUserStructure();

  getCurrentUser(): any | null {
    return this.getUser();
  }

  updateUserData(user: User): void {
    console.log('📝 Updating user data:', user);
    this.setUser(user);
  }

  getTokenExpiration(): Date | null {
    console.log('⏰ Getting token expiration...');
    const token = this.getToken();
    if (!token) {
      console.log('❌ No token available for expiration check');
      return null;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const expiration = decoded.exp ? new Date(decoded.exp * 1000) : null;
      console.log('✅ Token expiration:', expiration);
      return expiration;
    } catch (error) {
      console.error('❌ Error getting token expiration:', error);
      return null;
    }
  }

  async initializeApp(): Promise<boolean> {
    console.log('🚀 Initializing app...');
    if (!this.isBrowser) {
      console.log('🚫 Not in browser environment');
      return false;
    }

    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    console.log('📋 Initial state - Token:', !!token, 'RefreshToken:', !!refreshToken);

    if (!token && !refreshToken) {
      console.log('❌ No tokens available for initialization');
      return false;
    }

    if (token && this.isTokenValid(token)) {
      console.log('✅ Valid token found, app initialized');
      return true;
    }

    if (refreshToken) {
      console.log('🔄 Attempting token refresh for app initialization');
      return await this.tryRefreshToken();
    }

    console.log('❌ App initialization failed');
    return false;
  }
}
