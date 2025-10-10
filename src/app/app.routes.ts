import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { LoginComponent } from './loyalty/presentation/views/login/login.component';
import { RegisterComponent } from './loyalty/presentation/views/register/register.component';
import { RegisterBussinesComponent } from './loyalty/presentation/views/register-bussines/register-bussines.component';

// Si tu DashboardOwnerComponent está en shared/presentation/views/dashboard-owner/
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-bussines', component: RegisterBussinesComponent },

  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./shared/presentation/views/home/home')
            .then(m => m.Home),
        title: 'GeoPs - Home'
      },
      {
        path: 'ofertas',
        loadComponent: () =>
          import('./loyalty/presentation/views/ofertas/ofertas.component')
            .then(m => m.OfertasComponent),
        title: 'GeoPs - Ofertas'
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./loyalty/presentation/views/categorias/categorias.component')
            .then(m => m.CategoriasComponent),
        title: 'GeoPs - Categorías'
      },
      {
        path: 'favoritos',
        loadComponent: () =>
          import('./loyalty/presentation/views/favoritos/favoritos.component')
            .then(m => m.FavoritosComponent),
        title: 'GeoPs - Favoritos'
      },
      {
        path: 'mis-cupones',
        loadComponent: () =>
          import('./loyalty/presentation/views/mis-cupones/mis-cupones.component')
            .then(m => m.MisCuponesComponent),
        title: 'GeoPs - Mis Cupones'
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./loyalty/presentation/views/profile/profiles.component')
            .then(m => m.ProfilesComponent),
        title: 'GeoPs - Profile'
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./loyalty/presentation/views/settings/settings.component')
            .then(m => m.SettingsComponent),
        title: 'GeoPs - Settings'
      },

      // Este redirect lleva a home si accedes a '/'
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  },

  // Si accedes a una ruta no válida, redirige a login
  { path: '**', redirectTo: '/login' }
];
