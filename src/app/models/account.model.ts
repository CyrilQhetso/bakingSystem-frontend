export interface Account {
    id: string;
    userId: string;
    accountNumber: string;
    accountType: 'checking' | 'savings' | 'business';
    balance: number;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    createdAt: Date;
}

export interface CreateAccountRequest {
  accountType: string;
}

export interface AccountSummary {
  totalAccounts: number;
  totalBalance: number;
  accounts: Account[];
}