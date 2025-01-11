import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Upload, X } from 'lucide-react';

interface SellItemFormData {
  title: string;
  description: string;
  price: number;
  size: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  category: string;
}

interface SellItemFormProps {
  onSuccess: () => void;
}

const CATEGORIES = [
  'Dresses',
  'Tops',
  'Bottoms',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Other'
];

export function SellItemForm({ onSuccess }: SellItemFormProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<SellItemFormData>();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      setUploadError(null);

      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setUploadError('Please upload only image files');
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('images_clothes')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('images_clothes')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SellItemFormData) => {
    try {
      if (images.length === 0) {
        setUploadError('Please upload at least one image');
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Please sign in to list an item');
      }

      const { error: insertError } = await supabase
        .from('items')
        .insert([
          {
            title: data.title,
            description: data.description,
            price: data.price,
            size: data.size,
            condition: data.condition,
            category: data.category,
            seller_id: user.id,
            images: images,
            is_published: false // Items start as unpublished
          }
        ]);

      if (insertError) throw insertError;

      reset();
      setImages([]);
      alert('Item submitted for review!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error instanceof Error ? error.message : 'Failed to list item. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <div className="mt-1 flex items-center space-x-4">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Upload className="h-5 w-5 mr-2" />
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        {uploadError && (
          <p className="mt-1 text-sm text-red-600">{uploadError}</p>
        )}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {images.map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <input
            type="text"
            {...register('size', { required: 'Size is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.size && (
            <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select
            {...register('condition', { required: 'Condition is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
          {errors.condition && (
            <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'List Item'}
        </button>
      </div>
    </form>
  );
}