import { Component, OnInit } from '@angular/core';
import { DataStorageService, Product } from "./services/data-storage.service";
import { environment } from "../environment/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'app';

  error: string = '';

  constructor(
    private dataStorageService: DataStorageService,
  ) {
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(){
    this.dataStorageService.fetchProducts()
      .subscribe({
          next: (response: Product[]) => {
            console.log(response);
          },
          error: (error) => {
            this.error = error.status === 404 ? `Error: ${error.status}. The requested resource was not found on this server.` : error.message;
          }
        }
      )
  }
}
