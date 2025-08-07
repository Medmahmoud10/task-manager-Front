import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { catchError, Observable, of } from 'rxjs';

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  adress: string;
  date_of_birth: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  users: User[] = [];
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/users';
  
  selectedUser: User | null = null;
  
  newUser: Partial<User> = {
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    adress: '',
    date_of_birth: '',
    bio: ''
  };
  
  isEditing = false;
  showSingleUser = false;
  
  // Loading states
  isLoading = false;
  isAdding = false;
  isUpdating = false;
  isDeleting = false;
  
  // Search properties
  searchQuery = '';
  searchResults: User[] = [];
  isSearching = false;
  
  // User count properties
  userCount = 0;
  isCountLoading = false;
  
  // Message properties
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  
  // Sort properties
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Theme properties
  isDarkMode = false;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.getUsers().subscribe({
      next: (userData) => {
        this.users = Array.isArray(userData) ? userData : [];
        this.userCount = this.users.length;
        this.isLoading = false;
      },
      error: () => {
        this.users = [];
        this.isLoading = false;
      }
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  showUser(id: number) {
    this.http.get<User>(`${this.apiUrl}/${id}`).subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.showSingleUser = true;
      },
      error: (err) => {
        this.showErrorMessage('Error loading user details');
      }
    });
  }

  addUser() {
    if (!this.validateUser()) return;
    
    this.isAdding = true;
    this.http.post<User>(this.apiUrl, this.newUser).subscribe({
      next: (response) => {
        this.loadUsers();
        this.resetForm();
        this.showSuccessMessage('User added successfully!');
        this.isAdding = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to add user');
        this.isAdding = false;
      }
    });
  }

  private validateUser(): boolean {
    if (!this.newUser.username?.trim()) {
      this.showErrorMessage('Username is required');
      return false;
    }
    if (!this.newUser.email?.trim()) {
      this.showErrorMessage('Email is required');
      return false;
    }
    return true;
  }

  editUser(user: User) {
    this.isEditing = true;
    this.newUser = { ...user };
  }

  updateUser() {
    if (!this.newUser.id) return;
    this.isUpdating = true;
    this.http.put<User>(`${this.apiUrl}/${this.newUser.id}`, this.newUser).subscribe({
      next: () => {
        this.loadUsers();
        this.resetForm();
        this.showSuccessMessage('User updated successfully!');
        this.isUpdating = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to update user');
        this.isUpdating = false;
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isDeleting = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadUsers();
          this.showSuccessMessage('User deleted successfully!');
          this.isDeleting = false;
        },
        error: (err) => {
          this.showErrorMessage('Failed to delete user');
          this.isDeleting = false;
        }
      });
    }
  }

  resetForm() {
    this.newUser = {
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      adress: '',
      date_of_birth: '',
      bio: ''
    };
    this.isEditing = false;
  }

  searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    
    this.isSearching = true;
    const query = this.searchQuery.toLowerCase();
    
    setTimeout(() => {
      this.searchResults = this.users.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query)
      );
      this.isSearching = false;
    }, 500);
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || (event.ctrlKey && event.key === 'Enter')) {
      this.searchUsers();
    }
  }

  showUserFromSearch(user: User) {
    this.selectedUser = user;
    this.showSingleUser = true;
    this.searchQuery = '';
    this.searchResults = [];
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  getUserCount() {
    this.isCountLoading = true;
    setTimeout(() => {
      this.userCount = this.users.length;
      this.isCountLoading = false;
    }, 300);
  }

  showSuccessMessage(message: string) {
    this.messageText = message;
    this.messageType = 'success';
    this.showMessage = true;
    setTimeout(() => this.showMessage = false, 3000);
  }

  showErrorMessage(message: string) {
    this.messageText = message;
    this.messageType = 'error';
    this.showMessage = true;
    setTimeout(() => this.showMessage = false, 3000);
  }

  sortUsers(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.users.sort((a, b) => {
      let valueA: any = a[column as keyof User];
      let valueB: any = b[column as keyof User];

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  showUserDetails(user: User) {
    console.log('Showing user details:', user);
    this.selectedUser = user;
    this.showSingleUser = true;
  }
}