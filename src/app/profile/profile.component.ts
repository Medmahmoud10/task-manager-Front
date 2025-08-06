import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { catchError, Observable, of } from 'rxjs';

interface Profile {
  id: number;
  name: string;
  adresse: string;
  avatar: string;
  birthdate: string;
  bio: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profiles: Profile[] = [];
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/profiles';
  
  
  selectedProfile: Profile | null = {
  id: 0,
  name: '',
  adresse: '',
  avatar: '',
  birthdate: '',
  bio: '',
  user_id: 0,
  created_at: '',
  updated_at: ''
};  
  newProfile: Partial<Profile> = {
    name: '',
    adresse: '',
    avatar: '',
    birthdate: '',
    bio: '',
    user_id: 1
  };
  
  isEditing = false;
  showSingleProfile = false;
  
  // Loading states
  isLoading = false;
  isAdding = false;
  isUpdating = false;
  isDeleting = false;
  
  // Search properties
  searchQuery = '';
  searchResults: Profile[] = [];
  isSearching = false;
  
  // Profile count properties
  profileCount = 0;
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
    this.loadProfiles();
  }

  loadProfiles() {
    this.isLoading = true;
    console.log('Loading profiles from:', this.apiUrl);
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        console.log('Profiles received:', response);
        // Handle different response structures
        if (Array.isArray(response)) {
          this.profiles = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.profiles = response.data;
        } else if (response.profiles && Array.isArray(response.profiles)) {
          this.profiles = response.profiles;
        } else {
          console.error('Unexpected API response structure:', response);
          this.profiles = [];
        }
        this.profileCount = this.profiles.length;
        console.log('Profiles loaded:', this.profiles.length);
        // Debug each profile's address field
        this.profiles.forEach((profile, index) => {
          console.log(`Profile ${index}:`, {
            id: profile.id,
            name: profile.name,
            adresse: profile.adresse,
            hasAddress: !!profile.adresse
          });
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profiles:', err);
        this.showErrorMessage('Failed to load profiles from API');
        this.isLoading = false;
      }
    });
  }

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }

  showProfile(id: number) {
    console.log('Loading profile with ID:', id);
    this.http.get<Profile>(`${this.apiUrl}/${id}`).subscribe({
      next: (profile) => {
        console.log('Profile received:', profile);
        this.selectedProfile = profile;
        this.showSingleProfile = true;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.showErrorMessage('Error loading profile details');
      }
    });
  }

  showProfileDetails(profile: Profile) {
    console.log('Showing profile details:', profile);
    this.selectedProfile = profile;
    this.showSingleProfile = true;
  }

  addProfile() {
    if (!this.validateProfile()) return;
    
    this.isAdding = true;
    this.http.post<Profile>(this.apiUrl, this.newProfile).subscribe({
      next: (response) => {
        this.loadProfiles();
        this.resetForm();
        this.showSuccessMessage('Profile added successfully!');
        this.isAdding = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to add profile');
        this.isAdding = false;
      }
    });
  }

  private validateProfile(): boolean {
    if (!this.newProfile.name?.trim()) {
      this.showErrorMessage('Profile name is required');
      return false;
    }
    return true;
  }

  editProfile(profile: Profile) {
    this.isEditing = true;
    this.newProfile = { ...profile };
  }

  updateProfile() {
    if (!this.newProfile.id) return;
    this.isUpdating = true;
    this.http.put<Profile>(`${this.apiUrl}/${this.newProfile.id}`, this.newProfile).subscribe({
      next: () => {
        this.loadProfiles();
        this.resetForm();
        this.showSuccessMessage('Profile updated successfully!');
        this.isUpdating = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to update profile');
        this.isUpdating = false;
      }
    });
  }

  deleteProfile(id: number) {
    if (confirm('Are you sure you want to delete this profile?')) {
      this.isDeleting = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadProfiles();
          this.showSuccessMessage('Profile deleted successfully!');
          this.isDeleting = false;
        },
        error: (err) => {
          this.showErrorMessage('Failed to delete profile');
          this.isDeleting = false;
        }
      });
    }
  }

  resetForm() {
    this.newProfile = {
      name: '',
      adresse: '',
      avatar: '',
      birthdate: '',
      bio: '',
      user_id: 1
    };
    this.isEditing = false;
  }

  

  getPriorityText(priority: number): string {
    switch(priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  }

  

  searchProfiles() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    
    this.isSearching = true;
    const query = this.searchQuery.toLowerCase();
    
    setTimeout(() => {
      this.searchResults = this.profiles.filter(profile => 
        profile.name.toLowerCase().includes(query) ||
        profile.adresse.toLowerCase().includes(query) ||
        profile.bio.toLowerCase().includes(query)
      );
      this.isSearching = false;
    }, 500);
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || (event.ctrlKey && event.key === 'Enter')) {
      this.searchProfiles();
    }
  }

  showProfileFromSearch(profile: Profile) {
    this.selectedProfile = profile;
    this.showSingleProfile = true;
    this.searchQuery = '';
    this.searchResults = [];
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  getProfileCount() {
    this.isCountLoading = true;
    setTimeout(() => {
      this.profileCount = this.profiles.length;
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

  sortProfiles(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.profiles.sort((a, b) => {
      let valueA: any = a[column as keyof Profile];
      let valueB: any = b[column as keyof Profile];

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
}