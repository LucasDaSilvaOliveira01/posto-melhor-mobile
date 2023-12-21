import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiKey = 'AIzaSyDNbSnMzTb0HF5dVy_8r-dNSg8yAaxO7TY';

  getApiKey(): string {
    return this.apiKey;
  }
  constructor() { }
}
