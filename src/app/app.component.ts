import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "./component/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { PermissionService } from './permission.service';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { TasksComponent } from "./tasks/tasks.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, TasksComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'task-manager';
  isLoading = true;
  showNavbar = true;

  constructor(
    private router: Router,
    private permissionService: PermissionService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    const token = localStorage.getItem('auth_token');
    const allStorage = { ...localStorage };
    console.log('All localStorage:', allStorage);
    console.log('Auth token value:', token);
    console.log('Token type:', typeof token);

    if (token) {
    console.log('Token length:', token.length);
    console.log('Token parts:', token.split('.'));
    }

    this.router.events.pipe(
    filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Check if user can access the requested route
      if (!this.permissionService.canAccess(event.url)) {
        // Redirect will be handled by the permission service
        return;
      }

      // Show/hide navbar based on route
       this.showNavbar = !['/login', '/register'].includes(event.url);
    });

    this.isLoading = false;
  }
}
