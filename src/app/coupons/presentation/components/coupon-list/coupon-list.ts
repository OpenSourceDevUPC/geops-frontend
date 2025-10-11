import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CouponItemComponent } from '../coupon-item/coupon-item';
import { CouponsApi } from '../../../../coupons/infrastructure/coupons-api';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, CouponItemComponent],
  templateUrl: './coupon-list.html',
  styleUrls: ['./coupon-list.css'],
})
export class CouponListComponent {
  coupons: any[] = [];

  constructor(private couponsApi: CouponsApi) {
    // subscribe to the shared coupons stream
    this.couponsApi.coupons$.subscribe((list: any[]) => this.coupons = list);
    // ensure there's an initial load (the route or parent may also call getAllWithRelationsByUser)
    this.couponsApi.getAllCoupons().subscribe();
  }
}
