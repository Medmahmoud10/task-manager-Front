import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


interface Profile {
  id: number;
  name: string;
  avatar: string;
  bio: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // User properties
  userProfile: Profile | null = null;
  isUserProfileLoading = false;
  isUserUpdating = false;
  isDarkMode = false;
  currentUserId: number | null = null;
  editMode = false;
  editProfileData: Partial<Profile> = {};
  isCreating: boolean = false;
  // Admin properties
  isAdmin: boolean = false;
  allProfiles: Profile[] = [];
  users: User[] = [];
  filteredProfiles: Profile[] = [];
  pagedProfiles: Profile[] = [];
  selectedProfile: Profile | null = null;
  editingProfile: Profile | null = null;
  showProfileModal: boolean = false;
  showProfileDetails: boolean = false;
  
  // Search and pagination
  searchQuery: string = '';
  isLoading: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  Math = Math;

  // Messages
  showMessage: boolean = false;
  messageText: string = '';
  messageType: 'success' | 'error' = 'success';
  messageTimeout: any;

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8000/api';

  ngOnInit(): void {
  const userData = localStorage.getItem('user');
  const currentUser = userData ? JSON.parse(userData) : null;
  this.isAdmin = currentUser?.role_id === 1;
  this.currentUserId = currentUser?.id || null;

  if (this.isAdmin) {
    this.loadProfiles();
    this.loadUsers();
  } else {
    this.loadUserProfile();
  }
}

