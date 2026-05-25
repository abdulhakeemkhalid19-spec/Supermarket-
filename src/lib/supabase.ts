import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Category = {
  id: string
  name: string
  slug: string
  image_url: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  compare_price: number
  image_url: string
  category_id: string
  stock_quantity: number
  unit: string
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export type Order = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  status: string
  total_amount: number
  notes: string
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}
