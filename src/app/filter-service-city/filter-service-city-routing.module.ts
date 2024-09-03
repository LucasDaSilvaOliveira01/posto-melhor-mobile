import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilterServiceCityPage } from './filter-service-city.page';

const routes: Routes = [
  {
    path: '',
    component: FilterServiceCityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilterServiceCityRoutingModule {}
