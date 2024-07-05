import { Component, OnInit } from '@angular/core';
import { Category, DataStorageService, Product } from "./services/data-storage.service";
import { environment } from "../environment/environment";
import { MatDialog } from "@angular/material/dialog";
import { DialogProductComponent } from "./dialog-product/dialog-product.component";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  title = 'app';

  products: Product[] = [];
  categories: Category[] = [];

  error: string = '';

  loading: boolean = true;

  displayedColumns: string[] = ['position', 'name', 'category', 'comment', 'created_at', 'updated_at','expiration_date', 'manufacture_date', 'edit'];


  constructor(
    private dataStorageService: DataStorageService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
  }

  public fetchProducts(){
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

  public fetchCategories(){
    this.dataStorageService.fetchCategories()
        .subscribe({
            next: (response: Category[]) => {
              this.categories = response;
              console.log('this.categories=', this.categories);
              // this.loading = false;
            },
            error: (error) => {
              console.log('error cat', error)
              // this.error = error.status === 404 ? `Error: ${error.status}. The requested resource was not found on this server.` : error.message;
            }
          }
        )
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogProductComponent, {
      width: '450px',
      height: '650px',
      data: {categories: this.categories},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
