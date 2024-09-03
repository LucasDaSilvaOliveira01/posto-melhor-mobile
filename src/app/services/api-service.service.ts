import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiKey = 'AIzaSyCP77hgD1OVKFj8RfeGjb_oKZNzm94lOo8';

  getApiKey(): string {
    return this.apiKey;
  }
  constructor() { }
}
