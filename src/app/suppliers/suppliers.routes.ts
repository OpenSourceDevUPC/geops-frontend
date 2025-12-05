import { Routes } from '@angular/router';
import { SupplierLayoutComponent } from './presentation/components/supplier-layout/supplier-layout.component';
import { SupplierDashboardComponent } from './presentation/views/supplier-dashboard/supplier-dashboard.component';
import { SupplierCampaignsComponent } from './presentation/views/supplier-campaigns/supplier-campaigns.component';
import { SupplierReportsComponent } from './presentation/views/supplier-reports/supplier-reports.component';
import { SupplierReviewsComponent } from './presentation/views/supplier-reviews/supplier-reviews.component';
import { SupplierPlansComponent } from './presentation/views/supplier-plans/supplier-plans.component';
import { SupplierHelpComponent } from './presentation/views/supplier-help/supplier-help.component';
import { SupplierNotificationsComponent } from './presentation/views/supplier-notifications/supplier-notifications.component';
import { SupplierProfileComponent } from './presentation/views/supplier-profile/supplier-profile.component';

export const supplierRoutes: Routes = [
  {
    path: '',
    component: SupplierLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: SupplierDashboardComponent
      },
      {
        path: 'campaigns',
        component: SupplierCampaignsComponent
      },
      {
        path: 'reports',
        component: SupplierReportsComponent
      },
      {
        path: 'reviews',
        component: SupplierReviewsComponent
      },
      {
        path: 'plans',
        component: SupplierPlansComponent
      },
      {
        path: 'help',
        component: SupplierHelpComponent
      },
      {
        path: 'notifications',
        component: SupplierNotificationsComponent
      },
      {
        path: 'profile',
        component: SupplierProfileComponent
      }
    ]
  }
];

