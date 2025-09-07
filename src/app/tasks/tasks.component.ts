import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: number;
  user_id: number;
  categorie_id?: number | null;
  profile_id?: number | null;
  created_at: string;
  updated_at: string;
  categorie?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

interface Profile {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  user_id: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  // Data properties
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  allTasks: Task[] = [];
  categories: Category[] = [];
  profiles: Profile[] = [];
  users: User[] = [];
  
  // UI state properties
  isLoading: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  isDarkMode: boolean = false;
  currentUserId: number | null = null;
  isAdmin: boolean = false;
  
  // Modal and selection properties
  selectedTask: Task | null = null;
  editingTask: Task | null = null;
  showTaskDetails: boolean = false;
  showEditModal: boolean = false;
  isCreating: boolean = false;
  
  // Filter and search properties
  searchQuery: string = '';
  statusFilter: string = 'all';
  priorityFilter: string = 'all';
  categoryFilter: string = 'all';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pagedTasks: Task[] = [];
  Math = Math;
  
  // Message properties
  showMessage: boolean = false;
  messageText: string = '';
  messageType: 'success' | 'error' = 'success';
  messageTimeout: any;

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8000/api';

  ngOnInit(): void {
    this.checkUserStatus();
    this.loadTasks();
    this.loadCategories();
    this.loadProfiles();
    this.loadUsers();
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

  checkUserStatus(): void {
    const userData = localStorage.getItem('user');
    const currentUser = userData ? JSON.parse(userData) : null;
    this.isAdmin = currentUser?.role_id === 1;
    this.currentUserId = currentUser?.id || null;
  }

  // Data loading methods
  loadTasks(): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/tasks`, this.getAuthHeaders()).subscribe({
      next: (response) => {
        let tasks: Task[] = [];
        if (Array.isArray(response)) {
          tasks = response;
        } else if (response.data && Array.isArray(response.data)) {
          tasks = response.data;
        } else if (response.tasks && Array.isArray(response.tasks)) {
          tasks = response.tasks;
        }

        this.allTasks = tasks;
        if (!this.isAdmin) {
          this.allTasks = tasks.filter(task => task.user_id === this.currentUserId);
        }
        this.filteredTasks = [...this.allTasks];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.showErrorMessage('Failed to load tasks');
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.http.get<any>(`${this.apiUrl}/categories`, this.getAuthHeaders()).subscribe({
      next: (response) => {
        let categories: Category[] = [];
        if (Array.isArray(response)) {
          categories = response;
        } else if (response.data && Array.isArray(response.data)) {
          categories = response.data;
        } else if (response.categories && Array.isArray(response.categories)) {
          categories = response.categories;
        }
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadProfiles(): void {
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
        this.profiles = profiles;
      },
      error: (err) => {
        console.error('Error loading profiles:', err);
      }
    });
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

  // Filter and search methods
  filterTasks(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTasks = this.allTasks;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredTasks = this.allTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Apply additional filters
    if (this.statusFilter !== 'all') {
      this.filteredTasks = this.filteredTasks.filter(task => task.status === this.statusFilter);
    }

    if (this.priorityFilter !== 'all') {
      this.filteredTasks = this.filteredTasks.filter(task => task.priority.toString() === this.priorityFilter);
    }

    if (this.categoryFilter !== 'all') {
      this.filteredTasks = this.filteredTasks.filter(task => 
        task.categorie_id && task.categorie_id.toString() === this.categoryFilter
      );
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.categoryFilter = 'all';
    this.filteredTasks = this.allTasks;
    this.updatePagination();
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTasks.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedTasks = this.filteredTasks.slice(startIndex, endIndex);
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

  // Task operations
  createTask(): void {
    if (!this.isAdmin) {
      this.showErrorMessage('Only administrators can create tasks');
      return;
    }
    
    this.editingTask = {
      id: 0,
      title: '',
      description: '',
      status: 'pending',
      priority: 2,
      user_id: 0,
      categorie_id: null,
      profile_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.isCreating = true;
    this.showEditModal = true;
  }

  editTask(task: Task): void {
    if (!this.isAdmin && task.user_id !== this.currentUserId) {
      this.showErrorMessage('You can only edit your own tasks');
      return;
    }

    this.editingTask = { ...task };
    this.isCreating = false;
    this.showEditModal = true;
  }

  saveTask(): void {
    if (!this.editingTask) return;

    if (!this.editingTask.title.trim()) {
      this.showErrorMessage('Task title is required');
      return;
    }

    this.isSaving = true;

    const taskData = {
      title: this.editingTask.title.trim(),
      description: this.editingTask.description?.trim() || '',
      status: this.editingTask.status,
      priority: this.editingTask.priority,
      user_id: this.editingTask.user_id,
      categorie_id: this.editingTask.categorie_id,
      profile_id: this.editingTask.profile_id
    };

    if (this.isCreating) {
      this.http.post<Task>(`${this.apiUrl}/tasks`, taskData, this.getAuthHeaders()).subscribe({
        next: (response) => {
          this.showSuccessMessage('Task created successfully!');
          this.closeEditModal();
          this.loadTasks();
          this.isSaving = false;
        },
        error: (err) => {
          this.showErrorMessage('Failed to create task');
          this.isSaving = false;
        }
      });
    } else {
      this.http.put<Task>(`${this.apiUrl}/tasks/${this.editingTask.id}`, taskData, this.getAuthHeaders()).subscribe({
        next: (response) => {
          this.showSuccessMessage('Task updated successfully!');
          this.closeEditModal();
          this.loadTasks();
          this.isSaving = false;
        },
        error: (err) => {
          this.showErrorMessage('Failed to update task');
          this.isSaving = false;
        }
      });
    }
  }

  confirmDelete(taskId: number, taskTitle: string): void {
    if (!this.isAdmin) {
      this.showErrorMessage('Only administrators can delete tasks');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete the task "${taskTitle}"?`);
    
