import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';
import { TransferComponent } from './components/transfer/transfer.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'deposit/:accountId', component: TransactionFormComponent, canActivate: [AuthGuard] },
  { path: 'withdraw/:accountId', component: TransactionFormComponent, canActivate: [AuthGuard] },
  { path: 'transfer/:accountId', component: TransactionFormComponent, canActivate: [AuthGuard] },
  { path: 'enhanced-transfer', component: TransferComponent, canActivate: [AuthGuard] },
  { path: 'enhanced-transfer/:accountId', component: TransferComponent, canActivate: [AuthGuard] },
  { path: 'transactions/:accountId', component: TransactionHistoryComponent, canActivate: [AuthGuard] },
  { path: 'transactions/all', component: TransactionHistoryComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
