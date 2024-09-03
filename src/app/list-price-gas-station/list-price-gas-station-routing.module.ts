import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListPriceGasStationPage } from './list-price-gas-station.page';

const routes: Routes = [
  {
    path: '',
    component: ListPriceGasStationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListPriceGasStationRoutingModule {}
