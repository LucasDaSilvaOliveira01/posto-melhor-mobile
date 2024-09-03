import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import { ConfigurationProvider } from '../providers/configuration/configuration';
import { GasStationProvider } from '../providers/gas-station/gas-station';
import { SharedDataService } from '../services/shared-data.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    MapPageRoutingModule
  ],
  declarations: [MapPage],
  providers: [ConfigurationProvider, GasStationProvider]
})
export class MapPageModule {}
