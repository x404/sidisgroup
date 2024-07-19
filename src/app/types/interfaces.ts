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
