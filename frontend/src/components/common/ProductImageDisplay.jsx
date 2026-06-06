import React, { useEffect, useState } from 'react';
import { FiPackage } from 'react-icons/fi';
import { getProductImage } from '../../data/productImageMap';

/**
 * Shows a photo from src/assets/product images/ when mapped; otherwise a category emoji or icon.
 */
const ProductImageDisplay = ({
  productId,
  alt,
  className = 'w-full h-full object-contain',
  fallbackEmoji,
  emojiClassName = 'text-6xl sm:text-7xl select-none group-hover:scale-110 transition-transform duration-500',
  icon: Icon = FiPackage,
  iconClassName = 'w-20 h-20 sm:w-24 sm:h-24 text-brand-primary-600 dark:text-brand-primary-400 opacity-50',
  iconWrapperClassName = '',
  width = 640,
  height = 480,
  loading = 'lazy',
}) => {
  const src = getProductImage(productId);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [productId, src]);

  if (!src || imageError) {
    const placeholder = fallbackEmoji ? (
      <span className={emojiClassName} role="img" aria-label={alt}>
        {fallbackEmoji}
      </span>
    ) : (
      <Icon className={iconClassName} aria-hidden />
    );

    return iconWrapperClassName ? (
      <div className={iconWrapperClassName}>{placeholder}</div>
    ) : (
      placeholder
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ProductImageDisplay;
