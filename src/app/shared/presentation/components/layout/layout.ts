import { Component } from '@angular/core';
import {MatToolbar, MatToolbarRow} from '@angular/material/toolbar';
import {MatButton} from '@angular/material/button';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {FooterContent} from '../footer-content/footer-content';

@Component({
  selector: 'app-layout',
  imports: [
    MatToolbar,
    MatToolbarRow,
    MatButton,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    RouterOutlet,
    FooterContent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  options = [
    {link: '/home', label: 'option.home'},
  ]
}
