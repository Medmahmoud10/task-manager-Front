<<<<<<< HEAD
import { Component, inject } from '@angular/core';
=======
import { Component } from '@angular/core';
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
<<<<<<< HEAD
  styleUrls: ['./register.component.scss']
=======
  styleUrl: './register.component.scss'
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
})
export class RegisterComponent {
  registerData = {
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    phone: '',
<<<<<<< HEAD
    adresse: '',
=======
    adress: '',
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
    date_of_birth: '',
    bio: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
<<<<<<< HEAD
  passwordStrength = '';
  showPassword = false;
  showConfirmPassword = false;

  private http = inject(HttpClient);
  private router = inject(Router);
=======

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af

  onSubmit() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:8000/api/register', this.registerData).subscribe({
<<<<<<< HEAD
      next: (response: any) => {
=======
      next: (response) => {
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Registration error:', error);
<<<<<<< HEAD
        this.errorMessage = this.getErrorMessage(error);
=======
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
        this.isLoading = false;
      }
    });
  }

<<<<<<< HEAD
  checkPasswordStrength() {
    const password = this.registerData.password;
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    if (strengthScore >= 4) {
      this.passwordStrength = 'strong';
    } else if (strengthScore >= 2) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'weak';
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private validateForm(): boolean {
    // Reset error message
    this.errorMessage = '';

    // Required fields validation
    const requiredFields = ['username', 'email', 'password', 'password_confirmation'];
    const missingFields = requiredFields.filter(field => !this.registerData[field as keyof typeof this.registerData]);
    
    if (missingFields.length > 0) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    // Password confirmation
=======


  private validateForm(): boolean {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Username, email and password are required';
      return false;
    }
    

    
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
    if (this.registerData.password !== this.registerData.password_confirmation) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    
<<<<<<< HEAD
    // Password length
=======
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
    if (this.registerData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return false;
    }
<<<<<<< HEAD

    return true;
  }

  private getErrorMessage(error: any): string {
    if (error.error?.errors) {
      // Handle Laravel validation errors
      const errors = error.error.errors;
      const firstError = Object.values(errors)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your connection.';
    }
    
    return 'Registration failed. Please try again.';
  }

=======
    
    return true;
  }

>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
  goToLogin() {
    this.router.navigate(['/login']);
  }
}