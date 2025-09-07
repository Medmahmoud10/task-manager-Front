import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <input
        type="text"
        class="form-control search-input"
        [placeholder]="placeholder"
        [(ngModel)]="searchQuery"
        (input)="onSearch()"
        (keydown.enter)="onEnterPress()"
      >
      <button class="btn btn-primary search-btn" (click)="onSearch()" [disabled]="isSearching">
        <i class="fas fa-search" *ngIf="!isSearching"></i>
        <div class="spinner-border spinner-border-sm" role="status" *ngIf="isSearching">
          <span class="visually-hidden">Loading...</span>
        </div>
        {{isSearching ? 'Searching...' : 'Search'}}
      </button>
      <button *ngIf="searchQuery" class="btn btn-secondary clear-btn" (click)="clearSearch()">
        Clear
      </button>
    </div>
  `,
  styles: [`
    .search-container {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .search-input {
      flex: 1;
      min-width: 200px;
    }
    .search-btn, .clear-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Search...';
  @Input() isSearching: boolean = false;
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  searchQuery: string = '';

  onSearch(): void {
    this.search.emit(this.searchQuery);
  }

  onEnterPress(): void {
    this.onSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.clear.emit();
  }
}