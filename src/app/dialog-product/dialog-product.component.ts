import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ProductDataForCreation, DataStorageService, Category, Product } from "../services/data-storage.service";
import { DatePipe } from "@angular/common";

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export interface DialogData {
  categories: Category[];
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


export class DialogProductComponent implements OnInit{
  productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    category_id: new FormControl('', Validators.required),
    comment: new FormControl('Hello guys'),
    expiration_type: new FormControl(false),
    expiration_date: new FormControl(new Date(), Validators.required),
    manufacture_date: new FormControl(new Date(), Validators.required),
  })

  error: string = '';
  categories: Category[] = [];
  isExpirable = false;

  constructor(
    public dialogRef: MatDialogRef<DialogProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,

    public dataStorageService: DataStorageService,
    private datePipe: DatePipe
  ) {}


  ngOnInit(): void {
    this.categories = this.data?.categories;
    console.log(this.data.categories);
  }

  onSave() {
    console.log('onSave');
  }

  onCancel() {
    console.log('onCancel')
  }

  onSubmit() {
    const {
      category_id: categoryId,
      name,
      comment ,
      expiration_date,
      manufacture_date,
    } = this.productForm.value;

    const expirationDate: string | null = this.isExpirable ? String(this.datePipe.transform(expiration_date, 'yyyy-MM-dd')): null;
    const manufactureDate = String(this.datePipe.transform(this.productForm.get('manufacture_date')?.value, 'yyyy-MM-dd'));

    console.log('expirationDate=', expirationDate)
    if (!categoryId || !name || !comment) {
      return;
    }

    const product: ProductDataForCreation = {
      ...this.productForm.value,
      category_id: +categoryId, // Get value from form control
      name,
      comment,
      expiration_type: this.isExpirable ? expirationType.expirable : expirationType.non_expirable,
      expiration_date: expirationDate,
      manufacture_date: manufactureDate,
      fields: [
        {
          name: "string",
          value: "hello",
          is_date: false
        }
      ]
    };

    console.log('product=', product)
    this.dataStorageService.addProduct(product)
      .subscribe({
        next: (( product: ProductDataForCreation[]) => {
          // expiration_date must be more than manufacture_date
          //TODO: update PRODUCTS array

          // this.dialogRef.close();
        }),
        error: (error) => {
          this.error = error.error.errors[0].detail;
          console.log(error);
        }
      })
  }

  onToggleExpirationType() {
    this.isExpirable = !!this.productForm.get('expiration_type')?.value;
  }
}
