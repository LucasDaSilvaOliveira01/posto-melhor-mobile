import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { FilterServiceLocationRoutingModule } from './filter-service-location-routing.module';

import { FilterServiceLocationPage } from './filter-service-location.page';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { GasStationProvider } from '../../providers/gas-station/gas-station';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    HttpClientModule,
    FilterServiceLocationRoutingModule
  ],
  declarations: [FilterServiceLocationPage],
  providers: [ConfigurationProvider, GasStationProvider],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FilterServiceLocationModule { }
