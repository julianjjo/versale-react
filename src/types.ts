export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  category: string;
  images: string[];
  sellerId: string;
  createdAt: Date;
  isPublished: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  role?: 'admin' | 'user';
}