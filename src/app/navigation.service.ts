// src/app/navigation.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private previousUrl: string = '';
  private currentUrl: string = '';

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    
    // REMOVE the problematic NavigationStart event handling
    // Just track NavigationEnd events for URL history
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.previousUrl = this.currentUrl;
      this.currentUrl = event.url;
    });
  }

  // Get current URL
  getCurrentUrl(): string {
    return this.currentUrl;
  }

  // Get previous URL
  getPreviousUrl(): string {
    return this.previousUrl;
  }

  // Simple navigate method without permission checks
  navigate(commands: any[], extras?: any): void {
    this.router.navigate(commands, extras);
  }
}
