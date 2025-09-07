import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen text-center p-4"
         style="background: linear-gradient(135deg, #1a1a2e 0%, #3a3a5e 100%);">
      <div class="max-w-xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white border-opacity-20 text-white">
        <h1 class="text-4xl sm:text-5xl font-extrabold mb-4">
          Welcome to Task Manager
        </h1>
        <p class="text-lg sm:text-xl font-light mb-8 opacity-90">
          Your personal space to manage tasks, collaborate with your team, and stay organized.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/tasks" class="btn btn-primary">
            Go to My Tasks
          </a>
          <a routerLink="/login" class="btn btn-secondary">
            Login
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn {
      @apply py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-md;
    }
    .btn-primary {
      @apply bg-blue-500 text-white hover:bg-blue-600;
    }
    .btn-secondary {
      @apply bg-transparent border border-white text-white hover:bg-white hover:text-blue-500;
    }
  `]
})
export class HomeComponent {}
