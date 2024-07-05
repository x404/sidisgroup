import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProductDataForCreation, DataStorageService } from "../services/data-storage.service";
import { DatePipe } from "@angular/common";

export interface DialogData {
  animal: string;
  name: string;
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
    // created_at: new FormControl(''),
    // updated_at: new FormControl(''),
    expiration_date: new FormControl(new Date()),
    manufacture_date: new FormControl(new Date(), Validators.required),
  })

  //   ['position', 'name', 'category', 'comment', 'created_at', 'updated_at','expiration_date', 'manufacture_date', 'edit'];

  error: string = '';

  constructor(
    public dialogRef: MatDialogRef<DialogProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,

    private formBuilder: FormBuilder,
    public dataStorageService: DataStorageService,
    private datePipe: DatePipe
  ) {}


  ngOnInit(): void {
    // console.log( this.data)
    // this.productForm = this.formBuilder.group({
    //   name: ['', Validators.required],
    // })

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
