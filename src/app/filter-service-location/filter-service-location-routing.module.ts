import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilterServiceLocationPage } from './filter-service-location.page';

const routes: Routes = [
  {
    path: '',
    component: FilterServiceLocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilterServiceLocationRoutingModule {}
