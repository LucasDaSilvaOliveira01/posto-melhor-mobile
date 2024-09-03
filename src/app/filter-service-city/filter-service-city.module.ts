import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { FilterServiceCityRoutingModule } from './filter-service-city-routing.module';

import { FilterServiceCityPage } from './filter-service-city.page';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { GasStationProvider } from '../../providers/gas-station/gas-station';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    HttpClientModule,
    FilterServiceCityRoutingModule
  ],
  declarations: [FilterServiceCityPage],
  providers: [ConfigurationProvider, GasStationProvider],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FilterServiceCityModule { }
