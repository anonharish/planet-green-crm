export interface Customer {
  uuid: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string;
  email_address: string | null;
  occupation: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  country: string | null;
  zip: string | null;
  customer_status_id: number;
  is_active: number;
  created_by: number;
  created_on: string;
  updated_by: number | null;
  updated_on: string | null;
}

export interface GetCustomersRequest {
  offset: number;
}

export interface GetCustomersResponse extends Array<Customer> {}
