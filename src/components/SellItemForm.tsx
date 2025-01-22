import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SellItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SellItemForm({ onClose, onSuccess }: SellItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  // Para almacenar los archivos seleccionados
  const [files, setFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Verificar usuario logueado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión para vender artículos');

      // 2. Subir las imágenes (si el usuario seleccionó archivos)
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          // Generamos un nombre único en base al user.id y timestamp
          const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`;
          // Subimos al bucket "images_clothes"
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images_clothes')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error al subir la imagen:', uploadError);
            throw new Error('No se pudo subir la imagen');
          }

          // 3. Obtener URL pública
          //   - Si tu bucket es público, con .getPublicUrl podemos construir la URL
          //   - Si es privado, necesitarás firmar la URL.
          const { data: publicData } = supabase.storage
            .from('images_clothes')
            .getPublicUrl(uploadData.path);

          // Asegúrate de que tu bucket "images_clothes" tenga "Public access" activado
          // o tengas una política RLS que permita su lectura.
          imageUrls.push(publicData?.publicUrl || '');
        }
      }

      // 4. Guardar en la tabla "items"
      const { error: insertError } = await supabase.from('items').insert([
        {
          title,
          description,
          price: parseFloat(price),
          size,
          condition,
          category,
          seller_id: user.id,
          is_published: false,
          images: imageUrls, // <-- Guardamos el array de URLs en la columna "images"
        },
      ]);

      if (insertError) throw insertError;

      // 5. Éxito
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Vender un Artículo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Talla */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Talla</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Condición */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Condición</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Seleccionar condición</option>
              <option value="New">Nuevo</option>
              <option value="Like New">Como Nuevo</option>
              <option value="Good">Bueno</option>
              <option value="Fair">Regular</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="tops">Superiores</option>
              <option value="bottoms">Inferiores</option>
              <option value="dresses">Vestidos</option>
              <option value="outerwear">Prendas de Abrigo</option>
              <option value="accessories">Accesorios</option>
              <option value="shoes">Zapatos</option>
            </select>
          </div>

          {/* Input para subir imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Imágenes</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="mt-1 block w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes seleccionar varias imágenes.
            </p>
          </div>

          {/* Error */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* Botón de publicación */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Publicar Artículo'}
          </button>
        </form>
      </div>
    </div>
  );
}