import { Component, OnInit } from '@angular/core';
import {
  Category,
  DataStorageService,
  ProductWithCategoryObj
} from "./services/data-storage.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogData, DialogProductComponent } from "./dialog-product/dialog-product.component";
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

  public fetchProducts(): void{
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

  public fetchCategories(): void{
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

  public refreshTable(): void{
    this.dataSource.data = this.dataStorageService.products;
  }


  openDialog(id?: number): void {
    const data : DialogData = {categories: this.dataStorageService.categories}
    if (id) {
      data['idProduct'] = id;
    }

    const dialogRef = this.dialog.open(DialogProductComponent, {
      width: '500px',
      height: '650px',
      data,
    });

    dialogRef.afterClosed()
     .subscribe((product:ProductWithCategoryObj) => {
       if( product ) {
         this.addProduct(product);
         this.refreshTable();
       }
    });
  }

  public addProduct(product: ProductWithCategoryObj): void{
    this.dataStorageService.products.unshift(product);
  }

  public onDeleteProduct(id: number): void {
   this.dataStorageService.deleteProductById(id).subscribe({
     next: () => {
       this.deleteProduct(id);
       this.refreshTable();
     },
     error: (error) => {
       console.log('There was a deleting error!', error)
     }
   })
  }

  private deleteProduct(id: number): void {
    this.dataStorageService.products = this.dataStorageService.products.filter(product => product.id !== id);
  }

  public onEditProduct(id: number): void {
    this.openDialog(id)
  }
}
