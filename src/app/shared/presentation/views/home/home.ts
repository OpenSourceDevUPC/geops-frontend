import { Component } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WelcomeBannerComponent } from '../../../../subscriptions/presentation/components/welcome-banner/welcome-banner.component';

@Component({
  selector: 'app-home',
  imports: [
    TranslatePipe,
    WelcomeBannerComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  username = 'Ariana';
  plan = 1;//1 stands for Free Plan, 2 stands for Premium Plan
  categories = [
    { key: 'all', label: 'home.map.all' },
    { key: 'cinemas', label: 'home.map.cinemas' },
    { key: 'buffets', label: 'home.map.buffets' },
    { key: 'parks', label: 'home.map.parks' },
    { key: 'children', label: 'home.map.for-children' },
    { key: 'makis', label: 'home.map.makis' },
    { key: 'beauty', label: 'home.map.beauty' }
  ];
  selectedCategories:string[] = ['all'];

  /**
   * Verifies if the plan is a Premium Plan or not
   * @param plan - Detects if the plan is premium. 1 means Premium Plan, 2 or any number means Free plan
   * @returns If the user is premium or not.
   */
  isPremium(plan: number): boolean {
    return plan === 1;
  }

  /**
   * Selects the categories selected in the map filter. If the user selects All, it will only
   * select All category and unselects the other categories.
   * @param catKey - Detects which category was selected and pushes into selectedCategories array.
   */
  selectCategory(catKey: string) {
    if (catKey === 'all') {
      this.selectedCategories = ['all'];
    }
    else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== 'all');
      if (this.selectedCategories.includes(catKey)) {
        this.selectedCategories = this.selectedCategories.filter(c => c !== catKey);
      }
      else {
        this.selectedCategories.push(catKey);
      }
    }
  }

  /**
   * Verifies if the category selected is in the selectedCategories array.
   * @param catKey - The string of the category
   * @returns If the category is in the selectedCategory array.
   */
  isCategoryActive(catKey: string): boolean {
    return this.selectedCategories.includes(catKey);
  }
}
