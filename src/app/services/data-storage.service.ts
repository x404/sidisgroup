import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, mergeMap, Observable, of, switchMap, tap, throwError } from "rxjs";
import { environment } from "../../environment/environment";

export interface ProductResponse {
  count: number,
  next: string | null,
  previous: string | null,
  results: ProductForRetrieval[]
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

export interface ProductForRetrieval extends Product {
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

interface Fields{
  name: string,
  value: string,
  is_date: boolean
}

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(
    private http: HttpClient
  ) { }


  public fetchProducts(): Observable<ProductForRetrieval[]> {
    let params = new HttpParams();
    // params = params.append('limit', '5');
    // params = params.append('offset', '0');

    return this.http.get<ProductForRetrieval[] | ProductResponse>(environment.productsUrl, {params})
     .pipe(
       mergeMap((response) => {
         return Array.isArray(response)
           ? of(response)
           : of(response.results);
       })
     );
  }

  public fetchCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(environment.categoryUrl)
  }

  public addProduct(product: ProductDataForCreation): Observable<ProductDataForCreation[]> {
    console.log(product);
    return this.http.post<ProductDataForCreation[]>(environment.productsUrl, product)
  }
}
