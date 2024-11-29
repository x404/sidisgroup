import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { from, mergeMap, Observable } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import { environment } from "@environment/environment";
import { Category, ProductDataForCreation, ProductResponse, ProductWithCategory } from "../types/interfaces";



@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  public products: ProductWithCategory[] = [];
  public categories: Category[] = [];
  isEditMode = signal<boolean>(false);

  dataSource = new MatTableDataSource<ProductWithCategory>([]);


  constructor(
    private http: HttpClient
  ) {}


  public fetchProducts(): Observable<ProductWithCategory[]> {
    if (environment.isDevMode){
      return this.http.get<ProductWithCategory[]>(environment.localProductsUrl)
    }

    let params = new HttpParams();
    // params = params.append('limit', '5');
    // params = params.append('offset', '0');

    return this.http.get<ProductWithCategory[] | ProductResponse>(environment.productsUrl, {params})
     .pipe(
       mergeMap((response) => {
         return Array.isArray(response)
           ? from([response])
           : from([response.results]);
       })
     );
  }

  public fetchCategories(): Observable<Category[]> {
    const url = environment.isDevMode ? environment.localCategoryUrl : environment.categoryUrl;
    return this.http.get<Category[]>(url)
  }

  public addProduct(product: ProductDataForCreation): Observable<ProductWithCategory> {
    return this.http.post<ProductWithCategory>(environment.productsUrl, product)
  }

  public updateProduct(id: number, product: ProductDataForCreation): Observable<ProductWithCategory> {
    return this.http.put<ProductWithCategory>(environment.productsUrl + id, product);
  }

  public deleteProductById(id: number): Observable<void> {
    return this.http.delete<void>(environment.productsUrl + id)
  }

  public refreshTable(): void {
    this.dataSource.data = this.products;
  }

  public resetEditMode() {
    this.isEditMode.set(false);
  }


  public getCategoryById(id: number): Category {
    const category =  this.categories?.find(category => category.id === id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  public findMaxProductId(){
    return Math.max(...this.products.map(p => p.id))
  }

}
