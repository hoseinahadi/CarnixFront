import React, { useState } from 'react';
import { Modal } from '@mui/material';
// اضافه کردن آیکون Trash2
import { X, CheckCircle2, Heart, Plus, Minus, Loader2, Trash2 } from 'lucide-react'; 
import styles from './ProductOverViewModal.module.scss';
import ProductGallery from '../ProductGallery/ProductGallery';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store'; 
// اضافه کردن سلکتور و تانک‌های مربوط به آپدیت و حذف
import { addToCart, updateItemQuantity, removeCartItem } from '@/store/feature/cart/cartThunks'; 
import { selectCartActionLoading, selectCart } from '@/store/feature/cart/cartSelectors'; 

const ProductOverViewModal = (props: any) => {
    const { isOpen, modalClose, product } = props;
    
    // Redux Setup
    const dispatch = useDispatch<AppDispatch>();
    const actionLoading = useSelector(selectCartActionLoading);
    const cart = useSelector(selectCart); // دریافت سبد خرید از ریداکس

    // Local State for Quantity (فقط برای زمانی که محصول در سبد نیست)
    const [localQuantity, setLocalQuantity] = useState(1);

    if (!product) return null;

    // پیدا کردن محصول در سبد خرید ریداکس
    const cartItem = cart?.items?.find((item: any) => item.productId === product.productId);
    const isInCart = !!cartItem;

    const hasDiscount = product.productDiscount && product.productDiscount.isActive;
    let finalPrice = product.basePrice; 

    // ---- هندلرهای مربوط به حالت لوکال (محصول در سبد نیست) ----
    const handleLocalIncrease = () => setLocalQuantity(prev => prev + 1);
    const handleLocalDecrease = () => setLocalQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        dispatch(addToCart({ productId: product.productId, quantity: localQuantity }))
            .unwrap()
            .then(() => {
                // modalClose(); // اگه میخوای بعد از افزودن، مودال بسته نشه و حالت دکمه تغییر کنه، این خط رو کامنت کن
            })
            .catch((error) => console.error(error));
    };

    // ---- هندلرهای مربوط به حالت سبد خرید (محصول در سبد هست) ----
    const handleCartIncrease = () => {
        if (cartItem) {
            dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity + 1 }));
        }
    };

    const handleCartDecreaseOrRemove = () => {
        if (cartItem) {
            if (cartItem.quantity > 1) {
                // اگر بیشتر از یکی بود، کم کن
                dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity - 1 }));
            } else {
                // اگر ۱ بود، کلاً از سبد خرید حذف کن
                dispatch(removeCartItem(cartItem.cartItemId));
            }
        }
    };

    return (
        <Modal className={styles.container} open={isOpen} onClose={modalClose}>
            <div className={styles.contentContainer} dir="rtl">
                
                <button className={styles.closeBtn} onClick={modalClose}>
                    <X size={24} />
                </button>

                <div className={styles.gridContainer}>
                    
                    {/* سمت راست: گالری عکس */}
                    <div className={styles.productGalleryContainer}>
                        <ProductGallery  />
                    </div>

                    {/* سمت چپ: اطلاعات محصول */}
                    <div className={styles.productInfoContainer}>
                        
                        <h3 className={styles.title}>{product.productName}</h3>

                        <div className={styles.priceWrapper}>
                            {hasDiscount && (
                                <span className={styles.oldPrice}>
                                    {product.basePrice.toLocaleString('fa-IR')}
                                </span>
                            )}
                            <span className={styles.priceValue}>
                                {finalPrice.toLocaleString('fa-IR')} <span className={styles.currency}>تومان</span>
                            </span>
                        </div>

                        <div className={styles.metaInfo}>
                            <span className={styles.brand}>برند : {product.brandName || 'ایساکو'}</span>
                            {product.totalStock > 0 ? (
                                <span className={styles.hasProduct}>
                                    <CheckCircle2 size={16} /> موجود در انبار
                                </span>
                            ) : (
                                <span className={styles.notHasProduct}>ناموجود</span>
                            )}
                        </div>

                        <div className={styles.featuresBox}>
                            <h4>ویژگی های محصول:</h4>
                            <ul>
                                <li>جنس فلز</li>
                                <li>مناسب همه مدل های رانا</li>
                                <li>قابل استفاده در دنا</li>
                            </ul>
                        </div>

                        {/* ==================================================== */}
                        {/* ================ بخش مدیریت دکمه‌ها ================ */}
                        {/* ==================================================== */}
                        
                        {isInCart ? (
                            // اگر محصول داخل سبد خرید بود:
                            <div className={styles.inCartActionContainer}>
                                <div className={styles.inCartHeader}>
                                    <span>در سبد خرید شما:</span>
                                    <span className={styles.totalPriceCart}>
                                        {(cartItem.quantity * cartItem.unitPrice).toLocaleString('fa-IR')} تومان
                                    </span>
                                </div>
                                <div className={styles.cartQuantityControl}>
                                    <button onClick={handleCartIncrease} disabled={actionLoading}>
                                        <Plus size={20} />
                                    </button>
                                    
                                    <span className={styles.quantityNumber}>
                                        {actionLoading ? <Loader2 className={styles.spinner} size={20} /> : cartItem.quantity.toLocaleString('fa-IR')}
                                    </span>

                                    <button 
                                        onClick={handleCartDecreaseOrRemove} 
                                        disabled={actionLoading} 
                                        className={cartItem.quantity === 1 ? styles.trashBtn : ''}
                                    >
                                        {cartItem.quantity > 1 ? <Minus size={20} /> : <Trash2 size={20} />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // اگر محصول در سبد خرید نبود (حالت پیش‌فرض):
                            <>
                                <div className={styles.quantityAction}>
                                    <span className={styles.quantityLabel}>تعداد:</span>
                                    <div className={styles.quantityControl}>
                                        <button onClick={handleLocalDecrease} disabled={localQuantity <= 1 || actionLoading}>
                                            <Minus size={16} />
                                        </button>
                                        <span className={styles.quantityNumber}>{localQuantity.toLocaleString('fa-IR')}</span>
                                        <button onClick={handleLocalIncrease} disabled={actionLoading}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.actionButtons}>
                                    <button 
                                        className={styles.addToCartBtn} 
                                        onClick={handleAddToCart}
                                        disabled={actionLoading || product.totalStock <= 0}
                                    >
                                        {actionLoading ? (
                                            <Loader2 className={styles.spinner} size={24} />
                                        ) : (
                                            'افزودن به سبد خرید'
                                        )}
                                    </button>
                                    
                                    <button className={styles.wishlistBtn}>
                                        <Heart size={24} />
                                    </button>
                                </div>
                            </>
                        )}

                        <div className={styles.viewFullProduct}>
                            <a href={`/product/${product.productId}`}>مشاهده کامل محصول &gt;</a>
                        </div>

                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProductOverViewModal;
