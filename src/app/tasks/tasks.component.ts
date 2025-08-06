import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { TruncatePipe } from '../../../truncate.pipe';
import { NavbarComponent } from "../component/navbar/navbar.component";
import { catchError, Observable, of, tap } from 'rxjs';

// Removed: const router = Router();
// Removed: router.get('/', (req, res) => { ... });

interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  categorie_id: number;
  categorie?: {
    id: number;
    name: string;
  };
  user_id: number;
  profile_id: number;
  created_at: string;
  updated_at: string;
}

interface Categorie {
  id: number;
  name: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, NavbarComponent, TruncatePipe],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  tasks: Task[] = [];
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  apiUrl = 'http://127.0.0.1:8000/api/tasks';
  
  categories: Categorie[] = [];
  selectedTask: Task | null = null;
  user_id = 1;
  profile_id = 1;

  newTask: Partial<Task> = { 
    priority: 2,
    categorie_id: 1,
    user_id: 1,
    profile_id: 1,
    title: '',
    description: ''
  };
  
  newcategories: Partial<Categorie> = { name: '' };

  isEditing = false;
  currentYear = new Date().getFullYear();
  showSingleTask = false;
  
 getCategoryDisplay(task: Task): string {
  // 1. First try embedded category object (if API returns it)
  if (task.categorie?.id) {
    return task.categorie?.id === task.categorie_id
      ? task.categorie.name
      : `Category mismatch: ${task.categorie.name} (ID: ${task.categorie.id})`;
  }

  // 2. Handle missing/invalid category ID
  if (task.categorie_id === undefined || task.categorie_id === null) {
    return 'Uncategorized';
  }

  // 3. Check if categories are loaded
  if (!this.categories || this.categories.length === 0) {
    return 'Loading...';
  }

  // 4. Lookup by ID
  const found = this.categories.find(c => c.id === task.categorie_id);
  return found?.name || `Category ${task.categorie_id}`;
}

  // Loading states
  isLoading = false;
  isAdding = false;
  isUpdating = false;
  isDeleting = false;
  
  // Search properties
  searchQuery = '';
  searchResults: Task[] = [];
  isSearching = false;
  
  // Task count properties
  taskCount = 0;
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
    // Load categories first, then tasks to ensure proper categories display
    this.loadCategories().subscribe(() => {
          this.loadTasks();
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.showTask(params['id']);
        }
      });
    });
    // this.http.get<Categorie[]>('http://127.0.0.1:8000/api/categories').subscribe({
    //     next: (categories: any) => {
    //       this.categories = categories.data;
    //       console.log('Loaded categories:', this.categories);
          
    //       // loadTask();
    //     },
    //     error: (err) => {
    //       console.error('Error loading categories:', err);
          
          // this.categories = [
          //   {id: 1, name: 'Work'},
          //   {id: 2, name: 'Personal'}, 
          //   {id: 3, name: 'Urgent'}
          // ];
          // loadTask();
        // }
      // });
  }

  loadTasks() {
    this.isLoading = true;
    this.http.get<Task[]>(`${this.apiUrl}?include=categorie`).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.taskCount = tasks.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }

      
    });
      if (this.categories.length === 0) {
      // this.loadCategories().subscribe(() => {
      //   this.fetchTasks();
      // });
    } else {
      this.fetchTasks();
  }
  }

  loadCategories(): Observable<Categorie[]> {
  return this.http.get<Categorie[]>('http://127.0.0.1:8000/api/categories').pipe(
    tap((categories: any) => {
      this.categories = categories.data;
      console.log('Loaded categories:', this.categories);
    }),
    catchError(err => {
      console.error('Error loading categories:', err);
      return of([]);
    })
  );
}
  fetchTasks() {
  this.http.get<Task[]>(`${this.apiUrl}?with=categorie`).subscribe({
    next: (tasks) => {
      this.tasks = tasks.map(task => {
        // Ensure every task has proper category info
        if (!task.categorie && task.categorie_id) {
          task.categorie = this.categories.find(c => c.id === task.categorie_id);
        }
        return task;
      });
      this.isLoading = false;
    },
    error: () => {
      this.isLoading = false;
    }
  });
}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  addCategorie() {
    if (!this.newcategories.name?.trim()) {
      alert('Category name is required');
      return;
    }
    this.http.post<Categorie>('http://localhost:8000/api/categories', this.newcategories).subscribe({
      next: (response) => {
        this.categories.push(response);
        this.newcategories.name = '';
      },
      error: (err) => console.error('Error adding categories:', err)
    });
  }

  updateTaskcategories(task: Task) {
    this.http.patch(`${this.apiUrl}/${task.id}`, {
      categories: task.categorie_id
    }).subscribe({
      next: () => this.showSuccessToast('Catégorie mise à jour'),
      error: (err) => console.error('Erreur:', err)
    });
  }

  getCategorieName(categoryId: number): string {
    if (!this.categories || this.categories.length === 0) return 'Loading...';
    const categorie = this.categories.find(c => c.id === categoryId);
    return categorie?.name || `Category ${categoryId}`;
  }

  getDisplayCategory(task: Task): string {
  // First try the embedded categorie object
  if (task.categorie?.name) {
    return task.categorie.name;
  }
  
  // Then try to find in loaded categories
  if (task.categorie_id && this.categories.length) {
    const found = this.categories.find(c => c.id === task.categorie_id);
    if (found) return found.name;
  }
  
  // Final fallback
  return `Category ${task.categorie_id || 'Unknown'}`;
}

  showTask(id: number) {
    const loadTask = () => {
      this.http.get<Task>(`${this.apiUrl}/${id}`).subscribe({
        next: (task) => {
          this.selectedTask = task;
          this.showSingleTask = true;
        },
        error: (err) => {
          alert('Error loading task details');
        }
      });
    };
      }

  private showSuccessToast(message: string): void {
    alert(message); 
  }


  verifycategoriesMatches() {
    this.tasks.forEach(task => {
      const found = this.categories.some(c => c.id === task.categorie_id);
    });
  }

  addTask() {
    if (!this.newTask.categorie_id) {
      this.newTask.categorie_id = this.categories[0]?.id || 1;
    }
    if (!this.validateTask()) return;

    this.isAdding = true;
    const taskData = {
      title: this.newTask.title,
      description: this.newTask.description || '',
      priority: Number(this.newTask.priority),
      categories: Number(this.newTask.categorie_id),
      // user_id: Number(this.newTask.user_id),
      // profile_id: Number(this.newTask.profile_id)
    };

    this.http.post<Task>(this.apiUrl, taskData).subscribe({
      next: (response) => {
        this.loadTasks();
        this.resetForm();
        this.showSuccessMessage('Task created successfully!');
        this.isAdding = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to create task');
        this.isAdding = false;
      }
    });
  }

  private validateTask(): boolean {
    if (!this.newTask.title?.trim()) {
      this.showErrorMessage('Task title is required');
      return false;
    }
    if (!this.newTask.categorie_id) {
      this.showErrorMessage('Please select a category');
      return false;
    }
    return true;
  }

  editTask(task: Task) {
    this.isEditing = true;
    this.newTask = { ...task };
  }

  updateTask() {
    if (!this.newTask.id) return;
    this.isUpdating = true;
    this.http.put<Task>(`${this.apiUrl}/${this.newTask.id}`, this.newTask).subscribe({
      next: () => {
        this.loadTasks();
        this.resetForm();
        this.showSuccessMessage('Task updated successfully!');
        this.isUpdating = false;
      },
      error: (err) => {
        this.showErrorMessage('Failed to update task');
        this.isUpdating = false;
      }
    });
  }

  deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.isDeleting = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadTasks();
          this.showSuccessMessage('Task deleted successfully!');
          this.isDeleting = false;
        },
        error: (err) => {
          this.showErrorMessage('Failed to delete task');
          this.isDeleting = false;
        }
      });
    }
  }

  getPriorityText(priority: number): string {
    switch(priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  }

  resetForm() {
    this.newTask = { 
      priority: 2,
      title: '',
      description: '',
      categorie_id: this.categories.length > 0 ? this.categories[0].id : 1,
      user_id: this.user_id,
      profile_id: this.profile_id
    };
    this.isEditing = false;
  }

  searchTasks() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    
    this.isSearching = true;
    const query = this.searchQuery.toLowerCase();
    
    setTimeout(() => {
      this.searchResults = this.tasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        this.getPriorityText(task.priority).toLowerCase().includes(query)
      );
      this.isSearching = false;
    }, 500);
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || (event.ctrlKey && event.key === 'Enter')) {
      this.searchTasks();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  showTaskFromSearch(task: Task) {
    this.selectedTask = task;
    this.showSingleTask = true;
    this.searchQuery = '';
    this.searchResults = [];
  }

  showTaskDetails(task: Task) {
    console.log('Showing task details:', task);
    this.selectedTask = task;
    this.showSingleTask = true;
  }

  getTaskCount() {
    this.isCountLoading = true;
    setTimeout(() => {
      this.taskCount = this.tasks.length;
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

  sortTasks(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.tasks.sort((a, b) => {
      let valueA: any = a[column as keyof Task];
      let valueB: any = b[column as keyof Task];

      if (column === 'priority') {
        valueA = this.getPriorityText(valueA);
        valueB = this.getPriorityText(valueB);
      } else if (column === 'categorie_id') {
        valueA = this.getCategorieName(valueA);
        valueB = this.getCategorieName(valueB);
      }

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