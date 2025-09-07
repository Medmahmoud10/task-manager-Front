import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { Router } from '@angular/router';
=======
import { CanActivate, Router } from '@angular/router';
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
<<<<<<< HEAD

export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}
=======
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}