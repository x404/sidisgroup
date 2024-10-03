import { Component, inject, OnInit, signal } from '@angular/core';
import {
  DataStorageService,
} from "@services/data-storage.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogData, DialogProductComponent } from "./dialog-product/dialog-product.component";
import { environment } from "@environment/environment";
import { type Category, type ProductWithCategory } from "@interfaces/interfaces";
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton, MatButton } from '@angular/material/button';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatButton,
    DatePipe,
  ],
})
export class AppComponent implements OnInit {
  title = 'Products';

  productError = signal<string>('');
  categoryError = signal<string>('');

  productsLoading = signal<boolean>(true);
  categoriesLoading = signal<boolean>(true);

  displayedColumns: string[] = ['position', 'name', 'category', 'comment', 'expiration_date', 'manufacture_date', 'created_at', 'updated_at', 'fields', 'edit'];

  dataStorageService = inject(DataStorageService);

  constructor(
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
  }

  private fetchProducts(): void {
    this.productsLoading.set(true);

    this.dataStorageService.fetchProducts()
        .subscribe({
            next: (response: ProductWithCategory[]) => {
              // console.log(response);
              this.dataStorageService.products = response;
              this.dataStorageService.refreshTable();
              this.productsLoading.set(false);
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
              this.categoriesLoading.set(false);
            },
            error: (error) => {
              console.error('Request categories error ', error);
              const errorMessage = error.status === 404 ? `Error: ${error.status}. The requested resource was not found on this server.` : error.message;
              this.categoryError.set(errorMessage);
            }
          }
        )
  }

  onAddProduct() {
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
    if (!environment.isDevMode) {
      this.deleteProductById(id);
    } else {
      this.fakeDeleteProductById(id);
    }
  }

  private deleteProductById(id: number) {
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
