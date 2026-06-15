// features/products/components/ProductList.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/index';
import {
  selectProducts,
  selectProductsLoading,
  selectProductsActionLoading,
  selectProductsError,
  selectProductDetails, // 👈 اضافه شد
  selectDetailsLoading  // 👈 اضافه شد
} from '@/redux/features/product/ProductSelectors';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductDetails, // 👈 اضافه شد
} from '@/redux/features/product/ProductThunks';
import { 
  setSelectedProduct, 
  clearError,
  clearProductDetails // 👈 اضافه شد
} from '@/redux/features/product/ProductSlice';
import type { Product, CreateProductDto, UpdateProductDto } from '@/models/product/Product';

import ProductHeader from '../../components/ProductHeader/ProductHeader';
import ProductTable from '../ProductTable/ProductTable';
import ProductModal from '../../components/ProductModal/ProductModal';
import ConfirmModal from '../../../../layout/components/dasboard/ConfirmModal/ConfirmModal';
import ProductDetailsModal from '../../components/ProductDetailsModal/ProductDetailsModal';

import { CategoryApi } from '@/api/category/routes'; 
import type { Category } from '@/models/category/Category'; 

import styles from './ProductList.module.scss';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ─── Selectors ────────────────────────────────────────
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const actionLoading = useSelector(selectProductsActionLoading);
  const error = useSelector(selectProductsError);
  console.log("products",products)
  // سلکتورهای مربوط به مدال جزئیات
  const productDetails = useSelector(selectProductDetails);
  const detailsLoading = useSelector(selectDetailsLoading);

  // ─── Local State ──────────────────────────────────────
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // ─── استیت‌های دسته‌بندی ─────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // ─── بارگذاری اولیه (محصولات و دسته‌بندی‌ها) ───────────
  useEffect(() => {
    dispatch(getAllProducts(undefined));

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await CategoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [dispatch]);

  // ─── نمایش خطا ───────────────────────────────────────
  useEffect(() => {
    if (error) {
      console.error('Product Error:', error);
      const timer = setTimeout(() => dispatch(clearError()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // ─── فیلتر جستجو (Client-side) ───────────────────────
  const filteredProducts = useMemo(() => {
    if (!searchValue.trim()) return products;
    const query = searchValue.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(query) ||
        p.categoryName?.toLowerCase().includes(query) ||
        p.brandName?.toLowerCase().includes(query)
    );
  }, [products, searchValue]);

  // ─── Handlers ─────────────────────────────────────────
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    dispatch(setSelectedProduct(product));
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (product: Product) => {
    setDeletingProduct(product);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    await dispatch(deleteProduct(deletingProduct.productId));
    setIsConfirmOpen(false);
    setDeletingProduct(null);
  };

  const handleToggleStatus = (product: Product) => {
    dispatch(toggleProductStatus(product.productId));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    dispatch(setSelectedProduct(null));
  };

  const handleModalSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    if (editingProduct) {
      const result = await dispatch(updateProduct(data as UpdateProductDto));
      if (updateProduct.fulfilled.match(result)) handleModalClose();
    } else {
      const result = await dispatch(createProduct(data as CreateProductDto));
      if (createProduct.fulfilled.match(result)) handleModalClose();
    }
  };

  // ─── Handlers برای مدال جزئیات ────────────────────────
  const handleView = (product: Product) => {
    setIsDetailsModalOpen(true);
    // دریافت اطلاعات کامل محصول از سرور
    dispatch(getProductDetails(product.productId));
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    // پاک کردن دیتای قبلی برای جلوگیری از نمایش لحظه‌ای آن در دفعات بعد
    dispatch(clearProductDetails());
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => dispatch(clearError())}>✕</button>
        </div>
      )}

      <ProductHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddNew={handleAddNew}
        onRefresh={() => dispatch(getAllProducts(undefined))}
        totalCount={filteredProducts.length} 
        loading={loading} 
      />

      <ProductTable
        products={filteredProducts || []}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onToggleStatus={handleToggleStatus}
        onView={handleView}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingProduct={editingProduct}
        loading={actionLoading}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="حذف محصول"
        message={`آیا از حذف "${deletingProduct?.productName}" اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        variant="danger"
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        product={productDetails} // 👈 دیتای کامل که از Redux می‌آید
        loading={detailsLoading} // 👈 برای نمایش اسپینر لودینگ درون مدال (اگر پشتیبانی می‌کند)
      />
    </div>
  );
};

export default ProductList;
