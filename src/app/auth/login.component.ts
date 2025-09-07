<<<<<<< HEAD
import { Component, inject } from '@angular/core';
=======
import { Component } from '@angular/core';
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
<<<<<<< HEAD
import { PermissionService } from '../permission.service';
import { finalize } from 'rxjs/operators';
=======
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
<<<<<<< HEAD
  styleUrls: ['./login.component.scss']
=======
  styleUrl: './login.component.scss'
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
<<<<<<< HEAD

=======
  
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
  isLoading = false;
  isCheckingEmail = false;
  errorMessage = '';
  emailMessage = '';
  emailExists = false;

<<<<<<< HEAD
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
=======
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  private loadUsersFromDatabase(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      console.log('Loading users from database...');
      this.http.get<any>('http://localhost:8000/api/users').subscribe({
        next: (response) => {
          console.log('Raw API response:', response);
          let users = [];
          
          if (Array.isArray(response)) {
            users = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            users = response.data;
          } else if (response && response.users && Array.isArray(response.users)) {
            users = response.users;
          } else {
            console.error('Unexpected response format:', response);
            users = [];
          }
          
          console.log('Processed users:', users);
          console.log('Total users found:', users.length);
          resolve(users);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          reject(error);
        }
      });
    });
  }

  async checkEmail() {
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
    if (!this.credentials.email) {
      this.emailMessage = '';
      this.emailExists = false;
      return;
    }

    this.isCheckingEmail = true;
<<<<<<< HEAD
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
=======
    this.emailMessage = '';

    try {
      const users = await this.loadUsersFromDatabase();
      const userExists = users.some((user: any) => {
        console.log('Checking user:', user.email, 'against:', this.credentials.email);
        return user.email === this.credentials.email;
      });
      
      this.emailExists = userExists;
      this.emailMessage = userExists ? 'Valid email' : 'Email not registered';
      console.log('Email check result:', userExists ? 'FOUND' : 'NOT FOUND');
    } catch (error) {
      console.error('Error checking email:', error);
      this.emailMessage = 'Unable to verify email';
      this.emailExists = false;
    } finally {
      this.isCheckingEmail = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private validateCredentials(users: any[], email: string, password: string): { isValid: boolean, user: any } {
    console.log('=== CREDENTIAL VALIDATION START ===');
    console.log('Input email:', email);
    console.log('Input password:', password);
    console.log('Total users in database:', users.length);
    
    // Log all users for debugging
    users.forEach((u, index) => {
      console.log(`User ${index}:`, {
        id: u.id,
        email: u.email,
        password: u.password,
        username: u.username
      });
    });
    
    const user = users.find((u: any) => {
      const emailMatch = u.email === email;
      console.log(`Checking user ${u.id}: email '${u.email}' === '${email}' = ${emailMatch}`);
      return emailMatch;
    });
    
    if (!user) {
      console.log('❌ EMAIL NOT FOUND in database');
      return { isValid: false, user: null };
    }
    
    console.log('✅ EMAIL FOUND - User details:', user);
    console.log('Database password:', `'${user.password}'`);
    console.log('Input password:', `'${password}'`);
    console.log('Password types:', typeof user.password, 'vs', typeof password);
    console.log('Password lengths:', user.password?.length, 'vs', password.length);
    
    const passwordMatch = user.password === password;
    console.log('Password match result:', passwordMatch ? '✅ MATCH' : '❌ NO MATCH');
    console.log('=== CREDENTIAL VALIDATION END ===');
    
    return { isValid: passwordMatch, user: user };
  }

  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      // Simple hash comparison - you might need bcrypt for production
      // For now, let's try direct comparison and also check if it's a Laravel hash
      console.log('Comparing passwords:');
      console.log('Plain:', plainPassword);
      console.log('Hashed:', hashedPassword);
      
      // If password starts with $2y$ it's a Laravel bcrypt hash
      if (hashedPassword.startsWith('$2y$') || hashedPassword.startsWith('$2b$')) {
        // For Laravel hashed passwords, we'll use the Laravel API to verify
        return false; // Will be handled by API call
      }
      
      // Direct comparison for plain text (development)
      return plainPassword === hashedPassword;
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
  }

  async onSubmit() {
    console.log('🚀 LOGIN BUTTON CLICKED!');
    console.log('Email input:', this.credentials.email);
    
    if (!this.credentials.email || !this.credentials.password) {
      console.log('❌ Missing fields');
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log('⏳ Loading started...');

    try {
      console.log('📡 Loading users from database...');
      const users = await this.loadUsersFromDatabase();
      console.log('✅ Users loaded, count:', users.length);
      
      // Find user by email
      console.log('🔍 Searching for email:', this.credentials.email);
      console.log('📋 All users emails:', users.map(u => u.email));
      
      const user = users.find((u: any) => {
        console.log(`Comparing: '${u.email}' === '${this.credentials.email}' = ${u.email === this.credentials.email}`);
        return u.email === this.credentials.email;
      });
      
      if (!user) {
        console.log('❌ Email not found in database');
        console.log('Available emails:', users.map(u => u.email));
        this.errorMessage = 'Invalid email or password';
        this.isLoading = false;
        return;
      }
      
      console.log('✅ Email found, checking password...');
      console.log('User found:', user);
      console.log('All user fields:', Object.keys(user));
      console.log('Password field exists:', 'password' in user);
      console.log('Password value:', user.password);
      
      if (!user.password) {
        console.log('❌ PASSWORD FIELD IS MISSING OR UNDEFINED!');
        console.log('This means the API is not returning passwords for security.');
        console.log('We need to use Laravel login API instead.');
        
        // Since password is not available, use Laravel API
        console.log('📡 Calling Laravel login API...');
        
        // Add password_confirmation for Laravel validation
        const loginData = {
          email: this.credentials.email,
          password: this.credentials.password,
          password_confirmation: this.credentials.password
        };
        
        console.log('Sending login data:', loginData);
        
        this.http.post<any>('http://localhost:8000/api/login', loginData).subscribe({
          next: (response) => {
            console.log('✅ LOGIN SUCCESS via Laravel API');
            console.log('Laravel response:', response);
            
            // Store the token
            if (response.token) {
              localStorage.setItem('token', response.token);
            }
            
            this.router.navigate(['/tasks']);
            this.isLoading = false;
          },
          error: (error) => {
            console.log('❌ Laravel login failed');
            console.log('Error details:', error);
            console.log('Error status:', error.status);
            console.log('Error message:', error.error);
            this.errorMessage = 'Invalid email or password';
            this.isLoading = false;
          }
        });
        return;
      }
      
      // Check if password is hashed (Laravel format)
      if (user.password.startsWith('$2y$') || user.password.startsWith('$2b$')) {
        console.log('🔒 Password is hashed, using Laravel API for verification');
        
        // Use Laravel login API for hashed password verification
        this.authService.login(this.credentials).subscribe({
          next: (response) => {
            console.log('✅ LOGIN SUCCESS via Laravel API');
            this.router.navigate(['/tasks']);
            this.isLoading = false;
          },
          error: (error) => {
            console.log('❌ Laravel login failed:', error);
            this.errorMessage = 'Invalid email or password';
            this.isLoading = false;
          }
        });
      } else {
        console.log('🔓 Password is plain text, comparing directly');
        
        // Direct comparison for plain text passwords
        const passwordMatch = await this.comparePassword(this.credentials.password, user.password);
        
        if (passwordMatch) {
          console.log('✅ PASSWORD MATCH - Login successful');
          localStorage.setItem('token', 'authenticated-token');
          this.router.navigate(['/tasks']);
          this.isLoading = false;
        } else {
          console.log('❌ PASSWORD MISMATCH - Login failed');
          this.errorMessage = 'Invalid email or password';
          this.isLoading = false;
        }
      }
      
    } catch (error) {
      console.log('💥 ERROR in login process:', error);
      this.errorMessage = 'Invalid email or password';
      this.isLoading = false;
    }
  }
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
}