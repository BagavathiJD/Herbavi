import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/client.ts';
import { useSearch } from '../context/SearchContext.tsx';
import type { Product } from '../types/product.tsx';
import { assetUrl } from '../utils/assets.ts';
import { displayPrice, formatProductTitle } from '../utils/format.tsx';

const POPULAR_SEARCHES = ['Ayurveda', 'Siddha', 'Oil', 'Facewash', 'Serum'];

function matchesQuery(product: Product, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  return [product.name, product.description, product.brand]
    .join(' ')
    .toLowerCase()
    .includes(normalized);
}

export default function SearchModal() {
  const navigate = useNavigate();
  const { isOpen, openSearch, closeSearch } = useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const list = await fetchProducts();
      if (!cancelled) {
        setProducts(list);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeSearch]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [isOpen, closeSearch, openSearch]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return products.filter((product) => matchesQuery(product, query)).slice(0, 8);
  }, [products, query]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;

    closeSearch();
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleResultClick = () => {
    closeSearch();
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="herbavi-search-overlay" role="dialog" aria-modal="true" aria-label="Search products">
      <button type="button" className="herbavi-search-backdrop" aria-label="Close search" onClick={closeSearch} />
      <div className="herbavi-search-panel">
        <div className="herbavi-search-panel-top">
          <p className="herbavi-search-eyebrow font-geist">Product search</p>
          <button
            type="button"
            className="herbavi-search-close"
            aria-label="Close search"
            onClick={closeSearch}
          >
            <i className="icon icon-Close"></i>
          </button>
        </div>

        <form className="herbavi-search-form" onSubmit={handleSubmit}>
          <span className="herbavi-search-form-icon" aria-hidden="true">
            <i className="icon icon-Search"></i>
          </span>
          <input
            ref={inputRef}
            type="search"
            className="herbavi-search-input font-geist"
            placeholder="Search skincare, oils, rituals..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search products"
            autoComplete="off"
          />
          <button type="submit" className="herbavi-search-submit tf-btn style-2" disabled={!query.trim()}>
            Search
          </button>
        </form>

        <div className="herbavi-search-tags">
          <span className="herbavi-search-tags-label font-geist">Popular</span>
          <ul className="herbavi-search-tags-list">
            {POPULAR_SEARCHES.map((term) => (
              <li key={term}>
                <button type="button" className="herbavi-search-tag" onClick={() => handlePopularClick(term)}>
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="herbavi-search-body">
          {loading ? (
            <p className="herbavi-search-hint font-geist">Loading products...</p>
          ) : query.trim() ? (
            results.length > 0 ? (
              <>
                <p className="herbavi-search-results-count font-geist">
                  {results.length} result{results.length === 1 ? '' : 's'} found
                </p>
                <ul className="herbavi-search-results list-unstyled mb-0">
                  {results.map((product) => (
                    <li key={product.id} className="herbavi-search-result-item">
                      <Link to={product.url} className="herbavi-search-result-link" onClick={handleResultClick}>
                        <img
                          src={assetUrl(product.image)}
                          alt={formatProductTitle(product.name)}
                          className="herbavi-search-result-image"
                          loading="lazy"
                        />
                        <span className="herbavi-search-result-copy">
                          <span className="herbavi-search-result-name font-geist">
                            {formatProductTitle(product.name)}
                          </span>
                          <span className="herbavi-search-result-price font-geist">
                            {displayPrice(product.priceDisplay, product.price)}
                          </span>
                        </span>
                        <span className="herbavi-search-result-arrow" aria-hidden="true">
                          <i className="icon icon-ArrowCaretRight"></i>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="herbavi-search-footer">
                  <Link
                    to={`/products?q=${encodeURIComponent(query.trim())}`}
                    className="herbavi-search-view-all tf-btn style-2"
                    onClick={handleResultClick}
                  >
                    View all results
                  </Link>
                </div>
              </>
            ) : (
              <p className="herbavi-search-hint font-geist">
                No products found for &quot;{query.trim()}&quot;.
              </p>
            )
          ) : (
            <p className="herbavi-search-hint font-geist">Start typing to explore the Herbavi catalog.</p>
          )}
        </div>
      </div>
    </div>
  );
}