  // Message methods
  showSuccessMessage(message: string): void {
    this.messageText = message;
    this.messageType = 'success';
    this.showMessage = true;
    
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

  closeMessage(): void {
    this.showMessage = false;
    clearTimeout(this.messageTimeout);
  }

  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    console.log('Retrieved token:', token);
    const cleanToken = token?.replace(/['"]/g, '') || '';
    console.log('Cleaned token:', cleanToken);
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };
  }


  loadUsers(): void {
    this.http.get<any>(`${this.apiUrl}/users`, this.getAuthHeaders()).subscribe({
      next: (response) => {
        let users: User[] = [];
        if (Array.isArray(response)) {
          users = response;
        } else if (response.data && Array.isArray(response.data)) {
          users = response.data;
        } else if (response.users && Array.isArray(response.users)) {
          users = response.users;
        }
        this.users = users;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  


  // USER PROFILE METHODS
  loadUserProfile(): void {
    this.isUserProfileLoading = true;
    
    this.http.get<any>(`${this.apiUrl}/profiles`, this.getAuthHeaders()).subscribe({
      next: (response) => {
        let profiles: Profile[] = [];
        if (Array.isArray(response)) {
          profiles = response;
        } else if (response.data && Array.isArray(response.data)) {
          profiles = response.data;
        } else if (response.profiles && Array.isArray(response.profiles)) {
          profiles = response.profiles;
        }

        this.userProfile = profiles.find((p: Profile) => p.user_id === this.currentUserId) || null;
        this.isUserProfileLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.showErrorMessage('Failed to load profile');
        this.isUserProfileLoading = false;
      }
    });
  }

  enableEditMode(): void {
    if (this.userProfile) {
      this.editMode = true;
      this.editProfileData = { ...this.userProfile };
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editProfileData = {};
  }

  updateUserProfile(): void {
    if (!this.userProfile || !this.editProfileData) return;

    this.isUserUpdating = true;
    const name = this.editProfileData.name?.trim() || '';
    if (!name) {
      this.showErrorMessage('Name is required');
      this.isUserUpdating = false;
      return;
    }

    const updateData = {
      name: name,
      avatar: this.editProfileData.avatar?.trim() || '',
      bio: this.editProfileData.bio?.trim() || ''
    };

    this.http.put<Profile>(
      `${this.apiUrl}/profiles/${this.userProfile.id}`,
      updateData,
      this.getAuthHeaders()
    ).subscribe({
      next: (response) => {
        this.showSuccessMessage('Profile updated successfully!');
        this.userProfile = {
          ...this.userProfile!,
          ...response
        };
        this.editMode = false;
        this.isUserUpdating = false;
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.showErrorMessage('Failed to update profile');
        this.isUserUpdating = false;
      }
    });
  }
  
  userHasProfile(userId: number): boolean {
  return this.allProfiles.some(profile => profile.user_id === userId);
}


  // ADMIN PROFILE METHODS
  loadProfiles(): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/profiles`, this.getAuthHeaders()).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.allProfiles = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.allProfiles = response.data;
        } else if (response.profiles && Array.isArray(response.profiles)) {
          this.allProfiles = response.profiles;
        }
        
        this.filteredProfiles = [...this.allProfiles];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profiles:', err);
        this.showErrorMessage('Failed to load profiles');
        this.isLoading = false;
      }
    });
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredProfiles.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedProfiles = this.filteredProfiles.slice(startIndex, endIndex);
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

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
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

  // Search and filter
  filterProfiles() {
    if (!this.searchQuery.trim()) {
      this.filteredProfiles = this.allProfiles;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredProfiles = this.allProfiles.filter(profile =>
        profile.name?.toLowerCase().includes(query) ||
        profile.bio?.toLowerCase().includes(query)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filteredProfiles = this.allProfiles;
    this.updatePagination();
  }

  // Profile operations
  createProfile(): void {
  if (!this.isCurrentUserAdmin()) {
    this.showErrorMessage('Only administrators can create profiles');
    return;
  }
  
  // Check if we have any users loaded
  if (this.users.length === 0) {
    this.showErrorMessage('No users available. Please create a user first.');
    return;
  }
  
  // Use the first available user ID from your actual users
  const defaultUserId = this.users[0].id; // This will be 1 (johndoe)
  
  this.editingProfile = {
    id: 0,
    name: '',
    avatar: '',
    bio: '',
    user_id: defaultUserId, // ← Now using REAL user ID 1
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  this.isCreating = true;
  this.showProfileModal = true;
}

  editProfile(profile: Profile) {
    this.editingProfile = { ...profile };
    this.showProfileModal = true;
  }

  saveProfile(): void {
  if (!this.editingProfile) return;

  // Double-check admin status before sending
  if (!this.isCurrentUserAdmin()) {
    this.showErrorMessage('Only administrators can create profiles');
    return;
  }

  if (!this.editingProfile.name?.trim()) {
    this.showErrorMessage('Profile name is required');
    return;
  }


  this.isSaving = true;

  const profileData = {
    name: this.editingProfile.name.trim(),
    avatar: this.editingProfile.avatar?.trim() || '',
    bio: this.editingProfile.bio?.trim() || '',
    user_id: this.editingProfile.user_id || 1
  };

  console.log('Sending profile data:', profileData);

  if (this.isCreating) {
    this.http.post(`${this.apiUrl}/profiles`, profileData, this.getAuthHeaders()).subscribe({
      next: (response: any) => {
        console.log('Profile created successfully:', response);
        this.showSuccessMessage('Profile created successfully!');
        this.closeModal();
        this.loadProfiles();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error creating profile:', err);
        
        if (err.status === 403) {
          this.showErrorMessage('Access denied. Administrator privileges required.');
        } else {
          this.showErrorMessage('Failed to create profile: ' + (err.error?.message || 'Unknown error'));
        }
        
        this.isSaving = false;
      }
    });
  } else {
    // Update existing profile
      this.http.put<Profile>(`${this.apiUrl}/profiles/${this.editingProfile.id}`, profileData, this.getAuthHeaders()).subscribe({
        next: () => {
          this.showSuccessMessage('Profile updated successfully!');
          this.closeModal();
          this.loadProfiles();
          this.isSaving = false;
        },
        error: (err) => {
          this.showErrorMessage('Failed to update profile');
          this.isSaving = false;
        }
      });
  }
}

  isCurrentUserAdmin(): boolean {
  const userData = localStorage.getItem('user');
  if (!userData) return false;
  
  const user = JSON.parse(userData);
  return user.role_id === 1; // Assuming role_id 1 is admin
}

  confirmDelete(profileId: number, profileName: string) {
    const confirmed = window.confirm(`Are you sure you want to delete the profile "${profileName}"?`);
    
    if (confirmed) {
      this.deleteProfile(profileId);
    }
  }

  updateProfile(): void {
  if (!this.editingProfile?.id) {
    this.showErrorMessage('No profile selected for update');
    return;
  }

  const updateData = {
    name: this.editingProfile.name.trim(),
    avatar: this.editingProfile.avatar?.trim() || '',
    bio: this.editingProfile.bio?.trim() || '',
    user_id: this.editingProfile.user_id
  };

  // Use PUT for updates, not POST
  this.http.put(`${this.apiUrl}/profiles/${this.editingProfile.id}`, updateData, this.getAuthHeaders()).subscribe({
    next: (response: any) => {
      this.showSuccessMessage('Profile updated successfully!');
      this.closeModal();
      this.loadProfiles();
    },
    error: (err) => {
      this.showErrorMessage('Failed to update profile');
    }
  });
}

  deleteProfile(profileId: number) {
    this.isDeleting = true;
    this.http.delete(`${this.apiUrl}/profiles/${profileId}`, this.getAuthHeaders()).subscribe({
      next: () => {
        this.showSuccessMessage('Profile deleted successfully!');
        this.loadProfiles();
        this.isDeleting = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to delete profile');
        this.isDeleting = false;
      }
    });
  }

  viewProfileDetails(profile: Profile) {
    this.selectedProfile = profile;
    this.showProfileDetails = true;
  }

  closeProfileDetails() {
    this.selectedProfile = null;
    this.showProfileDetails = false;
  }

  closeModal() {
    this.editingProfile = null;
    this.showProfileModal = false;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  navigateToProfile() {
    if (this.currentUserId) {
      this.router.navigate(['/profile', this.currentUserId]);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  backToTasks() {
    this.router.navigate(['/tasks']);
  }
}