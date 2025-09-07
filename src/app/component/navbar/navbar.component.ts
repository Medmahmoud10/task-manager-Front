// src/app/component/navbar/navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isMenuOpen: boolean = false;
  isAuthenticated: boolean = false;
  isAdmin: boolean = false; 
  userName: string = ''; 
  taskCount: number = 0; 

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check initial authentication state
    this.checkAuthStatus();
    
    // You can also set up polling or event-based updates if needed
    setInterval(() => {
      this.checkAuthStatus();
    }, 5000); // Check every 5 seconds
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  checkAuthStatus(): void {
    // Use the methods that actually exist in your AuthService
    this.isAuthenticated = this.authService.getToken() !== null;
    
    if (this.isAuthenticated) {
      this.checkAdminStatus();
      this.getUserInfo();
      this.getTaskCount();
    } else {
      this.isAdmin = false;
      this.userName = '';
      this.taskCount = 0;
    }
  }

  checkAdminStatus(): void {
    // Use the method that exists in your AuthService
    this.isAdmin = this.authService.isAdmin();
  }

  getUserInfo(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.first_name || user.username || user.email || 'User';
    }
  }

  getTaskCount(): void {
    // Placeholder - you'll need to implement this with your task service
    this.taskCount = 12; // Example count
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.userName = '';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Force logout even if API call fails
        this.authService.clearAuthData();
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.userName = '';
        this.router.navigate(['/login']);
      }
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}