import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, Observable, of, tap } from 'rxjs';

interface Task {
  id: number;
  title: string;  
  description: string;
  priority: number;
  categorie_id: number;
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
  imports: [CommonModule, FormsModule],
  template: '',
  styles: []
})export class TasksComponent {
  tasks: Task[] = [];
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private apiUrl = 'http://127.0.0.1:8000/api/tasks';
  
  category: Categorie[] = [];
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
  
  newCategorie: Partial<Categorie> = { name: '' };

  isEditing = false;
  currentYear = new Date().getFullYear();
  showSingleTask = false;

  ngOnInit() {
    this.loadTasks();
    // this.loadCategories().subscribe();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.showTask(params['id']);
      } else {
        this.loadTasks();
      }
    });
  }

  loadTasks() {
    this.getTasks().subscribe((taskData) => {
      this.tasks = taskData;
      this.verifyCategoryMatches();
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  addCategorie() {
    if (!this.newCategorie.name?.trim()) {
      alert('Category name is required');
      return;
    }
    this.http.post<Categorie>('http://localhost:8000/api/categories', this.newCategorie).subscribe({
      next: (response) => {
        this.category.push(response);
        this.newCategorie.name = '';
      },
      error: (err) => console.error('Error adding category:', err)
    });
  }

  updateTaskCategory(task: Task) {
    this.http.patch(`${this.apiUrl}/${task.id}`, {
      categorie_id: task.categorie_id
    }).subscribe({
      next: () => this.showSuccessToast('Catégorie mise à jour'),
      error: (err) => console.error('Erreur:', err)
    });
  }

  getCategoryName(categories: number | undefined): string {
  console.log('categorie_id:', categories, 'categories:', this.category);
  if (categories === undefined) {
    return 'Uncategorized';
  }
  if (!this.category || this.category.length === 0) return 'Loading...';
  const category = this.category.find(c => c.id === categories);
  if (!category) {
    console.warn('Catégorie introuvable pour ID:', categories, 'dans', this.category);
    return 'Uncategorized';
  }
  return category.name;
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

    if (this.category.length === 0) {
      this.http.get<Categorie[]>('http://Localhost:8000/api/categories').subscribe({
        next: (category) => {
          this.category = category;
          loadTask();
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          alert('Unable to load categories. Please try again later.');
          return;
        }
      });
    } else {
      loadTask();
    }
  }

  private showSuccessToast(message: string): void {
    alert(message); 
  }

  // loadCategories(): Observable<Categorie[]> {
  //   // return this.http.get<Categorie[]>('http://127.0.0.1:8000/api/categories').
  //   pipe(
  //     tap((categories: Categorie[]) => {
  //       if (!Array.isArray(categories)) {
  //         throw new Error('Format de données invalide');
  //       }
  //       const isValid = categories.every(cat => 
  //         'id' in cat && typeof cat.id === 'number' &&
  //         'name' in cat && typeof cat.name === 'string'
  //       );
  //       if (!isValid) {
  //         throw new Error('Structure des données invalide');
  //       }
  //       this.category = this.category;
  //       if (this.category.length > 0) {
  //         this.newTask.categorie_id = this.category[0].id;
  //       }
  //     }),
  //     catchError((err: any) => {
  //       this.category = [
  //         { id: 1, name: 'Work' },
  //         { id: 2, name: 'Personal' },
  //         { id: 3, name: 'Urgent' }
  //       ] as Categorie[];
  //       if (this.category.length > 0) {
  //         this.newTask.categorie_id = this.category[0].id;
  //       }
  //       return of(this.category);
  //     })
  //   );
  // }

  verifyCategoryMatches() {
    this.tasks.forEach(task => {
      const found = this.category.some(c => c.id === task.categorie_id);
    });
  }

  addTask() {
    if (!this.newTask.categorie_id) {
      this.newTask.categorie_id = this.category[0]?.id || 1;
    }
    if (!this.validateTask()) return;

    const taskData = {
      title: this.newTask.title,
      description: this.newTask.description || '',
      priority: Number(this.newTask.priority),
      categorie_id: Number(this.newTask.categorie_id),
      user_id: Number(this.newTask.user_id),
      profile_id: Number(this.newTask.profile_id)
    };

    this.http.post<Task>(this.apiUrl, taskData).subscribe({
      next: (response) => {
        this.loadTasks();
        this.resetForm();
      },
      error: (err) => {
        alert('Error adding task: ' + err.message);
      }
    });
  }

  private validateTask(): boolean {
    if (!this.newTask.title?.trim()) {
      alert('Task title is required');
      return false;
    }
    if (!this.newTask.categorie_id) {
      alert('Please select a categorie');
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
    this.http.put<Task>(`${this.apiUrl}/${this.newTask.id}`, this.newTask).subscribe({
      next: () => {
        this.loadTasks();
        this.resetForm();
      },
      error: (err) => {}
    });
  }

  deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.loadTasks(),
        error: (err) => {}
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
      categorie_id: this.category.length > 0 ? this.category[0].id : 1,
      user_id: this.user_id,
      profile_id: this.profile_id
    };
    this.isEditing = false;
  }
}
//