// admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <h2>👑 Admin Dashboard</h2>
      
      <div class="admin-stats">
        <div class="stat-card">
          <h3>Users</h3>
          <p>Manage system users</p>
          <a routerLink="/users" class="btn btn-primary">Manage Users</a>
        </div>
        
        <div class="stat-card">
          <h3>Tasks</h3>
          <p>View all tasks</p>
          <a routerLink="/tasks" class="btn btn-primary">View Tasks</a>
        </div>
        
        <div class="stat-card">
          <h3>Categories</h3>
          <p>Manage categories</p>
          <a routerLink="/categories" class="btn btn-primary">Manage Categories</a>
        </div>
        
        <div class="stat-card">
          <h3>Profiles</h3>
          <p>Manage profiles</p>
          <a routerLink="/profiles" class="btn btn-primary">Manage Profiles</a>
        </div>
      </div>

      <div class="admin-info">
        <h3>Admin Privileges</h3>
        <ul>
          <li>✅ Create, edit, and delete users</li>
          <li>✅ Manage all tasks and categories</li>
          <li>✅ Access all user profiles</li>
          <li>✅ Update task statuses</li>
          <li>✅ Full system control</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .admin-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }
    
    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }
    
    .stat-card p {
      margin: 0 0 1rem 0;
      color: #6c757d;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
    }
    
    .btn-primary:hover {
      background: #0056b3;
    }
    
    .admin-info {
      background: #e8f5e8;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }
    
    .admin-info h3 {
      margin: 0 0 1rem 0;
      color: #155724;
    }
    
    .admin-info ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .admin-info li {
      margin-bottom: 0.5rem;
      color: #155724;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    console.log('Admin Dashboard loaded');
    console.log('User is admin:', this.authService.isAdmin());
  }
}