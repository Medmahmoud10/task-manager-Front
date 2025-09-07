import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { BehaviorSubject } from 'rxjs';
import { PriorityLevel } from '../models/task.model';



@Injectable({
  providedIn: 'root'
})


export class TaskService {
  
  private apiUrl = 'http://localhost:8000/api/tasks';
  private tasks: Task[] = [
    {
      id: 1,
      title: 'Complete Angular project',
      description: 'Finish task manager app',
      priority: 'high' as PriorityLevel,
      status: 'pending',
      categorie_id: 2,
      newCategorie: 'Frontend',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      priority: 'medium' as PriorityLevel,
      status: 'pending',
      categorie_id:  1 ,
      newCategorie: 'Backend',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks);
  tasks$ = this.tasksSubject.asObservable();
  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<any> {
    return this.http.get(this.apiUrl);
  }



  // Get single task by ID
  getTaskById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }


  createTask(taskData: any): Observable<any> {
    return this.http.post(this.apiUrl, taskData);
  }

  // Update task
  updateTask(id: number, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, taskData);
  }

  // Delete task
  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get all categories
  getAllCategories(): Observable<any> {
    return this.http.get('http://localhost:8000/api/categories');
  }

  // Get categories for a specific task
  getTaskCategories(taskId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${taskId}/categories`);
  }
}
