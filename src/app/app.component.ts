import { Component, OnInit } from '@angular/core';
import { DataStorageService, Product } from "./services/data-storage.service";
import { environment } from "../environment/environment";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  title = 'app';

  products: Product[] = [];
  error: string = '';

  loading: boolean = true;

  displayedColumns: string[] = ['position', 'name', 'category', 'comment', 'created_at', 'updated_at','expiration_date', 'manufacture_date'];


  constructor(
    private dataStorageService: DataStorageService,
  ) {
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(){
    this.loading = true;

    this.dataStorageService.fetchProducts()
      .subscribe({
          next: (response: Product[]) => {
            this.products = response;
            console.log(response);
            this.loading = false;
          },
          error: (error) => {
            this.error = error.status === 404 ? `Error: ${error.status}. The requested resource was not found on this server.` : error.message;
          }
        }
      )
  }
}
