// users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
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
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8000/api';
  private http = inject(HttpClient);

  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    const cleanToken = token?.replace(/['"]/g, '') || '';
    
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  getUsers(): Observable<{users: User[]}> {
    return this.http.get<{users: User[]}>(`${this.apiUrl}/users`, this.getAuthHeaders());
  }

  getUser(id: number): Observable<{user: User}> {
    return this.http.get<{user: User}>(`${this.apiUrl}/users/${id}`, this.getAuthHeaders());
  }

  // ADD THIS METHOD
  updateUser(id: number, userData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/users/${id}`, userData, this.getAuthHeaders());
  }

  // ADD OTHER CRUD METHODS AS NEEDED
  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData, this.getAuthHeaders());
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, this.getAuthHeaders());
  }
}