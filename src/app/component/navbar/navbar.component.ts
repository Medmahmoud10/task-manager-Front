import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  // styleUrls: ['./navbar.component.scss']

  styles: [`
    nav {
      background: #333;
      padding: 1rem;
      ul {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        li {
          margin-right: 1rem;
          a {
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            &:hover {
              background: #555;
            }
            &.active {
              background: #007bff;
            }
          }
        }
      }
    }
  `]
})
export class NavbarComponent {}