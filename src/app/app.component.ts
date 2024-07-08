import { Component, OnInit } from '@angular/core';
import {
  Category,
  DataStorageService,
  ProductWithCategoryObj
} from "./services/data-storage.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogProductComponent } from "./dialog-product/dialog-product.component";
import { MatTableDataSource } from "@angular/material/table";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  title = 'Products';

  error: string = '';
  loading: boolean = true;

  dataSource = new MatTableDataSource<ProductWithCategoryObj>([]);
  displayedColumns: string[] = ['position', 'name', 'category', 'comment', 'expiration_date', 'manufacture_date', 'created_at', 'updated_at', 'fields', 'edit'];

  constructor(
    public dataStorageService: DataStorageService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // TODO:
    this.fetchProducts();
    this.fetchCategories();
  }

  public fetchProducts(){
    this.loading = true;

    this.dataStorageService.fetchProducts()
      .subscribe({
          next: (response: ProductWithCategoryObj[]) => {
            this.dataStorageService.products = response;
            this.refreshTable()
            console.log('response=', response);
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
              this.dataStorageService.categories = response;
              console.log('this.categories=', this.dataStorageService.categories);
              // this.loading = false;
            },
            error: (error) => {
              console.log('error cat', error)
              // TODO: show errors
              // this.error = error.status === 404 ? `Error: ${error.status}. The requested resource was not found on this server.` : error.message;
            }
          }
        )
  }

  public refreshTable(){
    this.dataSource.data = this.dataStorageService.products;
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogProductComponent, {
      width: '500px',
      height: '650px',
      data: {categories: this.dataStorageService.categories},
    });

    dialogRef.afterClosed()
     .subscribe((product:ProductWithCategoryObj) => {
       if( product ) {
         this.addProduct(product);
       }
    });
  }

  public addProduct(product: ProductWithCategoryObj){
    this.dataStorageService.products.unshift(product);
    this.refreshTable();
  }

}
