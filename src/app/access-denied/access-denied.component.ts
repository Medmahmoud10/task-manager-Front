// access-denied/access-denied.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
  
})
export class AccessDeniedComponent {
  user: any = null;
  isAdmin: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
  // Safely get user data
  this.user = this.authService.getUser();
  this.isAdmin = this.authService.isAdmin();
  
  // DEBUG: Check what's happening with the role
  console.log('🔍 AccessDenied - User:', this.user);
  console.log('🔍 AccessDenied - isAdmin:', this.isAdmin);
  
  // Call debug method to see role structure
  this.authService.debugUserRole();
  
  // If no user is logged in, redirect to login
  if (!this.user) {
    this.router.navigate(['/register']);
    return;
  }
}

  getUserRole(): string {
    // Use the safe method from AuthService
    return this.authService.getUserRoleName();
  }

  logout() {
    this.authService.logout().subscribe(() => {
      // Navigation will be handled by AuthService
      this.router.navigate(['/login']);
    });
  }

}