import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';

interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  // Properties
  categories: Category[] = [];
  allCategories: Category[] = [];
  filteredCategories: Category[] = [];
  pagedCategories: Category[] = [];
  selectedCategory: Category | null = null;
  editingCategory: Category | null = null;
  searchQuery: string = '';
  roleFilter: string = 'all';
  isDarkMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  isCreating: boolean = false;
  showCategoryDetails: boolean = false;
  showEditModal: boolean = false;
  
  // Pagination
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
  private apiUrl = 'http://127.0.0.1:8000/api/categories';

  ngOnInit() {
    this.loadCategories();
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
    const cleanToken = token?.replace(/['"]/g, '') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };
  }

  loadCategories() {
    this.isLoading = true;
    this.http.get<any>(this.apiUrl, this.getAuthHeaders()).subscribe({
      next: (response) => {
        // Handle different response formats
        if (Array.isArray(response)) {
          this.categories = response;
        } else if (response && response.data) {
          this.categories = response.data;
        } else if (response && response.categories) {
          this.categories = response.categories;
        } else {
          this.categories = [];
        }
        
        this.allCategories = [...this.categories];
        this.filteredCategories = [...this.categories];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showErrorMessage('Failed to load categories');
        this.isLoading = false;
      }
    });
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCategories.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedCategories = this.filteredCategories.slice(startIndex, endIndex);
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
  filterCategories() {
    if (!this.searchQuery.trim()) {
      this.filteredCategories = this.allCategories;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredCategories = this.allCategories.filter(category =>
        category.name.toLowerCase().includes(query)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filteredCategories = this.allCategories;
    this.updatePagination();
  }

  // Category operations
  createCategory() {
    this.editingCategory = {
      id: 0,
      name: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.isCreating = true;
    this.showEditModal = true;
  }

  editCategory(category: Category) {
    this.editingCategory = { ...category };
    this.isCreating = false;
    this.showEditModal = true;
  }

  saveCategory() {
    if (!this.editingCategory) return;

    if (!this.editingCategory.name.trim()) {
      this.showErrorMessage('Category name is required');
      return;
    }

    this.isSaving = true;

    if (this.isCreating) {
      this.http.post<Category>(this.apiUrl, { name: this.editingCategory.name }, this.getAuthHeaders()).subscribe({
        next: (response) => {
          this.showSuccessMessage('Category created successfully!');
          this.closeEditModal();
          this.loadCategories();
          this.isSaving = false;
        },
        error: (error) => {
          this.showErrorMessage('Failed to create category');
          this.isSaving = false;
        }
      });
    } else {
      this.http.put<Category>(`${this.apiUrl}/${this.editingCategory.id}`, { name: this.editingCategory.name }, this.getAuthHeaders()).subscribe({
        next: (response) => {
          this.showSuccessMessage('Category updated successfully!');
          this.closeEditModal();
          this.loadCategories();
          this.isSaving = false;
        },
        error: (error) => {
          this.showErrorMessage('Failed to update category');
          this.isSaving = false;
        }
      });
    }
  }

  confirmDelete(categoryId: number, categoryName: string) {
    const confirmed = window.confirm(`Are you sure you want to delete the category "${categoryName}"?`);
    
    if (confirmed) {
      this.deleteCategory(categoryId);
    }
  }

  deleteCategory(categoryId: number) {
    this.isDeleting = true;
    this.http.delete(`${this.apiUrl}/${categoryId}`, this.getAuthHeaders()).subscribe({
      next: () => {
        this.showSuccessMessage('Category deleted successfully!');
        this.loadCategories();
        this.isDeleting = false;
      },
      error: (error) => {
        this.showErrorMessage('Failed to delete category');
        this.isDeleting = false;
      }
    });
  }

  viewCategoryDetails(category: Category) {
    this.selectedCategory = category;
    this.showCategoryDetails = true;
  }

  closeCategoryDetails() {
    this.selectedCategory = null;
    this.showCategoryDetails = false;
  }

  closeEditModal() {
    this.editingCategory = null;
    this.showEditModal = false;
    this.isCreating = false;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  navigateToProfile() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id) {
      this.router.navigate(['/profile', currentUser.id]);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}