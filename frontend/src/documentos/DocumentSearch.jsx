import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../common/SearchBar';
import FilterPanel from '../common/FilterPanel';
import DocumentCard from './DocumentCard';
import { searchDocuments } from '../../services/documents';

/**
 * DocumentSearch - Componente para buscar y filtrar documentos
 * Implementa búsqueda avanzada por categoría, fecha y universidad
 * @returns {JSX.Element} El componente de búsqueda de documentos
 */
const DocumentSearch = () => {
  // Capturar parámetros de URL para mantener el estado de búsqueda en navegación
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Estado local utilizando hooks (enfoque funcional)
  const [searchTerm, setSearchTerm] = useState(queryParams.get('query') || '');
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    university: queryParams.get('university') || '',
    fromDate: queryParams.get('fromDate') || '',
    toDate: queryParams.get('toDate') || '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Función para actualizar los filtros (enfoque inmutable - programación funcional)
   * @param {Object} newFilters - Nuevos valores de filtro a aplicar
   */
  const updateFilters = useCallback((newFilters) => {
    // Actualiza los filtros de manera inmutable (paradigma funcional)
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
    // Resetear paginación al cambiar filtros
    setPage(1);
  }, []);

  /**
   * Función de búsqueda debounced para evitar muchas llamadas API
   * Utiliza useCallback para memoización (optimización funcional)
   */
  const fetchDocuments = useCallback(
    async (isNewSearch = false) => {
      try {
        setLoading(true);

        // Si es una nueva búsqueda, resetear página
        const currentPage = isNewSearch ? 1 : page;

        // Construir objeto de parámetros de búsqueda
        const searchParams = {
          query: searchTerm,
          page: currentPage,
          limit: 12,
          ...filters,
        };

        // Llamar al servicio de búsqueda
        const response = await searchDocuments(searchParams);

        // Actualizar documentos (manera inmutable - programación funcional)
        setDocuments((prevDocs) => (isNewSearch ? response.data : [...prevDocs, ...response.data]));

        // Actualizar estado de paginación
        setHasMore(response.totalPages > currentPage);

        // Actualizar URL para permitir compartir resultados de búsqueda
        updateUrlWithSearchParams(searchParams);
      } catch (error) {
        console.error('Error al buscar documentos:', error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filters, page]
  );

  /**
   * Actualiza la URL con los parámetros de búsqueda actuales
   * @param {Object} params - Parámetros de búsqueda
   */
  const updateUrlWithSearchParams = useCallback((params) => {
    const url = new URL(window.location);

    // Filtrar parámetros vacíos (enfoque funcional)
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    // Actualizar la URL sin recargar la página
    window.history.pushState({}, '', url);
  }, []);

  // Cargar documentos cuando cambian los filtros o la página
  useEffect(() => {
    fetchDocuments(false);
  }, [page]);

  // Realizar nueva búsqueda cuando cambian los términos o filtros
  useEffect(() => {
    // Debounce para evitar múltiples búsquedas durante la escritura
    const handler = setTimeout(() => {
      fetchDocuments(true);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, filters, fetchDocuments]);

  /**
   * Manejador para cargar más resultados (paginación)
   */
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="document-search">
      <div className="search-header">
        <h1>Buscar Documentos</h1>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por título, autor, contenido..."
        />
      </div>

      <div className="search-container">
        <aside className="filter-sidebar">
          <FilterPanel filters={filters} onFilterChange={updateFilters} />
        </aside>

        <main className="search-results">
          {documents.length === 0 && !loading ? (
            <div className="no-results">No se encontraron documentos que coincidan con tu búsqueda.</div>
          ) : (
            <>
              <div className="documents-grid">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {hasMore && (
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Cargar más resultados'}
                </button>
              )}
            </>
          )}

          {loading && <div className="loading-indicator">Cargando...</div>}
        </main>
      </div>
    </div>
  );
};

export default DocumentSearch;