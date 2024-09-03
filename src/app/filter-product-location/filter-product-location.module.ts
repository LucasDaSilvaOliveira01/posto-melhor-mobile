import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; 

import { FilterProductLocationRoutingModule } from './filter-product-location-routing.module';

import { FilterProductLocationPage } from './filter-product-location.page';
import { ConfigurationProvider } from '../providers/configuration/configuration';
import { GasStationProvider } from '../providers/gas-station/gas-station';
import { SharedDataService } from '../services/shared-data.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    HttpClientModule,
    FilterProductLocationRoutingModule
  ],
  declarations: [FilterProductLocationPage],
  providers: [ConfigurationProvider, GasStationProvider],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FilterProductLocationModule {}
