import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],
})

export class AppHeaderComponent {
  @Output() searchTerm = new EventEmitter<string>();
  q = '';

  doSearch() {
    const term = this.q.trim();
    console.log('[Header] submit:', term);
    this.searchTerm.emit(term);
  }

  userName = 'Ariana';
  get userInitial(){ const n = this.userName?.trim(); return n ? n[0].toUpperCase() : '?'; }
}
