import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InternalTransferRequest, Transaction, TransactionRequest, TransferRequest } from '../models/transaction.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'http://localhost:8080/transactions';

  constructor(private http: HttpClient) { }

  deposit(request: TransactionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/deposit`, request);
  }

  withdraw(request: TransactionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/withdraw`, request);
  }

  transfer(request: TransactionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, request);
  }

  getTransactionHistory(accountId: string): Observable<Transaction[]> {
    const params = new HttpParams().set('accountId', accountId);
    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }

  transferByAccountNumber(request: TransferRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer-by-account-number`, request);
  }

  internalTransfer(request: InternalTransferRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/internal-transfer`, request);
  }

  getAllUserTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/all`);
  }

  getRecentTransactions(limit: number = 10): Observable<Transaction[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Transaction[]>(`${this.apiUrl}/recent`, { params });
  }

}
