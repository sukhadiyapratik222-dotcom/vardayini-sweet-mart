'use client';

import { useParams } from 'next/navigation';
import CatalogBrowser from '../../components/CatalogBrowser';

export default function SubCategoryPage() {
  const params = useParams();
  const categorySegments = params?.category;
  
  // Extract category slug from route params (e.g. ['sweets', 'kaju-sweets'] -> 'kaju-sweets')
  const activeCategory = Array.isArray(categorySegments)
    ? categorySegments[categorySegments.length - 1]
    : String(categorySegments || '');

  return <CatalogBrowser initialCategory={activeCategory} />;
}
