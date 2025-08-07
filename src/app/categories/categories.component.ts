import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
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
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  categories: Category[] = [];
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/categories';
  
  selectedCategory: Category | null = null;
  
  newCategory: Partial<Category> = {
    name: ''
  };
  
  isEditing = false;
  showSingleCategory = false;
  
  // Loading states
  isLoading = false;
  isAdding = false;
  isUpdating = false;
  isDeleting = false;
  
  // Search properties
  searchQuery = '';
  searchResults: Category[] = [];
  isSearching = false;
  
  // Category count properties
  categoryCount = 0;
  isCountLoading = false;
  
  // Message properties
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  
  // Search error property
  searchError = false;
  
  // Sort properties
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Theme properties
  isDarkMode = false;

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    console.log('Loading categories from:', this.apiUrl);
    this.getCategories().subscribe({
      next: (categoryData: any) => {
        console.log('Categories received:', categoryData);
        // Handle different API response formats
        if (Array.isArray(categoryData)) {
          this.categories = categoryData;
        } else if (categoryData && categoryData.data && Array.isArray(categoryData.data)) {
          this.categories = categoryData.data;
        } else if (categoryData && categoryData.categories && Array.isArray(categoryData.categories)) {
          this.categories = categoryData.categories;
        } else {
          this.categories = [];
        }
        this.categoryCount = this.categories.length;
        console.log('Categories loaded:', this.categories.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [];
        this.showErrorMessage('Failed to load categories from API');
        this.isLoading = false;
      }
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  showCategory(id: number) {
    this.http.get<Category>(`${this.apiUrl}/${id}`).subscribe({
      next: (category) => {
        this.selectedCategory = category;
        this.showSingleCategory = true;
      },
      error: (err) => {
        this.showErrorMessage('Error loading category details');
      }
    });
  }

  addCategory() {
    if (!this.validateCategory()) return;
    
    this.isAdding = true;
    this.http.post<Category>(this.apiUrl, this.newCategory).subscribe({
      next: (response) => {
        this.loadCategories();
        this.resetForm();
        this.showSuccessMessage('Category added successfully!');
        this.isAdding = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to add category');
        this.isAdding = false;
      }
    });
  }

  private validateCategory(): boolean {
    if (!this.newCategory.name?.trim()) {
      this.showErrorMessage('Category name is required');
      return false;
    }
    return true;
  }

  editCategory(category: Category) {
    this.isEditing = true;
    this.newCategory = { ...category };
  }

  updateCategory() {
    if (!this.newCategory.id) return;
    this.isUpdating = true;
    this.http.put<Category>(`${this.apiUrl}/${this.newCategory.id}`, this.newCategory).subscribe({
      next: () => {
        this.loadCategories();
        this.resetForm();
        this.showSuccessMessage('Category updated successfully!');
        this.isUpdating = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to update category');
        this.isUpdating = false;
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.isDeleting = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadCategories();
          this.showSuccessMessage('Category deleted successfully!');
          this.isDeleting = false;
        },
        error: (err) => {
          this.showErrorMessage('Failed to delete category');
          this.isDeleting = false;
        }
      });
    }
  }

  resetForm() {
    this.newCategory = {
      name: ''
    };
    this.isEditing = false;
  }

  searchCategories() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.searchError = false;
      return;
    }
    
    this.isSearching = true;
    this.searchError = false;
    const query = this.searchQuery.toLowerCase();
    
    setTimeout(() => {
      this.searchResults = this.categories.filter(category => 
        category.name.toLowerCase().includes(query)
      );
      this.isSearching = false;
      if (this.searchResults.length === 0) {
        this.searchError = true;
      }
    }, 500);
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || (event.ctrlKey && event.key === 'Enter')) {
      this.searchCategories();
    }
  }

  showCategoryFromSearch(category: Category) {
    this.selectedCategory = category;
    this.showSingleCategory = true;
    this.searchQuery = '';
    this.searchResults = [];
  }

  showCategoryDetails(category: Category) {
    console.log('Showing category details:', category);
    this.selectedCategory = category;
    this.showSingleCategory = true;
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.searchError = false;
  }

  getCategoryCount() {
    this.isCountLoading = true;
    setTimeout(() => {
      this.categoryCount = this.categories.length;
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

  sortCategories(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.categories.sort((a, b) => {
      let valueA: any = a[column as keyof Category];
      let valueB: any = b[column as keyof Category];

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
