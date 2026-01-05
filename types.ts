
export interface Building {
  id: string;
  name: string;
  address: string;
  type: string;
  lat: number;
  lng: number;
  image: string;
}

export interface Store {
  id: string;
  buildingId: string;
  name: string;
  category: string;
  floor: number;
  description: string;
  rating: number;
  image: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
}

export interface LocationState {
  lat: number;
  lng: number;
  address: string;
}
