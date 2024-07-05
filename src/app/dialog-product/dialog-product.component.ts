import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProductDataForCreation, DataStorageService, Category } from "../services/data-storage.service";
import { DatePipe } from "@angular/common";

export interface DialogData {
  categories: Category[];
}


@Component({
  selector: 'app-dialog-product',
  templateUrl: './dialog-product.component.html',
  styleUrls: ['./dialog-product.component.scss']
})
export class DialogProductComponent implements OnInit{
  productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    category_id: new FormControl('', Validators.required),
    comment: new FormControl('Hello guys'),
    expiration_date: new FormControl(new Date()),
    manufacture_date: new FormControl(new Date(), Validators.required),
  })

  error: string = '';
  categories: Category[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,

    private formBuilder: FormBuilder,
    public dataStorageService: DataStorageService,
    private datePipe: DatePipe
  ) {}


  ngOnInit(): void {
    this.categories = this.data?.categories;
    console.log(this.data.categories);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    console.log('onSave');
  }

  onCancel() {
    console.log('onCancel')
  }

  onSubmit() {
    console.log('onSubmit', this.productForm.value);
    console.log(this.productForm.get('name')?.value);

    const product: any = this.productForm.value;

    product['expiration_date'] = this.datePipe.transform(this.productForm.get('expiration_date')?.value, 'yyyy-MM-dd');
    product['manufacture_date'] = this.datePipe.transform(this.productForm.get('manufacture_date')?.value, 'yyyy-MM-dd');


    product['expiration_type'] = 'non_expirable';
    product['fields'] = [
      {
        "name": "string",
        "value": "hello",
        "is_date": false
      }
    ];
    // console.log('product', product);
    this.dataStorageService.addProduct(product)
        .subscribe({
          next: (( product: ProductDataForCreation[]) => {
            // expiration_date must be more than manufacture_date
            //TODO: update PRODUCTS array
          }),
          error: (error) => {
            this.error = error.error.errors[0].detail;
            console.log(error);
          }
        })

  }
}
