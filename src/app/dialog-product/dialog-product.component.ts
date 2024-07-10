import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  Category,
  DataStorageService,
  Fields,
  ProductDataForCreation,
  ProductWithCategory
} from "../services/data-storage.service";
import { DatePipe } from "@angular/common";

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { environment } from "../../environment/environment";

export interface DialogData {
  categories: Category[],
  editProductId?: number,
}

export enum expirationType {
  expirable = 'expirable',
  non_expirable = 'non_expirable',
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY'
  }
};


@Component({
  selector: 'app-dialog-product',
  templateUrl: './dialog-product.component.html',
  styleUrls: ['./dialog-product.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})


export class DialogProductComponent implements OnInit {
  productForm: FormGroup;
  error: string = '';
  categories: Category[] = [];
  isExpirable: boolean = false;
  isSaving: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogProductComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogData,
    public dataStorageService: DataStorageService,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: [''],
      category_id: ['', Validators.required],
      comment: ['Hello guys'],
      expiration_type: [false],
      expiration_date: [new Date(), Validators.required],
      manufacture_date: [new Date(), Validators.required],
      fields: this.fb.array([]),
    })
  }

  ngOnInit(): void {
    this.categories = this.data?.categories;

    if (this.dataStorageService.isEditMode) {
      this.presetFormControls();
    }
  }

  private presetFormControls(): void {
    const product: ProductWithCategory | undefined = this.dataStorageService.products.find(product => product.id === this.data.editProductId)
    if (product !== undefined) {
      const {
        id,
        expiration_type,
        fields,
        category
      } = product;

      this.isExpirable = expiration_type === expirationType.expirable;

      for (let field of fields) {
        this.addExtraFields(field);
      }

      this.productForm.patchValue({
        ...product,
        expiration_type: this.isExpirable,
        category_id: category.id,
      })
    }
  }

  public addExtraFields(data?: Fields): void {
    const field = this.fb.group({
      name: [data?.name || '', Validators.required],
      value: [data?.value || '', Validators.required],
      is_date: [data?.is_date || false],
    });
    this.fields.push(field);
  }

  get fields(): FormArray {
    return this.productForm.get('fields') as FormArray;
  }

  public onSubmit(): void {
    const {
      category_id: categoryId,
      name,
      comment,
      expiration_date,
      manufacture_date,
    } = this.productForm.value;

    const expirationDate: string | null = this.isExpirable ? String(this.datePipe.transform(expiration_date, 'yyyy-MM-dd')) : null;
    const manufactureDate = String(this.datePipe.transform(manufacture_date, 'yyyy-MM-dd'));

    if (!categoryId || !name || !comment || !this.validateFields(this.fields.value)) {
      return;
    }

    console.log('onSubmit', this.productForm.value);
    this.isSaving = true;

    const fields = this.fields.value.map((field: Fields) => ({
      ...field,
      value: field.is_date ? this.datePipe.transform(field.value, 'yyyy-MM-dd') : field.value
    }));


    const product: ProductDataForCreation = {
      ...this.productForm.value,
      category_id: +categoryId, // Get value from form control
      name,
      comment,
      expiration_type: this.isExpirable ? expirationType.expirable : expirationType.non_expirable,
      expiration_date: expirationDate,
      manufacture_date: manufactureDate,
      fields
    };

    if (this.dataStorageService.isEditMode && this.data.editProductId !== undefined) {
      this.dataStorageService.resetEditMode();
      if (!environment.isDevMode) {
        this.updateProduct(this.data.editProductId, product);
      } else {
        this.fakeUpdateProduct(this.data.editProductId, product);
      }
    } else {
      if (!environment.isDevMode) {
        this.addProduct(product);
      } else {
        this.fakeAddProduct(product);
      }
    }

    this.dataStorageService.refreshTable();
  }

  private validateFields(fields: Fields[]): boolean {
    return fields.every(field => {
      return field.name && field.value;
    });
  }


  private updateProduct(id: number, product: ProductDataForCreation): void {
    this.dataStorageService.updateProduct(id, product)
        .subscribe({
          next: ((response: ProductWithCategory) => {
            this.updateProductInStore(id, response);
            this.isSaving = false;
            this.dialogRef.close(response);
          }),
          error: (error) => {
            this.error = error.error.errors[0].detail;
            console.log(error);
          }
        })
  }

  private fakeUpdateProduct(id: number, product: ProductDataForCreation): void {
    console.log(product);
    const productWithCategory: ProductWithCategory | undefined = this.productAdapterForEditMode(product);

    if (!productWithCategory) {
      return;
    }

    this.updateProductInStore(id, productWithCategory);
    this.isSaving = false;
    this.dialogRef.close(productWithCategory);
  }

  private updateProductInStore(id: number, newProductData: ProductWithCategory): void {
    let idx = this.dataStorageService.products.findIndex((product) => product.id === id);
    this.dataStorageService.products[idx] = newProductData;
  }


  private addProduct(product: ProductDataForCreation): void {
    this.dataStorageService.addProduct(product)
        .subscribe(
          {
            next: ((resp: ProductWithCategory) => {
              this.isSaving = false;
              console.log('submit', resp);
              this.addProductInStore(resp);

              this.dialogRef.close(resp);
            }),
            error: (error) => {
              this.error = error.error.errors[0].detail;
              console.log(error);
            }
          }
        )
  }

  private fakeAddProduct(product: ProductDataForCreation): void {
    const productWithCategory: ProductWithCategory = this.productAdapter(product);
    this.addProductInStore(productWithCategory);
    this.isSaving = false;
    this.dialogRef.close(productWithCategory);
  }

  private addProductInStore(product: ProductWithCategory): void {
    this.dataStorageService.products.unshift(product);
  }


  private productAdapter( product: ProductDataForCreation): ProductWithCategory {
    const { category_id, ...rest } = product;
    const category: Category = this.dataStorageService.getCategoryById(category_id);
    const date = new Date().toISOString();
    const maxProductId = this.dataStorageService.findMaxProductId();

    return {
      ...rest,
      id: maxProductId + 1,
      created_at: date,
      updated_at: date,
      category,
    };
  }

  private productAdapterForEditMode(product: ProductDataForCreation): ProductWithCategory | undefined {
    const productInStore = this.dataStorageService.products.find((product) => product.id === this.data.editProductId);

    if (!productInStore) {
      console.error(`Product with ID ${this.data.editProductId} not found for update`);
      return;
    }

    console.log(productInStore)

    const { category_id, ...rest } = product;
    const category: Category = this.dataStorageService.getCategoryById(category_id);
    const date = new Date().toISOString();

    return {
      ...rest,
      id: productInStore.id,
      created_at: productInStore.created_at,
      updated_at: date,
      category,
    };
  }

  public onToggleExpirationType(): void {
    this.isExpirable = !!this.productForm.get('expiration_type')?.value;
  }

  public removeExtraField(index: number): void {
    this.fields.removeAt(index);
  }

  onCancel() {
    // this.dataStorageService.resetEditMode();
  }
}
