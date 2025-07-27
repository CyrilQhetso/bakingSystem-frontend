import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '../../models/account.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-transaction-form',
  standalone: false,
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit  {
  transactionForm: FormGroup;
  transactionType: string = '';
  accountId: string = '';
  account: Account | null = null;
  accounts: Account[] = [];
  loading = false;
  error = '';
  success = '';

  categories = ['Groceries', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private accountService: AccountService
  ) {
    this.transactionForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      toAccountId: [''],
      description: [''],
      category: [''],
    });
  }

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      this.transactionType = url[0]?.path || '';
    });

    this.accountId = this.route.snapshot.params['accountId'];

    if (this.transactionType === 'transfer') {
      this.transactionForm.get('toAccountId')?.setValidators([Validators.required]);
      this.loadAllAccounts();
    }
    this.loadAccount();
  }

  loadAccount(): void {
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.account = account;
      },
      error: (error) => {
        this.error = 'Failed to load account details.';
      }
    });
  }

  loadAllAccounts(): void {
    this.accountService.getUserAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(acc => acc.id !== this.accountId);
      }
    });
  }

  getTransactionIcon(): string {
    switch (this.transactionType) {
      case 'deposit': return 'fas fa-arrow-down';
      case 'withdraw': return 'fas fa-arrow-up';
      case 'transfer': return 'fas fa-exchange-alt';
      default: return 'fas fa-dollar-sign';
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const request = {
        accountId: this.accountId,
        ...this.transactionForm.value
      };

      let operation;
      switch (this.transactionType) {
        case 'deposit':
          operation = this.transactionService.deposit(request);
          break;
        case 'withdraw':
          operation = this.transactionService.withdraw(request);
          break;
        case 'transfer':
          operation = this.transactionService.transfer(request);
          break;
        default:
          this.error = 'Invalid transaction type.';
          this.loading = false;
          return;
      }

      operation.subscribe({
        next: (response) => {
          this.success = response.message;
          this.loading = false;
          this.transactionForm.reset();
          
          // Update the account balance locally for immediate feedback
          if (this.account) {
            const amount = this.transactionForm.get('amount')?.value || 0;
            switch (this.transactionType) {
              case 'deposit':
                this.account.balance += amount;
                break;
              case 'withdraw':
                this.account.balance -= amount;
                break;
              case 'transfer':
                this.account.balance -= amount;
                break;
            }
          }
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']); 
          }, 2000);
        },
        error: (error) => {
          this.error = error.error?.error || 'Transaction failed';
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
