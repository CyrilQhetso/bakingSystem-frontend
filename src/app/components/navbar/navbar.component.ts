import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  user: User | null = null;
  currentRoute = '';
  showDashboardLink = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.authService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (this.isAuthenticated){
        this.loadUser();
      }
    });

    // Listen to route changes to determine if dashboard link should be shown
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      this.updateDashboardLinkVisibility();
    });

    // Set initial route
    this.currentRoute = this.router.url;
    this.updateDashboardLinkVisibility();
  }

  private updateDashboardLinkVisibility(): void {
    const hideDashboardRoutes = ['/login', '/register', '/dashboard', '/'];
    this.showDashboardLink = !hideDashboardRoutes.includes(this.currentRoute);
  }

  loadUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Failed to load user data', error);
      }
    })
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