    if (confirmed) {
      this.deleteTask(taskId);
    }
  }

  deleteTask(taskId: number): void {
    this.isDeleting = true;
    this.http.delete(`${this.apiUrl}/tasks/${taskId}`, this.getAuthHeaders()).subscribe({
      next: () => {
        this.showSuccessMessage('Task deleted successfully!');
        this.loadTasks();
        this.isDeleting = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to delete task');
        this.isDeleting = false;
      }
    });
  }

  updateTaskStatus(task: Task, newStatus: string): void {
    if (!this.isAdmin && newStatus === 'completed') {
      this.showErrorMessage('Only administrators can mark tasks as completed');
      return;
    }

    this.http.patch(`${this.apiUrl}/tasks/${task.id}/status`, 
      { status: newStatus }, 
      this.getAuthHeaders()
    ).subscribe({
      next: () => {
        this.showSuccessMessage(`Task status updated to ${this.getStatusLabel(newStatus)}`);
        this.loadTasks();
      },
      error: (err) => {
        this.showErrorMessage('Failed to update task status');
      }
    });
  }

  viewTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.showTaskDetails = true;
  }

  closeTaskDetails(): void {
    this.selectedTask = null;
    this.showTaskDetails = false;
  }

  closeEditModal(): void {
    this.editingTask = null;
    this.showEditModal = false;
    this.isCreating = false;
  }

  // Utility methods
  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-completed';
      default: return 'status-unknown';
    }
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'priority-high';
      case 2: return 'priority-medium';
      case 3: return 'priority-low';
      default: return 'priority-unknown';
    }
  }

  getCategoryName(categoryId: number | null | undefined): string {
  if (categoryId === null || categoryId === undefined) return 'Uncategorized';
  const category = this.categories.find(c => c.id === categoryId);
  return category ? category.name : 'Unknown Category';
  }

  

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    if (!user) return 'Unknown User';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  }

  getProfileName(profileId: number | null | undefined): string {
  if (profileId === null || profileId === undefined) return 'No Profile';
  const profile = this.profiles.find(p => p.id === profileId);
  return profile ? profile.name : 'Unknown Profile';
  }

  // Statistics methods
  getTotalTasks(): number {
    return this.allTasks.length;
  }

  getTaskCountByStatus(status: string): number {
    return this.allTasks.filter(task => task.status === status).length;
  }

  // Navigation and theme
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  navigateToProfile(): void {
    if (this.currentUserId) {
      this.router.navigate(['/profile', this.currentUserId]);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }
}