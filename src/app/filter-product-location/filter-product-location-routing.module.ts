import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilterProductLocationPage } from './filter-product-location.page';

const routes: Routes = [
  {
    path: '',
    component: FilterProductLocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilterProductLocationRoutingModule {}
