'use client';
'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrganizationsSection from '@/components/Home/OrganizationsSection';

export default function ExploreOrganizationsPage() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchProfiles = async (pageNumber = 1, searchQuery = '', categorySlug = selectedCategory) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pageNumber, search: searchQuery });
            if (categorySlug && categorySlug !== 'all') {
                params.set('category_slug', categorySlug);
            }
            const query = params.toString();
            const { data } = await Axios.get(`/profiles?${query}`);
            if (data.status) {
                setProfiles(data.data.profiles.data);
                setLastPage(data.data.profiles.last_page);
                setPage(data.data.profiles.current_page);
            }
        } catch (err) {
            console.error("Error fetching profiles", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await Axios.get('/categories');
            if (data.status) {
                setCategories(data.data || []);
            }
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProfiles(1, '', 'all');
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProfiles(1, search);
    };

    const handleCategoryChange = (slug) => {
        const nextSlug = slug || 'all';
        setSelectedCategory(nextSlug);
        fetchProfiles(1, search, nextSlug);
    };

    const handleScrollToOrganizations = () => {
        const element = document.getElementById('organizations-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-b border-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-500 mb-3">
                            Explore Organizations
                        </p>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-indigo-900 leading-tight mb-4">
                            Discover inspiring organizations in the Ma&apos;a Impact Prize.
                        </h1>
                        <p className="text-base md:text-lg text-indigo-800 max-w-xl mb-6">
                            Browse all participating organizations, learn about their work, and support the causes that matter most to you.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleScrollToOrganizations}
                                className="inline-flex items-center justify-center text-[15px] px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition-colors"
                            >
                                Explore organizations
                            </button>
                            <Link
                                href="/leaderboard"
                                className="inline-flex items-center justify-center gap-2 text-[15px] px-4 py-2 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-300 font-semibold shadow-md hover:bg-indigo-100 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <span>View leaderboard</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <OrganizationsSection
                profiles={profiles}
                loading={loading}
                search={search}
                setSearch={setSearch}
                handleSearch={handleSearch}
                page={page}
                lastPage={lastPage}
                fetchProfiles={fetchProfiles}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
        </div>
    );
}
