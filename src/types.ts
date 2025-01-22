export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  size: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  category: string;
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