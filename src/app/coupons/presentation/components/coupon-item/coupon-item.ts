import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OffersApiEndpoint } from '../../../../loyalty/infrastructure/offers-api-endpoint';

@Component({
  selector: 'app-coupon-item',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './coupon-item.html',
  styleUrls: ['./coupon-item.css']
})
export class CouponItemComponent implements OnInit{
  @Input() coupon: any = {};
  title?: string;
  private offersApi = inject(OffersApiEndpoint);
  offerPrice?: number;
  paymentDate?: string;

  ngOnInit(): void {
    // Prefer embedded offer data when available to avoid extra HTTP calls
    if (this.coupon && this.coupon.offer) {
      this.title = this.coupon.offer.title;
      this.offerPrice = this.coupon.offer.price;
    } else if (this.coupon && this.coupon.productType === 'offer' && this.coupon.offerId) {
      // fallback: fetch offer data by id
      const id = Number(this.coupon.offerId);
      if (!isNaN(id)) {
        this.offersApi.getByIds([id]).subscribe(list => {
          if (list && list.length > 0) this.title = list[0].title;
          if (list && list.length > 0) this.offerPrice = list[0].price;
        });
      }
    }

    // derive a human-friendly payment date if available
    if (this.coupon && this.coupon.createdAt) {
      try {
        this.paymentDate = new Date(this.coupon.createdAt).toLocaleDateString();
      } catch (e) {
        // ignore invalid date
      }
    }
  }

  copy(){
    try {
      navigator.clipboard.writeText(this.coupon.code);
    } catch(e){
      console.warn('Copy failed', e);
    }
  }
}
