
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
// import { HttpClientModule } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class DataService {
  API_URL = environment.apiUrl;
  ALL_Objects = '/files/objects';
  CREATE_ZIP = '/files/create-zip';
  FETCH_STATUS = '/files/status/';

  constructor(private http: HttpClient) { }

  getObjects(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}${this.ALL_Objects}`);
  }
  fetchStatus(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}${this.FETCH_STATUS}${id}`);
  }

  public createZip(data: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}${this.CREATE_ZIP}`, data, { headers })
        .subscribe((resp: any) => {
          resolve(resp);
        },
          err => {
            reject(err);
          })
    });
  }
}
