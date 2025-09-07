// src/app/core/services/shared-data.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private tasks$ = new BehaviorSubject<any[] | null>(null);
  private categories$ = new BehaviorSubject<any[] | null>(null);
  private profiles$ = new BehaviorSubject<any[] | null>(null);
  private users$ = new BehaviorSubject<any[] | null>(null);

    getTasks(params?: any): Observable<any[]> {
    const url = 'http://127.0.0.1:8000/api/tasks';
    return this.http.get<any[]>(url, { params }).pipe(
      tap(tasks => this.tasks$.next(tasks)),
      catchError(error => {
        console.error('Error fetching tasks', error);
        return of([]);
      })
    );
  }

  getCategories(): Observable<any[]> {
    if (this.categories$.value) {
      return this.categories$.asObservable() as Observable<any[]>;
    }
    return this.http.get<any[]>('/api/categories').pipe(
      tap(categories => this.categories$.next(categories)),
      catchError(error => {
        console.error('Error fetching categories', error);
        return of([]);
      })
    );
  }

  getProfiles(): Observable<any[]> {
    if (this.profiles$.value) {
      return this.profiles$.asObservable() as Observable<any[]>;
    }
    return this.http.get<any[]>('/api/profiles').pipe(
      tap(profiles => this.profiles$.next(profiles)),
      catchError(error => {
        console.error('Error fetching profiles', error);
        return of([]);
      })
    );
  }

  getUsers(): Observable<any[]> {
    if (this.users$.value) {
      return this.users$.asObservable() as Observable<any[]>;
    }
    return this.http.get<any[]>('/api/users').pipe(
      tap(users => this.users$.next(users)),
      catchError(error => {
        console.error('Error fetching users', error);
        return of([]);
      })
    );
  }

  clearCache(): void {
    this.tasks$.next(null);
    this.categories$.next(null);
    this.profiles$.next(null);
    this.users$.next(null);
  }
}