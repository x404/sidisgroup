import { Component, OnInit } from '@angular/core';
import {
  DataStorageService,
} from "./services/data-storage.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogData, DialogProductComponent } from "./dialog-product/dialog-product.component";
import { environment } from "../environment/environment";
import { Category, ProductWithCategory } from "./types/interfaces";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Products';

  productError: string = '';
  categoryError: string = '';

  productsLoading: boolean = true;
  categoriesLoading: boolean = true;

  displayedColumns: string[] = ['position', 'name', 'category', 'comment', 'expiration_date', 'manufacture_date', 'created_at', 'updated_at', 'fields', 'edit'];

  constructor(
    public dataStorageService: DataStorageService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
  }

  private fetchProducts(): void {
    this.productsLoading = true;

    this.dataStorageService.fetchProducts()
        .subscribe({
            next: (response: ProductWithCategory[]) => {
              console.log(response);
              this.dataStorageService.products = response;
              this.dataStorageService.refreshTable();
              this.productsLoading = false;
            },
            error: (error) => {
              this.productError = error.status === 404 ? `Error: ${error.status}. The requested resource was not found on this server.` : error.message;
            }
          }
        )
  }

  private fetchCategories(): void {
    this.dataStorageService.fetchCategories()
        .subscribe({
            next: (response: Category[]) => {
              this.dataStorageService.categories = response;
              this.categoriesLoading = false;
            },
            error: (error) => {
              console.error('Request categories error ', error)
              this.categoryError = error.status === 404 ? `Error: ${error.status}. The requested resource was not found on this server.` : error.message;
            }
          }
        )
  }

  onAddProduct(){
    this.dataStorageService.resetEditMode();
    this.openDialog();
  }

  openDialog(productId?: number): void {
    const data: DialogData = { categories: this.dataStorageService.categories }
    if (this.dataStorageService.isEditMode) {
      data['editProductId'] = productId;
    }

    const dialogRef = this.dialog.open(DialogProductComponent, {
      width: '500px',
      maxHeight: '80vh',
      data,
    });
    //
    // dialogRef.afterClosed()
    //          .subscribe((product: (ProductWithCategory)) => {
    //            // this.dataStorageService.refreshTable();
    //            console.log(productId)
    //            if (product) {
    //              if (this.dataStorageService.isEditMode && productId !== undefined) {
    //                // this.updateProductInStore(productId, product);
    //                this.dataStorageService.resetEditMode();
    //              }
    //            }
    //          });
  }

  public onEditProduct(id: number): void {
    this.dataStorageService.isEditMode = true;
    this.openDialog(id);
  }

  // private updateProductInStore(id: number, newProductData: ProductWithCategory): void {
  //   let idx = this.dataStorageService.products.findIndex((product) => product.id === id);
  //   this.dataStorageService.products[idx] = newProductData;
  // }

  public onDeleteProduct(id: number): void {
    if (!environment.isDevMode){
      this.deleteProductById(id);
    } else {
      this.fakeDeleteProductById(id);
    }
  }

  private deleteProductById(id: number){
    this.dataStorageService.deleteProductById(id).subscribe({
      next: () => {
        this.deleteProductFromStore(id);
        this.dataStorageService.refreshTable();
      },
      error: (error) => {
        console.log('Deleting error!', error)
      }
    })
  }

  private fakeDeleteProductById(id: number): void {
    this.deleteProductFromStore(id);
    this.dataStorageService.refreshTable();
  }

  private deleteProductFromStore(id: number): void {
    this.dataStorageService.products = this.dataStorageService.products.filter(product => product.id !== id);
  }
}
