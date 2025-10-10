import { Component } from '@angular/core';
import { WelcomeBannerComponent } from '../../../../subscriptions/presentation/components/welcome-banner/welcome-banner.component';

@Component({
  selector: 'app-home',
  imports: [
    WelcomeBannerComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
