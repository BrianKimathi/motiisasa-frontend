// src/types/types.ts (cleaned and updated)
export interface ShowroomCorporate {
  id: number;
  name: string | null;
  logo_url: string | null;
  registration_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
}

export interface ShowroomCorporateData {
  id?: number;
  name: string; // Strict: no null
  registration_number?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  logo?: File; // For form submissions
}

export interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  profile_photo: string | null;
  seller_type: "individual" | "showroom" | "corporate" | null;
  showroom_corporate: ShowroomCorporate | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  id_number: string | null;
  is_verified: boolean;
  role: "user" | "admin" | null;
  id_front_image: string | null;
  id_back_image: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Car {
  id: number;
  brand: string | null;
  model: string | null;
  registration_number: string | null;
  colour: string | null;
  year_of_manufacture: number | null;
  mileage: number | null;
  mileage_unit: string | null;
  has_accident_history: boolean;
  asking_price: string | null;
  location: string | null;
  status: "Available" | "Sold" | "Pending" | null;
  is_sold: boolean;
  transmission_type: string | null;
  propulsion: string | null;
  fuel_type: string | null;
  condition: string | null;
  acceleration: string | null;
  consumption_rate: string | null;
  features: string[] | null;
  import_status: string | null;
  price_tax: string | null;
  currency: string | null;
  car_type: string | null;
  vehicle_category: string;
  listing_type: "sale" | "auction" | "hire";
  auction_end_time: string | null;
  is_verified: boolean;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  highest_bid: string | null;
  images: string[] | null;
  user: User | null;
}

export interface Bid {
  id: number;
  car_id: number;
  user_id: number;
  bid_amount: string;
  created_at: string | null;
  car: {
    id: number;
    brand: string | null;
    model: string | null;
    registration_number: string | null;
    asking_price: string | null;
    currency: string | null;
    auction_end_time: string | null;
  };
  bidder: User;
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface Brand {
  id: number;
  name: string;
}

export interface CarModel {
  id: number;
  name: string;
  brand_id: number;
}

export interface BrandResponse {
  status: "success" | "error";
  message?: string;
  data: Brand[] | null;
}

export interface CarModelResponse {
  status: "success" | "error";
  message?: string;
  data: CarModel[] | null;
}

export interface CarResponse {
  status: "success" | "error";
  message?: string;
  data: {
    car?: Car;
    cars?: Car[];
    bid?: {
      bid_id: number;
      car_id: number;
      user_id?: number;
      bid_amount: string;
      created_at: string;
    };
    bids?: Bid[];
    images?: string[];
    pagination?: Pagination;
  } | null;
}

export interface SearchSuggestionsResponse {
  status: "success" | "error";
  message?: string;
  data: string[] | null;
}

export interface CarFilters {
  query?: string;
  search_by?: "name" | "model" | "year" | "registration";
  listing_type?: "sale" | "hire" | "auction";
  is_verified?: "true" | "false";
  is_published?: "true" | "false";
  budget?: string;
  location?: string;
  min_yom?: number;
  max_yom?: number;
  min_price?: number;
  max_price?: number;
  currency?: "KES" | "USD";
  brand_id?: number;
  model_id?: number;
  transmission_type?: "Automatic" | "Manual";
  propulsion?: "Gas" | "Electric" | "Hybrid";
  fuel_type?: "Petrol" | "Diesel";
  condition?: "Brand New" | "Foreign Used" | "Locally Used";
  car_type?:
    | "Sedan"
    | "SUV"
    | "Truck"
    | "Coupe"
    | "Convertible"
    | "Van"
    | "Hatchback";
  user_id?: number;
}
