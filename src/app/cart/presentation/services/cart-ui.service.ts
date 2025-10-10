import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartUiService {
  private openCartSubject = new Subject<void>();
  
  openCart$ = this.openCartSubject.asObservable();

  /**
   * Opens the cart sidebar
   */
  openCart(): void {
    this.openCartSubject.next();
  }
}