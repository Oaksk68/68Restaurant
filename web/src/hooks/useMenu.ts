import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export interface MenuItem {
  id: number
  category_id: number
  name_en: string
  name_my: string
  description_en: string | null
  description_my: string | null
  price: number
  image_path: string | null
  is_available: boolean
  category?: Category
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  name_en: string
  name_my: string
  sort_order: number
  menu_items?: MenuItem[]
  created_at?: string
  updated_at?: string
}

// Fetch public menu (categories with available items)
export function useMenuQuery() {
  return useQuery<Category[]>({
    queryKey: ['menu', 'public'],
    queryFn: async () => {
      const res = await api.get('/menu')
      return res.data.data
    },
  })
}

// Fetch all menu items for owner management
export function useMenuItemsQuery() {
  return useQuery<MenuItem[]>({
    queryKey: ['menu-items', 'all'],
    queryFn: async () => {
      const res = await api.get('/menu/items')
      return res.data.data
    },
  })
}

// Create menu item (requires multipart/form-data for image upload)
export function useCreateMenuItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/menu/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] })
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

// Update menu item
export function useUpdateMenuItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      // Laravel PATCH doesn't support multipart/form-data natively.
      // So we append _method = PATCH and send as a POST request.
      formData.append('_method', 'PATCH')
      const res = await api.post(`/menu/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] })
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

// Delete menu item
export function useDeleteMenuItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/menu/items/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] })
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

// Fetch categories
export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data.data
    },
  })
}

// Create Category
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Category, 'id' | 'menu_items'>) => {
      const res = await api.post('/categories', data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['menu'] })
    },
  })
}

// Update Category
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Category> }) => {
      const res = await api.patch(`/categories/${id}`, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['menu'] })
    },
  })
}

// Delete Category
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['menu'] })
    },
  })
}
