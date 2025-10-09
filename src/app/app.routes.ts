import { Routes } from '@angular/router';
import {Layout} from './shared/presentation/components/layout/layout';

export const routes: Routes = [
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

      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
