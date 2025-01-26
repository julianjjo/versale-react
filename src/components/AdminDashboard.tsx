import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Users, ShoppingBag, Edit2, Tags } from 'lucide-react';
import type { ClothingItem, User, Category } from '../types';
import { EditItemForm } from './EditItemForm';
import { CategoriesManager } from './CategoriesManager';

export function AdminDashboard() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'users' | 'categories'>('items');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'items') {
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;
        setItems(itemsData.map(item => ({
          ...item,
          categoryId: item.category,
          category: item.categories?.name || 'Sin categoría'
        })) as ClothingItem[]);
      } else {
        // Usar la función segura para obtener información de usuarios
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_user_info');

        if (usersError) throw usersError;

        const formattedUsers = (usersData || []).map((userData: any) => ({
          id: userData.user_id,
          email: userData.email,
          name: userData.email?.split('@')[0] || 'Desconocido',
          role: userData.role || 'usuario',
          rating: 0
        }));

        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error('Error al obtener los datos:', err);
      setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ is_published: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error al actualizar el artículo:', err);
      alert('Error al actualizar el estado del artículo. Por favor, inténtalo de nuevo.');
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'usuario' : 'admin';
      
      // Verificar si el rol del usuario existe
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select()
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Actualizar el rol existente
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insertar un nuevo rol
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: newRole }]);
        if (error) throw error;
      }

      await fetchData();
    } catch (err) {
      console.error('Error al actualizar el rol del usuario:', err);
      alert('Error al actualizar el rol del usuario. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('items')}
              className={`${
                activeTab === 'items'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center w-1/3 py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Artículos
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center w-1/3 py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Users className="h-5 w-5 mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`${
                activeTab === 'categories'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center w-1/3 py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Tags className="h-5 w-5 mr-2" />
              Categorías
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : activeTab === 'categories' ? (
          <CategoriesManager />
        ) : activeTab === 'items' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={item.images[0]}
                            alt={item.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {typeof item.category === 'object' ? item.category.name : item.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.stock || 0}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="ml-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Actualizar
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.is_published ? 'Publicado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => togglePublished(item.id, item.is_published)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            item.is_published
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {item.is_published ? (
                            <XCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          {item.is_published ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => toggleUserRole(user.id, user.role || 'usuario')}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      >
                        Cambiar Rol
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editingItem && (
        <EditItemForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}