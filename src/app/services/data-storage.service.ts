import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { mergeMap, Observable, of } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import { environment } from "../../environment/environment";
import { MockupService } from "./mockup.service";

export interface ProductResponse {
  count: number,
  next: string | null,
  previous: string | null,
  results: ProductWithCategory[]
}

export interface Product {
  comment?: string | null,
  created_at?: string,
  expiration_date?: string | null,
  expiration_type: 'non_expirable' | 'expirable',
  fields: Fields[],
  manufacture_date: string,
  name: string,
  updated_at?: string,
}

export interface ProductWithCategory extends Product {
  id: number,
  category: Category,
}

export interface ProductDataForCreation extends Product {
  category_id: number,
}

export interface Category {
  id: number;
  name: string;
}

export interface Fields{
  name: string,
  value: string,
  is_date: boolean
}

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  public products: ProductWithCategory[] = [];
  public categories: Category[] = [];
  isEditMode: boolean = false;

  dataSource = new MatTableDataSource<ProductWithCategory>([]);


  constructor(
    private http: HttpClient,
    public mockupService: MockupService
  ) {}


  public fetchProducts(): Observable<ProductWithCategory[]> {
    if (environment.isDevMode){
      return of(this.mockupService.products as any);
    }
    let params = new HttpParams();
    // params = params.append('limit', '5');
    // params = params.append('offset', '0');

    return this.http.get<ProductWithCategory[] | ProductResponse>(environment.productsUrl, {params})
     .pipe(
       mergeMap((response) => {
         return Array.isArray(response)
           ? of(response)
           : of(response.results);
       })
     );
  }

  public fetchCategories(): Observable<Category[]> {
    if (environment.isDevMode) {
      return of(this.mockupService.categories as any);
    }
    return this.http.get<Category[]>(environment.categoryUrl)
  }

  public addProduct(product: ProductDataForCreation): Observable<ProductWithCategory> {
    return this.http.post<ProductWithCategory>(environment.productsUrl, product)
  }

  public updateProduct(id: number, product: ProductDataForCreation): Observable<ProductWithCategory> {
    // TODO: add loader
    return this.http.put<ProductWithCategory>(environment.productsUrl + id, product);
  }

  public deleteProductById(id: number): Observable<void> {
    return this.http.delete<void>(environment.productsUrl + id)
  }

  public refreshTable(): void {
    this.dataSource.data = this.products;
  }

  public resetEditMode() {
    this.isEditMode = false;
  }

}
