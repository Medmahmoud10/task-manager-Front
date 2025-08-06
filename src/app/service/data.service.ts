import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { Task } from '../models/task.model';
import { CategoriesComponent } from '../categories/categories.component';

@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = 'http://localhost:8000/api/tasks'; // Base API URL

  constructor(private http: HttpClient) {}

  // Get all tasks
  getdata() {  
    return this.http.get(`${this.apiUrl}`);
  }

  // Get single task
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // Create new task
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  // Update task
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }

  // Delete task
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Error handling (optional)
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong'));
  }
}

// You can merge TasksService into DataService since they're similar
export class TasksService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoriesComponent[]> {
    return this.http.get<CategoriesComponent[]>('http://localhost:8000/api/categories');
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('http://localhost:8000/api/tasks');
  }
}