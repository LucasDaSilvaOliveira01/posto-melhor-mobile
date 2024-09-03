import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'mock',
    loadChildren: () => import('./mock/mock.module').then( m => m.MockPageModule),
  },
  {
    path: '',
    redirectTo: 'mock',
    pathMatch: 'full'
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'list-price-gas-station',
    loadChildren: () => import('./list-price-gas-station/list-price-gas-station.module').then(m => m.ListPriceGasStationModule)
  },
  {
    path: 'filter-product-location',
    loadChildren: () => import('./filter-product-location/filter-product-location.module').then(m => m.FilterProductLocationModule)
  },
  {
    path: 'filter-product-city',
    loadChildren: () => import('./filter-product-city/filter-product-city.module').then(m => m.FilterProductCityModule)
  },
  {
    path: 'filter-service-location',
    loadChildren: () => import('./filter-service-location/filter-service-location.module').then(m => m.FilterServiceLocationModule)
  },
  {
    path: 'filter-service-city',
    loadChildren: () => import('./filter-service-city/filter-service-city.module').then(m => m.FilterServiceCityModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
