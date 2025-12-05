import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { LoginComponent } from './identity/presentation/views/login/login.component';
import { RegisterComponent } from './identity/presentation/views/register/register.component';
import { RegisterBussinesComponent } from './identity/presentation/views/register-bussines/register-bussines.component';
// import { AuthGuard } from 'ruta/del/authguard'; // si tienes guard

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' }, // redirige raíz a login
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-bussines', component: RegisterBussinesComponent },

  {
    path: '',
    component: Layout,
    // canActivate: [AuthGuard], // descomentar si tienes guard
    children: [
      {
        path: 'help/help-center',
        loadComponent: () =>
          import('./help/presentation/views/help-center/help-center.component')
            .then(m => m.HelpCenterComponent),
        title: 'GeoPs - Help Center'
      },
      {
        path: 'help/help-center-provider',
        loadComponent: () =>
          import('./help/presentation/views/help-center-provider/help-center-provider.component')
            .then(m => m.HelpCenterProviderComponent),
        title: 'GeoPs - Help Center Provider'
      },
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
      { path: 'ofertas/:id',
        loadComponent: () =>
          import('./loyalty/presentation/views/ver-oferta/ver-oferta.component')
            .then(m => m.VerOfertaComponent)
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
          import('./identity/presentation/views/profile/profiles.component')
            .then(m => m.ProfilesComponent),
        title: 'GeoPs - Profile'
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./identity/presentation/views/settings/settings.component')
            .then(m => m.SettingsComponent),
        title: 'GeoPs - Settings'
      },
      {
        path: 'resumen',
        loadComponent: () =>
          import('./loyalty/presentation/views/resumen/resumen.component')
            .then(m => m.ResumenComponent),
        title: 'GeoPs - Resumen'
      },
      {
        path: 'campañas',
        loadComponent: () =>
          import('./loyalty/presentation/views/campañas/campañas.component')
            .then(m => m.CampañasComponent),
        title: 'GeoPs - Campañas'
      },
      {
        path: 'crear-campañas',
        loadComponent: () =>
          import('./loyalty/presentation/views/crear-campañas/crear-campañas.component')
            .then(m => m.CrearCampañasComponent),
        title: 'GeoPs - Crear Campaña'
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./loyalty/presentation/views/reportes/reportes.component')
            .then(m => m.ReportesComponent),
        title: 'GeoPs - Reportes'
      },
      {
        path: 'comentarios',
        loadComponent: () =>
          import('./loyalty/presentation/views/comentarios/comentarios.component')
            .then(m => m.ComentariosComponent),
        title: 'GeoPs - Comentarios'
      }
    ]
  },

  { path: '**', redirectTo: '/login' } // cualquier otra ruta, manda a login
];
