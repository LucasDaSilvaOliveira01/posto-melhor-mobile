import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MockRoutingModule } from './mock-routing.module';
import { MockPage } from './mock.page';

import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { HttpClientModule } from '@angular/common/http'; 
import { GasStationProvider } from '../providers/gas-station/gas-station';
import { SharedDataService } from '../services/shared-data.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    MockRoutingModule
  ],
  declarations: [MockPage],
  providers: [ConfigurationProvider, GasStationProvider]
})
export class MockPageModule {}
