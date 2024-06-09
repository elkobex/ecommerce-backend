export interface IColor {
  id: string;
  title: string;
  imagen: string;
  selected: boolean;
}

export interface IProduct {
  id: number;
  identifier: string;
  name: string;
  color: string;
  referenceId: string;
  imageUrl: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  productUrl: string;
  size: string;
  sizes: string[];
  colors: IColor[];
  images: string[];
  loading: boolean;
}

export interface ProductPagination {
  isOk: boolean;
  products: IProduct[];
  totalPages: number;
  totalProducts: number;
  pageNumber: number;
  pageSize: number;
  filterMessage: string;
}