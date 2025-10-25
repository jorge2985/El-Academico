import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SearchBar from '../components/common/SearchBar';
import DocumentCard from '../components/documents/DocumentCard';
import BlogPost from '../components/blog/BlogPost';
import { fetchRecentDocuments, fetchRecentBlogPosts } from '../services/api';

/**
 * HomePage - componente que muestra la página principal con documentos y publicaciones recientes.
 * @returns {JSX.Element}
 */
const HomePage = () => {
        const [recentDocuments, setRecentDocuments] = useState([]);
        const [recentPosts, setRecentPosts] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
                let mounted = true;

                const loadInitialData = async () => {
                        try {
                                setIsLoading(true);
                                const [documentsData, postsData] = await Promise.all([
                                        fetchRecentDocuments(),
                                        fetchRecentBlogPosts(),
                                ]);

                                if (!mounted) return;
                                setRecentDocuments(documentsData || []);
                                setRecentPosts(postsData || []);
                        } catch (err) {
                                // Asegurarse de manejar distintos tipos de error
                                setError(err?.message || String(err));
                        } finally {
                                if (mounted) setIsLoading(false);
                        }
                };

                loadInitialData();

                return () => {
                        mounted = false;
                };
        }, []);

        const renderSection = (title, linkTo, children) => (
                <section className="homepage-section">
                        <div className="section-header">
                                <h2>{title}</h2>
                                <Link to={linkTo} className="see-more-link">
                                        Ver más
                                </Link>
                        </div>
                        <div className="section-content">{children}</div>
                </section>
        );

        if (isLoading) return <div className="loading-spinner">Cargando...</div>;
        if (error) return <div className="error-message">Error: {error}</div>;

        return (
                <div className="home-page">
                        <Navbar />

                        <main>
                                <section className="hero-section">
                                        <h1>Conocimiento científico y académico al alcance de todos</h1>
                                        <p>
                                                Encuentra documentos, investigaciones y recursos académicos de las mejores
                                                universidades
                                        </p>
                                        <SearchBar placeholder="Buscar por tema, universidad o categoría..." />
                                </section>

                                {renderSection(
                                        'Documentos recientes',
                                        '/documents',
                                        <div className="documents-grid">
                                                {recentDocuments.map((doc) => (
                                                        <DocumentCard key={doc.id} document={doc} />
                                                ))}
                                        </div>
                                )}

                                {renderSection(
                                        'Publicaciones del blog',
                                        '/blog',
                                        <div className="blog-grid">
                                                {recentPosts.map((post) => (
                                                        <BlogPost key={post.id} post={post} isPreview />
                                                ))}
                                        </div>
                                )}

                                <section className="categories-section">
                                        <h2>Explorar por categoría</h2>
                                        <div className="categories-grid">
                                                {[
                                                        'Ciencias',
                                                        'Humanidades',
                                                        'Ingeniería',
                                                        'Medicina',
                                                        'Derecho',
                                                        'Economía',
                                                ].map((category) => (
                                                        <Link key={category} to={`/documents?category=${encodeURIComponent(category)}`} className="category-card">
                                                                {category}
                                                        </Link>
                                                ))}
                                        </div>
                                </section>
                        </main>

                        <Footer />
                </div>
        );
};

export default HomePage;