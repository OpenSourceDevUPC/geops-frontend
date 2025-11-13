import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouponListComponent } from '../../../../coupons/presentation/components/coupon-list/coupon-list';
import { TranslateModule } from '@ngx-translate/core';
import { CouponsApi } from '../../../../coupons/infrastructure/coupons-api';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';

@Component({
  selector: 'app-mis-cupones',
  standalone: true,
  imports: [CommonModule, CouponListComponent, TranslateModule],
  templateUrl: './mis-cupones.component.html',
  styleUrls: ['./mis-cupones.component.css'],
})
export class MisCuponesComponent implements OnInit {
  private couponsApi = inject(CouponsApi);
  private authService = inject(AuthService);

  /**
   * crea una instancia del componente ofertascomponent
   */
  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId !== null && userId !== undefined) {
      // fetch coupons for current user including expanded offer data
      this.couponsApi.getAllWithRelationsByUser(String(userId)).subscribe();
    }
  }
}
