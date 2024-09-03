import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilterProductCityPage } from './filter-product-city.page';

const routes: Routes = [
  {
    path: '',
    component: FilterProductCityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilterProductCityRoutingModule {}
