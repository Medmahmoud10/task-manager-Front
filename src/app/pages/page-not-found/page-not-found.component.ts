import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-900 text-white">
      <h1 class="text-9xl font-extrabold text-gray-700 opacity-50">404</h1>
      <h2 class="text-4xl font-bold mb-4">Page Not Found</h2>
      <p class="text-lg font-light mb-8 text-gray-400">
        The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <a routerLink="/home" class="py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white shadow-md">
        Go to Home
      </a>
    </div>
  `,
  styles: []
})
export class PageNotFoundComponent {}
