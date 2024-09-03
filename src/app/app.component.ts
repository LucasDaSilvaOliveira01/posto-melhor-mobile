import { Component, ElementRef, Renderer2 } from '@angular/core';
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

  dropDownMenuVisible: boolean = false;

  constructor(
    private menu: MenuController,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  public openPanel(): void {
    window.open(AppComponent.URL, AppComponent.TARGET_SYSTEM);
  }

  public openBrowser(): void {
    window.open(AppComponent.URL, AppComponent.TARGET_SYSTEM);
  }

  toggleDropListMenu() {

    const dropDnwMenu = this.el.nativeElement.querySelector(".dropdown-list-menu");
    const arrowIcon = this.el.nativeElement.querySelector(".arrow-drop-down-menu");

    if (!this.dropDownMenuVisible) {
      this.renderer.setStyle(dropDnwMenu, 'height', '246.4px');
      this.renderer.setStyle(arrowIcon, 'transform', 'translateY(-10px)  rotate(0deg)');
      this.dropDownMenuVisible = true;
    } else {
      this.renderer.setStyle(dropDnwMenu, 'height', '0px');
      this.renderer.setStyle(arrowIcon, 'transform', 'translateY(-10px)  rotate(90deg)');
      this.dropDownMenuVisible = false;
    }

  }

  //Menu navigation
  public appPages = [
    { title: 'Início', url: '/map', icon: 'map' },
    { title: 'Preços Por Localização', url: '/filter-product-location' },
    { title: 'Preço de Combustíveis', url: '/list-price-gas-station' },
  ];
}
