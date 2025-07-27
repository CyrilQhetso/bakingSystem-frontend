export interface Transaction {
    id: string;
    fromAccountId?: string;
    toAccountId?: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    description?: string;
    category?: string;
    timestamp: string;
}

export interface TransactionRequest {
    accountId: string;
    amount: number;
    toAccountId?: string;
    description?: string;
    category?: string;
}

export interface TransferRequest {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
  category?: string;
}

export interface InternalTransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}