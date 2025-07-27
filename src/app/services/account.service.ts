import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) { }

  getUserAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`);
  }

  createAccount(accountType: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { accountType });
  }

  getAccountByNumber(accountNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-number/${accountNumber}`);
  }

  getAccountsSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }
}
