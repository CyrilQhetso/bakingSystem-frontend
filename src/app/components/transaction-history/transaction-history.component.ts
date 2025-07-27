import { Component, OnInit } from '@angular/core';
import { Transaction } from '../../models/transaction.model';
import { Account } from '../../models/account.model';
import { TransactionService } from '../../services/transaction.service';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute } from '@angular/router';
import { StatementService } from '../../services/statement.service';

@Component({
  selector: 'app-transaction-history',
  standalone: false,
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css'
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  account: Account | null = null;
  accountId: string = '';
  loading = true;
  error = '';
  isAllTransactions = false;
  Math = Math;

  // Filters
  selectedCategory = '';
  selectedType = '';
  dateFrom = '';
  dateTo = '';
  searchTerm = '';

  categories = ['Groceries', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];
  transactionTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'];

  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private statementService: StatementService
  ) {}
  
  ngOnInit(): void {
    this.accountId = this.route.snapshot.params['accountId'];
    this.isAllTransactions = this.accountId === 'all';
    if (!this.isAllTransactions) {
      this.loadAccount();
    }
    this.loadTransactions();
  }

  loadAccount(): void {
    if (this.isAllTransactions) { return; }
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.account = account;
      },
      error: (error) => {
        this.error = 'Failed to load account details.';
        console.error(error);
      }
    });
  }

  loadTransactions(): void {
    if (this.isAllTransactions) {
      this.transactionService.getAllUserTransactions().subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.filteredTransactions = transactions;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load all transactions history.';
          console.error(error);
          this.loading = false;
        }
      });
    } else {
      this.transactionService.getTransactionHistory(this.accountId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.filteredTransactions = transactions;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load transaction history.';
        console.error(error);
        this.loading = false;
      }
    });
    }
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesCategory = !this.selectedCategory || transaction.category === this.selectedCategory;
      const matchesType = !this.selectedType || transaction.type === this.selectedType;
      const matchesSearch = !this.searchTerm || (transaction.description && transaction.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      let matchesDateRange = true;
      if (this.dateFrom || this.dateTo) {
        const transactionDate = new Date(transaction.timestamp);
        if (this.dateFrom) {
          matchesDateRange = transactionDate >= new Date(this.dateFrom);
        }
        if (this.dateTo && matchesDateRange) {
          matchesDateRange = transactionDate <= new Date(this.dateTo);
        }
      }
      return matchesCategory && matchesType && matchesSearch && matchesDateRange;
    });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedType = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchTerm = '';
    this.filteredTransactions = this.transactions;
  }

  downloadStatement(): void {
    if (this.isAllTransactions) {
      this.statementService.downloadStatement(this.accountId, new Date().getFullYear(), new Date().getMonth() + 1);
    } else {
      this.statementService.downloadStatement(this.accountId, new Date().getFullYear(), new Date().getMonth() + 1);
    }
  }

  getTransactionAmount(transaction: Transaction, accountId?: string): number {
    if (this.isAllTransactions) {
      if (transaction.type === 'WITHDRAWAL') {
        return -transaction.amount;
      } else if (transaction.type === 'DEPOSIT') {
        return transaction.amount;
      } else {
        return transaction.amount;
      }
    } else {
      if (transaction.type === 'WITHDRAWAL' || (transaction.type === 'TRANSFER' && transaction.fromAccountId === this.accountId)) {
      return -transaction.amount;
    }
    return transaction.amount;
    }
  }

  getTransactionClass(transaction: Transaction): string {
    const amount = this.getTransactionAmount(transaction);
    return amount >= 0 ? 'text-success' : 'text-danger';
  }

  getAccountDisplay(transaction: Transaction): string {
    if (this.isAllTransactions) {
      // Show relevant account number based on transaction type
      if (transaction.type === 'TRANSFER') {
        return `From: ${transaction.fromAccountId || 'Unknown'} → To: ${transaction.toAccountId || 'Unknown'}`;
      } else {
        return transaction.fromAccountId || transaction.toAccountId || 'Unknown';
      }
    }
    return '';
  }

  shouldShowAccountInfo(): boolean {
    return this.isAllTransactions;
  }

  getPageTitle(): string {
    if (this.isAllTransactions) {
      return 'All Transactions';
    } else if (this.account) {
      return `${this.account.accountType} Account Transactions`;
    }
    return 'Transaction History';
  }
}
