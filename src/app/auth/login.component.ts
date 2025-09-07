import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { PermissionService } from '../permission.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  isCheckingEmail = false;
  errorMessage = '';
  emailMessage = '';
  emailExists = false;

  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private http = inject(HttpClient);

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.authService.login(this.credentials).toPromise();
      
      if (response && response.token) {
        // Store auth data through AuthService
        this.authService.setToken(response.token);
        if (response.user) {
          this.authService.setUser(response.user);
        }
        
        // Initialize admin status
        await this.permissionService.initializeAdminStatus();
        
        // Navigate based on admin status
        if (this.permissionService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/tasks']);
        }
      }
    } catch (error: any) {
      this.handleLoginError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async debugCheckAdminStatus(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    console.log('🔍 DEBUG: Token from localStorage:', token);
    
    if (token) {
      console.log('🔍 DEBUG: Calling backend API...');
      try {
        const response = await fetch('http://localhost:8000/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('🔍 DEBUG: API response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('🔍 DEBUG: Full user data:', userData);
          
          // Check ALL possible admin fields
          console.log('🔍 DEBUG: role:', userData.role);
          console.log('🔍 DEBUG: is_admin:', userData.is_admin);
          console.log('🔍 DEBUG: user_type:', userData.user_type);
          console.log('🔍 DEBUG: isAdmin:', userData.isAdmin);
        }
      } catch (error) {
        console.error('🔍 DEBUG: API call failed:', error);
      }
    }
  }

  private handleLoginError(error: any): void {
    this.errorMessage = this.determineErrorMessage(error);

    // Clear auth data if the error is token-related
    if (error.message?.includes('Invalid JWT') || error.status === 401) {
      this.authService.clearAuthData();
      this.permissionService.logout();
    }
  }

  private determineErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Invalid email or password';
    } else if (error.message?.includes('Invalid JWT')) {
      return 'Authentication error - please try again';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Login failed. Please try again later.';
    }
  }

  checkEmail() {
    if (!this.credentials.email) {
      this.emailMessage = '';
      this.emailExists = false;
      return;
    }

    this.isCheckingEmail = true;
    this.emailMessage = 'Checking email...';

    this.http.post<{ exists: boolean }>('http://localhost:8000/api/check-email', {
      email: this.credentials.email
    }).pipe(
      finalize(() => this.isCheckingEmail = false)
    ).subscribe({
      next: (response) => {
        this.emailExists = response.exists;
        this.emailMessage = response.exists ?
          'Email exists in our system' :
          'Email not found';
      },
      error: (error) => {
        console.error('Email check failed:', error);
        this.emailMessage = 'Error checking email.';
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}