import { Component, OnInit } from '@angular/core';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  accounts: Account[] = [];
  user: User | null = null;
  recentTransactions: Transaction[] = [];
  loading = true;
  error = '';
  totalBalance: number = 0;
  monthlyIncome: number = 0;
  monthlyExpenses: number = 0;
  
  // Account creation modal
  showCreateAccountModal = false;
  newAccountType = 'checking';
  accountTypes = [
    { value: 'checking', label: 'Checking Account', icon: 'fas fa-credit-card' },
    { value: 'savings', label: 'Savings Account', icon: 'fas fa-piggy-bank' },
    { value: 'business', label: 'Business Account', icon: 'fas fa-briefcase' }
  ];

  constructor(
    private accountService: AccountService, 
    private userService: UserService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadAccountsData();
    this.loadRecentTransactions();
  }

  loadUserData(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Failed to load user data', error);
      }
    });
  }

  loadAccountsData(): void {
    // Use the summary endpoint which calculates total balance server-side
    this.accountService.getAccountsSummary().subscribe({
      next: (summary) => {
        this.accounts = summary.accounts;
        this.totalBalance = summary.totalBalance;
        this.loading = false;
        this.calculateMonthlyStats();
      },
      error: (error) => {
        // Fallback to regular accounts endpoint
        this.accountService.getUserAccounts().subscribe({
          next: (accounts) => {
            this.accounts = accounts;
            this.calculateTotalBalance();
            this.loading = false;
            this.calculateMonthlyStats();
          },
          error: (error) => {
            this.error = 'Failed to load accounts';
            this.loading = false;
          }
        });
      }
    });
  }

  loadRecentTransactions(): void {
    this.transactionService.getRecentTransactions(5).subscribe({
      next: (transactions) => {
        this.recentTransactions = transactions;
      },
      error: (error) => {
        console.error('Failed to load recent transactions', error);
      }
    });
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  }

  calculateMonthlyStats(): void {
    // Calculate monthly income and expenses from recent transactions
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    this.monthlyIncome = 0;
    this.monthlyExpenses = 0;
    
    this.recentTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
        if (transaction.type === 'DEPOSIT') {
          this.monthlyIncome += transaction.amount;
        } else if (transaction.type === 'WITHDRAWAL') {
          this.monthlyExpenses += transaction.amount;
        }
      }
    });
  }

  refreshData(): void {
    this.loading = true;
    this.loadAccountsData();
    this.loadRecentTransactions();
  }

  openCreateAccountModal(): void {
    this.showCreateAccountModal = true;
  }

  closeCreateAccountModal(): void {
    this.showCreateAccountModal = false;
    this.newAccountType = 'checking';
  }

  createNewAccount(): void {
    this.accountService.createAccount(this.newAccountType).subscribe({
      next: (response) => {
        this.closeCreateAccountModal();
        this.refreshData(); // Refresh to show new account
        // Show success message (you can implement a toast or alert here)
        alert('Account created successfully!');
      },
      error: (error) => {
        this.error = error.error?.error || 'Failed to create account';
        console.error('Failed to create account', error);
      }
    });
  }

  getCardTypeIcon(accountType: string): string {
    switch (accountType?.toLowerCase()) {
      case 'checking': return 'fas fa-credit-card';
      case 'savings': return 'fas fa-piggy-bank';
      case 'business': return 'fas fa-briefcase';
      default: return 'fas fa-credit-card';
    }
  }

  getCardGradient(accountType: string): string {
    switch (accountType?.toLowerCase()) {
      case 'checking': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'savings': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'business': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }

  maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return '•••• •••• •••• ••••';
    return `•••• •••• •••• ${cardNumber.slice(-4)}`;
  }

  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) return '•••• •••• •••• ••••';
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  getTransactionAmount(transaction: Transaction, accountId: string): number {
    if (transaction.type === 'WITHDRAWAL' || 
        (transaction.type === 'TRANSFER' && transaction.fromAccountId === accountId)) {
      return -transaction.amount;
    }
    return transaction.amount;
  }

  getTransactionClass(transaction: Transaction, accountId: string): string {
    const amount = this.getTransactionAmount(transaction, accountId);
    return amount >= 0 ? 'text-success' : 'text-danger';
  }

  getTransactionIcon(transaction: Transaction): string {
    switch (transaction.type) {
      case 'DEPOSIT': return 'fas fa-arrow-down text-success';
      case 'WITHDRAWAL': return 'fas fa-arrow-up text-warning';
      case 'TRANSFER': return 'fas fa-exchange-alt text-info';
      default: return 'fas fa-dollar-sign';
    }
  }

  navigateToTransfer(accountId?: string): void {
    if (accountId) {
      // Navigate to transfer with specific account selected
      window.location.href = `/enhanced-transfer/${accountId}`;
    } else {
      // Navigate to general transfer page
      window.location.href = '/enhanced-transfer';
    }
  }

  canCreateMoreAccounts(accountType: string): boolean {
    const sameTypeCount = this.accounts.filter(acc => 
      acc.accountType.toLowerCase() === accountType.toLowerCase()
    ).length;
    return sameTypeCount < 2;
  }

  getAccountTypeCount(accountType: string): number {
    return this.accounts.filter(acc => 
      acc.accountType.toLowerCase() === accountType.toLowerCase()
    ).length;
  }

  public abs(value: number): number {
    return Math.abs(value);
  }
}
