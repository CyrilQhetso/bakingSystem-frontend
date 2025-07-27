import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatementService {
  private apiUrl = 'http://localhost:8080/statements';

  constructor(private http: HttpClient) { }

  generateMonthlyStatement(accountId: string, year: number, month: number): Observable<Blob> {
    const params = new HttpParams()
      .set('accountId', accountId)
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get(`${this.apiUrl}/monthly`, {
      params,
      responseType: 'blob'
    });
  }

  downloadStatement(accountId: string, year: number, month: number): void {
    this.generateMonthlyStatement(accountId, year, month).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statement-${year}-${month.toString().padStart(2, '0')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Failed to download statement', error);
      }
    });
  }
}
