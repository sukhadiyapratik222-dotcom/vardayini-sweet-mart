import CatalogBrowser from '../components/CatalogBrowser';

type ProductsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? '');

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <CatalogBrowser
      initialCategory={getValue(searchParams?.category)}
      initialSearch={getValue(searchParams?.search)}
    />
  );
}
