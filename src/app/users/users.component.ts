import { Component, OnInit, ChangeDetectorRef, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../services/users.service';

interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  phone?: number;
  address?: string;
  date_of_birth?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None 
})
<<<<<<< HEAD
export class UsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: User[] = [];
=======
export class UsersComponent {
  users: User[] = [];
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';
  
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
  
  editUser: Partial<User> = {
    first_name: '',
    last_name: '',
    phone: '',
    adress: '',
    date_of_birth: '',
    bio: ''
  };
  
  isEditing = false;
  showSingleUser = false;
  showEditModal = false;
  
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
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
  isDarkMode = false;
  searchQuery = '';
  selectedUser: any | null = null;
  showUserDetails = false;
  editingUser: any | null = null;
  isCreating: boolean = false;
  isLoading: boolean = false;
  roleFilter = 'all';
  statusFilter = 'all';
  isSaving: boolean = false;
  isDeleting: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pagedUsers: any[] = [];
  Math = Math;

  // Message properties
  showMessage: boolean = false;
  messageText: string = '';
  messageType: 'success' | 'error' = 'success';
  messageTimeout: any;

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private userService = inject(UsersService);

  ngOnInit() {
    const token = localStorage.getItem('auth_token');
    this.loadUsers();
  }

<<<<<<< HEAD
  // Message methods
  showSuccessMessage(message: string): void {
    this.messageText = message;
    this.messageType = 'success';
    this.showMessage = true;
=======
  loadUsers() {
    this.isLoading = true;
    console.log('Loading users from:', this.apiUrl);
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        console.log('Users API response:', response);
        // Handle Laravel API response format {"users": [...]}
        if (response && response.users && Array.isArray(response.users)) {
          this.users = response.users;
        } else if (Array.isArray(response)) {
          this.users = response;
        } else {
          console.error('Unexpected API response format:', response);
          this.users = [];
        }
        
        // Debug: Check if password field is included
        if (this.users.length > 0) {
          console.log('First user data:', this.users[0]);
          console.log('Password field exists:', 'password' in this.users[0]);
          console.log('Password value:', this.users[0].password);
        }
        this.userCount = this.users.length;
        console.log('Users loaded:', this.users.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
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
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
    
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  showErrorMessage(message: string): void {
    this.messageText = message;
    this.messageType = 'error';
    this.showMessage = true;
    
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

<<<<<<< HEAD
  closeMessage(): void {
    this.showMessage = false;
    clearTimeout(this.messageTimeout);
  }

  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    const cleanToken = token?.replace(/['"]/g, '') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
=======
  openEditModal(user: User) {
    this.selectedUser = user;
    this.editUser = {
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      adress: user.adress,
      date_of_birth: user.date_of_birth,
      bio: user.bio
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editUser = {
      first_name: '',
      last_name: '',
      phone: '',
      adress: '',
      date_of_birth: '',
      bio: ''
    };
  }

  updateUser() {
    console.log('🔄 UPDATE USER CLICKED!');
    console.log('Selected user:', this.selectedUser);
    console.log('Edit user data:', this.editUser);
    
    if (!this.selectedUser?.id) {
      console.log('❌ No selected user ID');
      this.showErrorMessage('No user selected');
      return;
    }
    
    if (!this.editUser.first_name || !this.editUser.last_name) {
      console.log('❌ Missing required fields');
      this.showErrorMessage('First name and last name are required');
      return;
    }
    
    this.isUpdating = true;
    console.log('📡 Sending PUT request to:', `${this.apiUrl}/${this.selectedUser.id}`);
    console.log('📦 Request data:', this.editUser);
    
    // Prepare data with proper types
    const updateData = {
      first_name: String(this.editUser.first_name || ''),
      last_name: String(this.editUser.last_name || ''),
      phone: this.editUser.phone ? Number(this.editUser.phone) : null,
      adress: String(this.editUser.adress || ''),
      date_of_birth: this.editUser.date_of_birth || null,
      bio: String(this.editUser.bio || '')
    };
    
    console.log('Phone field type:', typeof updateData.phone);
    console.log('Phone field value:', updateData.phone);
    
    console.log('📦 Formatted request data:', updateData);
    
    this.http.put<any>(`${this.apiUrl}/${this.selectedUser.id}`, updateData).subscribe({
      next: (response) => {
        console.log('✅ Update successful:', response);
        this.loadUsers();
        this.closeEditModal();
        this.showSuccessMessage('User updated successfully!');
        this.isUpdating = false;
      },
      error: (err) => {
        console.log('❌ Update failed:', err);
        console.log('Error status:', err.status);
        console.log('Error message:', err.error);
        this.showErrorMessage('Failed to update user');
        this.isUpdating = false;
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isDeleting = true;
      console.log('Deleting user with ID:', id);
      console.log('Delete URL:', `${this.apiUrl}/${id}`);
      
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          this.loadUsers();
          this.showSuccessMessage('User deleted successfully!');
          this.isDeleting = false;
        },
        error: (err) => {
          console.error('Delete error:', err);
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
>>>>>>> c74b596ce5b981f53a109103fa2b015a8e3e74af
    };
  }

  loadUsers(): void {
    this.isLoading = true;
    
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = [...this.users];
        this.updatePagination(); 
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.showErrorMessage('Failed to load users. Please try again.');
      }
    });
  }

  selectUser(user: any) {
    try {
      this.selectedUser = user;
    } catch (error) {
      console.error('Error selecting user:', error);
      this.selectedUser = null;
    }
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.isCreating = false;
  }

  testSpinner() {
    console.log('Spinner test');
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      if (this.currentPage <= 3) {
        end = 4;
      }
      
      if (this.currentPage >= this.totalPages - 2) {
        start = this.totalPages - 3;
      }
      
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < this.totalPages) {
          pages.push(i);
        }
      }
      
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  checkAuthToken() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredUsers = this.users;
    this.updatePagination();
  }

  confirmDelete(userId: number, userName: string) {
    const confirmed = window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`);
    
    if (confirmed) {
      this.deleteUser(userId);
    }
  }

  deleteUser(userId: number) {
    this.isDeleting = true;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.showSuccessMessage('User deleted successfully!');
        this.loadUsers();
        this.isDeleting = false;
      },
      error: (error) => {
        this.showErrorMessage('Failed to delete user: ' + (error.error?.message || 'Unknown error'));
        console.error('Delete error:', error);
        this.isDeleting = false;
      }
    });
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role_id === 1).length;
  }

  getUserCount(): number {
    return this.users.filter(user => user.role_id !== 1).length;
  }

  getRoleName(roleId: number): string {
    return roleId === 1 ? 'Admin' : 'User';
  }

  getUserInitials(user: User): string {
    if (user.first_name && user.last_name) {
      return (user.first_name.charAt(0) + user.last_name.charAt(0)).toUpperCase();
    }
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.showUserDetails = true;
  }

  closeUserDetails(): void {
    this.selectedUser = null;
    this.showUserDetails = false;
  }

  filterUsers(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = this.users;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        (user.phone && user.phone.toString().includes(query)) ||
        (user.role_id === 1 ? 'admin' : 'user').includes(query)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.roleFilter = 'all';
    this.filteredUsers = this.users;
    this.updatePagination();
  }

  createUser(): void {
    this.editingUser = {
      id: 0,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role_id: 2,
      phone: '',
      bio: '',
      address: '',
      date_of_birth: '',
      password: '',
      password_confirmation: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.isCreating = true;
  }

  editUser(user: any): void {
    this.editingUser = { ...user };
    this.isCreating = false;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  updateUser(): void {
    const updateData = {
    ...this.editingUser,
    phone: this.editingUser.phone ? this.editingUser.phone.toString() : '', // Convert to string
    // Remove password fields if not changing password
    password: undefined,
    password_confirmation: undefined
    };

    if (!updateData.password) {
    delete updateData.password;
    delete updateData.password_confirmation;
    }

    this.userService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSuccessMessage('User updated successfully!');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (error) => {
        this.isSaving = false;
        this.showErrorMessage('Failed to update user: ' + (error.error?.message || 'Unknown error'));
        console.error('Update error:', error);
      }
    });
  }

  closeEditModal(): void {
    this.editingUser = null;
    this.isCreating = false;
  }

  saveUser(): void {
    if (!this.editingUser) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (this.editingUser.id === currentUser?.id && this.editingUser.role_id !== currentUser.role_id) {
      this.showErrorMessage('You cannot change your own role!');
      return;
    }

    this.isSaving = true;

    if (this.isCreating) {
      this.createNewUser();
    } else {
      this.updateUser();
    }
  }

  private createNewUser(): void {
  // Convert phone to string if it's a number
  const userData = {
    ...this.editingUser,
    phone: this.editingUser.phone ? this.editingUser.phone.toString() : '', // Convert to string
    password_confirmation: this.editingUser.password // Ensure password confirmation matches
  };

  console.log('Sending user data:', userData); // Debug log

  this.userService.createUser(userData).subscribe({
    next: (newUser) => {
      this.users.push(newUser);
      this.filteredUsers.push(newUser);
      this.closeEditModal();
      this.isSaving = false;
      this.showSuccessMessage('User created successfully!');
      this.updatePagination();
    },
    error: (error) => {
      console.error('Error creating user:', error);
      console.error('Error details:', error.error); // More detailed logging
      this.isSaving = false;
      this.showErrorMessage('Failed to create user: ' + (error.error?.message || 'Unknown error'));
    }
  });
}

  toggleUserStatus(user: User): void {
    alert(`Toggle status for user: ${user.username}`);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  navigateToProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.router.navigate(['/profile', currentUser.id]);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}