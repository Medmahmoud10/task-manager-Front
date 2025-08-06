import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8000/api/categories';

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les catégories (GET /api/categories)
   */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des catégories:', error);
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    );
  }

  /**
   * Crée une nouvelle catégorie (POST /api/categories)
   */
  create(category: { name: string }): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      catchError(error => {
        console.error('Erreur lors de la création:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère une catégorie spécifique (GET /api/categories/{id})
   */
  get(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur avec la catégorie ID ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Met à jour une catégorie (PUT/PATCH /api/categories/{id})
   */
  update(id: number, updates: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, updates).pipe(
      catchError(error => {
        console.error(`Erreur lors de la mise à jour ID ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Supprime une catégorie (DELETE /api/categories/{id})
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la suppression ID ${id}:`, error);
        throw error;
      })
    );
  }
}