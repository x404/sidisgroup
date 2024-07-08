import { Component, OnInit } from '@angular/core';
import {
  Category,
  DataStorageService, ProductDataForCreation,
  ProductWithCategory
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

  dataSource = new MatTableDataSource<ProductWithCategory>([]);
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
          next: (response: ProductWithCategory[]) => {
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
    if (this.dataStorageService.isEditMode) {
      data['editProductId'] = id;
    }

    const dialogRef = this.dialog.open(DialogProductComponent, {
      width: '500px',
      height: '650px',
      data,
    });

    dialogRef.afterClosed()
     .subscribe((product: (ProductWithCategory) ) => {
       if( product ) {
         if (this.dataStorageService.isEditMode && id !== undefined){
           this.updateProduct(id, product);
           this.resetEditMode();
         } else {
           this.addProduct(product);
         }
         this.refreshTable();
       }
    });
  }

  private resetEditMode(){
    this.dataStorageService.isEditMode = false;
  }

  private addProduct(product: ProductWithCategory): void{
    this.dataStorageService.products.unshift(product);
  }

  private updateProduct(id: number, newProductData: ProductWithCategory): void{
    let idx =  this.dataStorageService.products.findIndex((product) => product.id === id);
    this.dataStorageService.products[idx] = newProductData;
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
    this.dataStorageService.isEditMode = true;
    this.openDialog(id)
  }
}
