# Generic CRUD Hooks Pattern Examples
*How to use the generic entity CRUD hooks for any entity in your application*

## 📖 Table of Contents
1. [Overview](#overview)
2. [Basic Setup](#basic-setup)
3. [Products Example](#products-example)
4. [Orders Example](#orders-example)
5. [Categories Example](#categories-example)
6. [Advanced Patterns](#advanced-patterns)
7. [Migration Guide](#migration-guide)

---

## 🎯 Overview

The generic CRUD hooks pattern allows you to create consistent, reusable React Query hooks for any entity in your application. Instead of writing separate hooks for each entity, you define the entity structure and API service, then generate all CRUD hooks automatically.

### Benefits
- ✅ **Consistency**: Same patterns across all entities
- ✅ **Less Code**: Generate hooks instead of writing them manually
- ✅ **Type Safety**: Full TypeScript support with proper generics
- ✅ **Maintainability**: Update patterns in one place
- ✅ **Testing**: Standardized testing patterns

---

## 🔧 Basic Setup

### 1. Define Your Entity Types
```typescript
// src/models/Product.ts
export interface Product extends BaseEntity {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  inStock?: boolean;
  images?: string[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}
```

### 2. Create API Service
```typescript
// src/services/api/productApi.ts
import { ApiClient } from './client';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../../models/Product';
import type { PaginatedResponse, QueryParams } from '../../utils/types/api';

export class ProductApiService {
  constructor(private client: ApiClient) {}

  async getProducts(filters?: ProductFilters & QueryParams): Promise<PaginatedResponse<Product>> {
    return this.client.get('/products/', filters);
  }

  async getProductById(id: string): Promise<Product> {
    return this.client.get(`/products/${id}/`);
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.client.post('/products/', data);
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    return this.client.put(`/products/${id}/`, data);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.client.delete(`/products/${id}/`);
  }

  // Optional: Additional product-specific methods
  async toggleProductStatus(id: string): Promise<Product> {
    return this.client.post(`/products/${id}/toggle-status/`);
  }

  async duplicateProduct(id: string): Promise<Product> {
    return this.client.post(`/products/${id}/duplicate/`);
  }
}

export const productApiService = new ProductApiService(apiClient);
```

### 3. Generate Hooks
```typescript
// src/viewmodels/hooks/useProducts.ts
'use client';

import { createEntityCrudHooks } from './useEntityCrud';
import { productApiService } from '../../services/api/productApi';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../../models/Product';
import type { EntityApiService } from './useEntityCrud';

// Adapt API service to generic interface
const productEntityService: EntityApiService<Product, CreateProductRequest, UpdateProductRequest, ProductFilters> = {
  getAll: productApiService.getProducts.bind(productApiService),
  getById: productApiService.getProductById.bind(productApiService),
  create: productApiService.createProduct.bind(productApiService),
  update: productApiService.updateProduct.bind(productApiService),
  delete: productApiService.deleteProduct.bind(productApiService),
};

// Generate hooks
const productCrudHooks = createEntityCrudHooks('products', productEntityService);

// Export with descriptive names
export const productQueryKeys = productCrudHooks.queryKeys;
export const useProducts = productCrudHooks.useEntityList;
export const useProduct = productCrudHooks.useEntity;
export const useCreateProduct = productCrudHooks.useCreateEntity;
export const useUpdateProduct = productCrudHooks.useUpdateEntity;
export const useDeleteProduct = productCrudHooks.useDeleteEntity;
export const useBulkProductOperations = productCrudHooks.useBulkEntityOperations;

// Custom hooks for product-specific operations
export function useDuplicateProduct() {
  const { invalidateQuery } = useInvalidateQuery();
  
  return useApiMutation<Product, string>(
    (id) => productApiService.duplicateProduct(id),
    {
      onSuccess: () => {
        invalidateQuery(productQueryKeys.lists());
      },
    }
  );
}

export function useToggleProductStatus() {
  const { invalidateQuery } = useInvalidateQuery();
  
  return useApiMutation<Product, string>(
    (id) => productApiService.toggleProductStatus(id),
    {
      onSuccess: (updatedProduct) => {
        invalidateQuery(productQueryKeys.detail(updatedProduct.id));
        invalidateQuery(productQueryKeys.lists());
      },
    }
  );
}
```

---

## 🛒 Products Example

### Component Usage
```typescript
// src/views/components/examples/ProductManagement.tsx
'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Select, MenuItem } from '@mui/material';
import { 
  useProducts, 
  useProduct, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  useDuplicateProduct,
  useToggleProductStatus 
} from '../../../viewmodels/hooks/useProducts';
import type { ProductFilters, CreateProductRequest } from '../../../models/Product';

export function ProductManagement() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Queries
  const { data: products, isLoading, error } = useProducts(filters);
  const { data: selectedProduct } = useProduct(selectedProductId, { 
    enabled: !!selectedProductId 
  });

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();
  const toggleStatus = useToggleProductStatus();

  const handleCreateProduct = (productData: CreateProductRequest) => {
    createProduct.mutate(productData, {
      onSuccess: () => {
        toast.success('Product created successfully!');
      },
    });
  };

  const handleUpdateProduct = (id: string, data: UpdateProductRequest) => {
    updateProduct.mutate({ id, data }, {
      onSuccess: () => {
        toast.success('Product updated successfully!');
      },
    });
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success('Product deleted successfully!');
      },
    });
  };

  const handleDuplicateProduct = (id: string) => {
    duplicateProduct.mutate(id, {
      onSuccess: () => {
        toast.success('Product duplicated successfully!');
      },
    });
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus.mutate(id);
  };

  if (isLoading) return <Loader />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Container maxWidth="lg">
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search"
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          displayEmpty
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="electronics">Electronics</MenuItem>
          <MenuItem value="furniture">Furniture</MenuItem>
        </Select>
      </Box>

      {/* Product Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {products?.results.map((product) => (
          <Card key={product.id} sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                ${product.price}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button 
                  size="small"
                  onClick={() => handleToggleStatus(product.id)}
                  color={product.inStock ? 'success' : 'warning'}
                >
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Button>
                
                <Button 
                  size="small"
                  onClick={() => handleDuplicateProduct(product.id)}
                  loading={duplicateProduct.isPending}
                >
                  Duplicate
                </Button>
                
                <Button 
                  size="small"
                  color="error"
                  onClick={() => handleDeleteProduct(product.id)}
                  loading={deleteProduct.isPending}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
```

---

## 📦 Orders Example

### Order Entity
```typescript
// src/models/Order.ts
export interface Order extends BaseEntity {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  orderDate: Date;
  deliveryDate?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface CreateOrderRequest {
  customerId: string;
  items: Omit<OrderItem, 'productName'>[];
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  deliveryDate?: Date;
  items?: OrderItem[];
}

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}
```

### Order Hooks
```typescript
// src/viewmodels/hooks/useOrders.ts
'use client';

import { createEntityCrudHooks } from './useEntityCrud';
import { orderApiService } from '../../services/api/orderApi';
import type { Order, CreateOrderRequest, UpdateOrderRequest, OrderFilters } from '../../models/Order';

const orderEntityService = {
  getAll: orderApiService.getOrders.bind(orderApiService),
  getById: orderApiService.getOrderById.bind(orderApiService),
  create: orderApiService.createOrder.bind(orderApiService),
  update: orderApiService.updateOrder.bind(orderApiService),
  delete: orderApiService.deleteOrder.bind(orderApiService),
};

const orderCrudHooks = createEntityCrudHooks('orders', orderEntityService);

export const orderQueryKeys = orderCrudHooks.queryKeys;
export const useOrders = orderCrudHooks.useEntityList;
export const useOrder = orderCrudHooks.useEntity;
export const useCreateOrder = orderCrudHooks.useCreateEntity;
export const useUpdateOrder = orderCrudHooks.useUpdateEntity;
export const useDeleteOrder = orderCrudHooks.useDeleteEntity;

// Order-specific hooks
export function useUpdateOrderStatus() {
  const { invalidateQuery } = useInvalidateQuery();
  
  return useApiMutation<Order, { id: string; status: OrderStatus }>(
    ({ id, status }) => orderApiService.updateOrderStatus(id, status),
    {
      onSuccess: (updatedOrder) => {
        invalidateQuery(orderQueryKeys.detail(updatedOrder.id));
        invalidateQuery(orderQueryKeys.lists());
      },
    }
  );
}

export function useOrdersByCustomer(customerId: string) {
  return useOrders({ customerId });
}

export function usePendingOrders() {
  return useOrders({ status: 'pending' });
}
```

---

## 🏷️ Categories Example

### Simple Entity (No Complex Operations)
```typescript
// src/models/Category.ts
export interface Category extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface CategoryFilters {
  parentId?: string;
  isActive?: boolean;
  search?: string;
}
```

### Category Hooks
```typescript
// src/viewmodels/hooks/useCategories.ts
'use client';

import { createEntityCrudHooks } from './useEntityCrud';
import { categoryApiService } from '../../services/api/categoryApi';

const categoryEntityService = {
  getAll: categoryApiService.getCategories.bind(categoryApiService),
  getById: categoryApiService.getCategoryById.bind(categoryApiService),
  create: categoryApiService.createCategory.bind(categoryApiService),
  update: categoryApiService.updateCategory.bind(categoryApiService),
  delete: categoryApiService.deleteCategory.bind(categoryApiService),
  activate: categoryApiService.activateCategory.bind(categoryApiService),
  deactivate: categoryApiService.deactivateCategory.bind(categoryApiService),
};

const categoryCrudHooks = createEntityCrudHooks('categories', categoryEntityService);

export const categoryQueryKeys = categoryCrudHooks.queryKeys;
export const useCategories = categoryCrudHooks.useEntityList;
export const useCategory = categoryCrudHooks.useEntity;
export const useCreateCategory = categoryCrudHooks.useCreateEntity;
export const useUpdateCategory = categoryCrudHooks.useUpdateEntity;
export const useDeleteCategory = categoryCrudHooks.useDeleteEntity;
export const useToggleCategoryStatus = categoryCrudHooks.useToggleEntityStatus;

// Category-specific helpers
export function useActiveCategories() {
  return useCategories({ isActive: true });
}

export function useTopLevelCategories() {
  return useCategories({ parentId: null });
}

export function useSubCategories(parentId: string) {
  return useCategories({ parentId });
}
```

---

## 🚀 Advanced Patterns

### 1. Extending Generic Hooks
```typescript
// Create custom hooks that extend the generic ones
export function useProductsWithInventory() {
  const { data: products, ...rest } = useProducts();
  
  const productsWithLowStock = useMemo(() => 
    products?.results.filter(product => product.stock < 10) || [], 
    [products]
  );

  return {
    ...rest,
    data: products,
    lowStockProducts: productsWithLowStock,
  };
}
```

### 2. Computed Queries
```typescript
export function useOrderStatistics() {
  const { data: orders } = useOrders();
  
  return useMemo(() => {
    if (!orders?.results) return null;
    
    return {
      total: orders.results.length,
      pending: orders.results.filter(o => o.status === 'pending').length,
      completed: orders.results.filter(o => o.status === 'delivered').length,
      revenue: orders.results.reduce((sum, o) => sum + o.totalAmount, 0),
    };
  }, [orders]);
}
```

### 3. Cross-Entity Relationships
```typescript
export function useOrderWithDetails(orderId: string) {
  const { data: order } = useOrder(orderId);
  const { data: customer } = useUser(order?.customerId!, { 
    enabled: !!order?.customerId 
  });
  
  return {
    order,
    customer,
    isLoading: !order || !customer,
  };
}
```

### 4. Optimistic Updates with Rollback
```typescript
export function useOptimisticProductUpdate() {
  const queryClient = useQueryClient();
  
  return useApiMutation<Product, { id: string; data: UpdateProductRequest }>(
    ({ id, data }) => productApiService.updateProduct(id, data),
    {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey: productQueryKeys.detail(id) });
        
        const previousProduct = queryClient.getQueryData(productQueryKeys.detail(id));
        
        queryClient.setQueryData(productQueryKeys.detail(id), (old: Product) => ({
          ...old,
          ...data,
        }));
        
        return { previousProduct, id };
      },
      onError: (err, variables, context) => {
        if (context?.previousProduct) {
          queryClient.setQueryData(
            productQueryKeys.detail(context.id),
            context.previousProduct
          );
        }
      },
      onSettled: (data, error, { id }) => {
        queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(id) });
      },
    }
  );
}
```

---

## 📋 Migration Guide

### From Manual Hooks to Generic Pattern

#### Before (Manual)
```typescript
// Old manual approach
export function useUsers() {
  return useQuery(['users'], userApiService.getUsers);
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation(userApiService.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
}
```

#### After (Generic)
```typescript
// New generic approach
const userCrudHooks = createEntityCrudHooks('users', userEntityService);
export const useUsers = userCrudHooks.useEntityList;
export const useCreateUser = userCrudHooks.useCreateEntity;
```

### Migration Steps
1. **Define entity types** (if not already done)
2. **Create API service** following the interface
3. **Replace manual hooks** with generic factory
4. **Update imports** in components
5. **Test thoroughly** to ensure same behavior

### Backward Compatibility
```typescript
// Keep old exports for gradual migration
export const useUsersList = useUsers; // Deprecated, use useUsers
export const useUserCreate = useCreateUser; // Deprecated, use useCreateUser
```

---

## 🎯 Best Practices

### 1. Consistent Naming
```typescript
// ✅ Good - Consistent entity naming
useProducts() // List
useProduct(id) // Single
useCreateProduct() // Create
useUpdateProduct() // Update
useDeleteProduct() // Delete

// ❌ Bad - Inconsistent naming
useProductsList()
useGetProduct(id)
useProductCreate()
```

### 2. Type Safety
```typescript
// ✅ Good - Proper typing
const { data: products } = useProducts({
  category: 'electronics', // Type-safe filter
});

// ❌ Bad - No typing
const { data: products } = useProducts({
  category: 'invalid-category', // Would fail at runtime
});
```

### 3. Error Handling
```typescript
// ✅ Good - Handle errors appropriately
function ProductList() {
  const { data, error, isLoading } = useProducts();
  
  if (isLoading) return <ProductSkeleton />;
  if (error) return <ErrorAlert error={error} />;
  
  return <ProductGrid products={data?.results} />;
}
```

### 4. Query Key Management
```typescript
// ✅ Good - Use provided query keys
invalidateQuery(productQueryKeys.lists());
invalidateQuery(productQueryKeys.detail(id));

// ❌ Bad - Manual query keys
invalidateQuery(['products']);
invalidateQuery(['products', id]);
```

---

This comprehensive guide shows how to leverage the generic CRUD hooks pattern for any entity in your application, providing consistency, type safety, and maintainability across your entire codebase. 