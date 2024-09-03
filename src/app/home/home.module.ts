import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { ConfigurationProvider } from '../../providers/configuration/configuration';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    HomePageRoutingModule,
    HttpClientModule // Adicionar HttpClientModule aqui
  ],
  declarations: [HomePage],
  providers: [ConfigurationProvider]
})
export class HomePageModule {}
