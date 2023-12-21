import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Parameter } from '../entity/parameter';
import { Product } from '../entity/product';
import { Service } from '../entity/service';
import { State } from '../entity/state';

declare var navigator: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public static products: Product[] = [];
  public static services: Service[] = [];
  public static parameters: Parameter[] = [];
  public static states: State[] = [];

  private static readonly URL = 'http://painel.postomelhor.com.br/';
  private static readonly TARGET_SYSTEM = '_system';
  private static readonly FIRST_PAGE_OPEN = 0;

  public version: string = "1.0.0";

  constructor(private menu: MenuController) {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  public openPanel(): void {
    window.open(AppComponent.URL, AppComponent.TARGET_SYSTEM);
  }

  public openBrowser(): void {
    window.open(AppComponent.URL, AppComponent.TARGET_SYSTEM);
  }

  //Menu navigation
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Mapa', url: '/map', icon: 'map' },
  ];
}
