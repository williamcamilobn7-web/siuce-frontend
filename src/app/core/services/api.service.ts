import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, { headers: this.headers() });
  }
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`, { headers: this.headers() });
  }
  postForm<T>(path: string, form: FormData): Observable<T> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
    return this.http.post<T>(`${this.base}${path}`, form, { headers });
  }
}