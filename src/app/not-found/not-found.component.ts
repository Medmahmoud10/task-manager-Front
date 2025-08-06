import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  template: `
  <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a routerLink="/">Go Home</a>
  `,
    styles: [`
    :host {
      display: block;
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class NotFoundComponent {

}
