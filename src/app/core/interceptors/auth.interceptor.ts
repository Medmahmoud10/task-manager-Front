// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🔐 Interceptor - Request URL:', req.url);
  console.log('🔐 Interceptor - Token found:', !!token);
  
  if (token) {
    console.log('🔐 Interceptor - Token value:', token.substring(0, 20) + '...');
    
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Authorization header added to request');
    return next(authReq);
  }

  console.log('ℹ️ No token found, proceeding without authorization header');
  return next(req);
};