import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '../../models/account.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { InternalTransferRequest, TransferRequest } from '../../models/transaction.model';

@Component({
  selector: 'app-transfer',
  standalone: false,
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent implements OnInit {
  transferForm: FormGroup;
  currentAccount: Account | null = null;
  userAccounts: Account[] = [];
  loading = false;
  error = '';
  success = '';
  transferType: 'internal' | 'external' = 'internal';
  accountId: string = '';
  recipientAccountInfo: any = null;
  
  categories = ['Transfer', 'Bill Payment', 'Loan Payment', 'Personal', 'Business', 'Other'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {
    this.transferForm = this.fb.group({
      fromAccountId: ['', Validators.required],
      toAccountId: [''], // For internal transfers
      toAccountNumber: [''], // For external transfers
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: [''],
      category: ['Transfer']
    });
  }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.params['accountId'];
    this.loadUserAccounts();
    if (this.accountId) {
      this.loadCurrentAccount();
    }
  }

  loadCurrentAccount(): void {
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.currentAccount = account;
        this.transferForm.patchValue({
          fromAccountId: account.id
        });
      },
      error: (error) => {
        this.error = 'Failed to load account details.';
      }
    });
  }

  loadUserAccounts(): void {
    this.accountService.getUserAccounts().subscribe({
      next: (accounts) => {
        this.userAccounts = accounts;
        if (!this.accountId && accounts.length > 0) {
          // If no specific account is selected, default to first account
          this.transferForm.patchValue({
            fromAccountId: accounts[0].id
          });
          this.currentAccount = accounts[0];
        }
      },
      error: (error) => {
        this.error = 'Failed to load accounts.';
      }
    });
  }

  onTransferTypeChange(): void {
    this.error = '';
    this.success = '';
    this.recipientAccountInfo = null;
    
    if (this.transferType === 'internal') {
      this.transferForm.get('toAccountId')?.setValidators([Validators.required]);
      this.transferForm.get('toAccountNumber')?.clearValidators();
      this.transferForm.patchValue({ toAccountNumber: '' });
    } else {
      this.transferForm.get('toAccountNumber')?.setValidators([Validators.required]);
      this.transferForm.get('toAccountId')?.clearValidators();
      this.transferForm.patchValue({ toAccountId: '' });
    }
    
    this.transferForm.get('toAccountId')?.updateValueAndValidity();
    this.transferForm.get('toAccountNumber')?.updateValueAndValidity();
  }

  onFromAccountChange(): void {
    const selectedAccountId = this.transferForm.get('fromAccountId')?.value;
    this.currentAccount = this.userAccounts.find(acc => acc.id === selectedAccountId) || null;
  }

  validateRecipientAccount(): void {
    const accountNumber = this.transferForm.get('toAccountNumber')?.value;
    if (accountNumber && accountNumber.length >= 10) {
      this.accountService.getAccountByNumber(accountNumber).subscribe({
        next: (response) => {
          if (response.exists) {
            this.recipientAccountInfo = response;
            this.error = '';
          } else {
            this.recipientAccountInfo = null;
            this.error = 'Account not found.';
          }
        },
        error: (error) => {
          this.recipientAccountInfo = null;
          this.error = 'Invalid account number.';
        }
      });
    }
  }

  getAvailableAccounts(): Account[] {
    return this.userAccounts.filter(acc => acc.id !== this.transferForm.get('fromAccountId')?.value);
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      if (this.transferType === 'internal') {
        this.performInternalTransfer();
      } else {
        this.performExternalTransfer();
      }
    }
  }

  private performInternalTransfer(): void {
    const request: InternalTransferRequest = {
      fromAccountId: this.transferForm.get('fromAccountId')?.value,
      toAccountId: this.transferForm.get('toAccountId')?.value,
      amount: this.transferForm.get('amount')?.value,
      description: this.transferForm.get('description')?.value || 'Internal transfer'
    };

    this.transactionService.internalTransfer(request).subscribe({
      next: (response) => {
        this.success = response.message;
        this.loading = false;
        this.transferForm.reset();
        this.transferForm.patchValue({
          fromAccountId: this.currentAccount?.id,
          category: 'Transfer'
        });
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.error || 'Transfer failed';
        this.loading = false;
      }
    });
  }

  private performExternalTransfer(): void {
    const fromAccount = this.userAccounts.find(acc => acc.id === this.transferForm.get('fromAccountId')?.value);
    
    const request: TransferRequest = {
      fromAccountNumber: fromAccount?.accountNumber || '',
      toAccountNumber: this.transferForm.get('toAccountNumber')?.value,
      amount: this.transferForm.get('amount')?.value,
      description: this.transferForm.get('description')?.value || 'External transfer',
      category: this.transferForm.get('category')?.value
    };

    this.transactionService.transferByAccountNumber(request).subscribe({
      next: (response) => {
        this.success = response.message;
        this.loading = false;
        this.transferForm.reset();
        this.transferForm.patchValue({
          fromAccountId: this.currentAccount?.id,
          category: 'Transfer'
        });
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.error || 'Transfer failed';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
