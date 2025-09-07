// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profile {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  user_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api'; // Your Laravel API URL

  constructor(private http: HttpClient) { }

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiUrl}/profiles`);
  }

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profiles/${id}`);
  }
}