export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  size: string;
  condition: 'Nuevo' | 'Como Nuevo' | 'Bueno' | 'Regular';
  categoryId: string;
  category?: Category;
  images: string[];
  sellerId: string;
  createdAt: Date;
  is_published: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  role?: 'admin' | 'user';
}

export interface CartProps {
  items: ClothingItem[];
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  description: string;
}