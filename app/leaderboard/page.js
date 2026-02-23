'use client';
import Axios from '@/Helper/Axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Leaderboard() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [categoryLeaderboards, setCategoryLeaderboards] = useState([]);

    const fetchCategoryLeaderboards = async () => {
        setLoading(true);
        try {
            const { data } = await Axios.get('/leaderboard');
            if (data.status) {
                const apiCategories = data.data?.categories || [];
                setCategories(apiCategories);

                const boards = apiCategories.map((category, index) => {
                    const trackLabel = `Track ${String(index + 1).padStart(2, '0')}`;

                    let subtitle = 'Top organizations in this category';
                    if (category.slug === 'for-profit') {
                        subtitle = 'Ethical Startup';
                    } else if (category.slug === 'non-profit-organisation') {
                        subtitle = 'Pure service';
                    } else if (category.slug === 'ibadah-support') {
                        subtitle = 'Spiritual innovation';
                    }

                    return {
                        slug: category.slug,
                        title: category.name,
                        trackLabel,
                        subtitle,
                        profiles: category.profiles || [],
                    };
                });

                setCategoryLeaderboards(boards);
            }
        } catch (err) {
            console.error("Error fetching category leaderboards", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoryLeaderboards();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 mb-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span className="tracking-[0.18em] uppercase">
                            Category overview
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-3">
                        Category Leaderboard 🏆
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Explore the top organizations ranked within each Ma’a Impact category.
                    </p>
                </div>

                {/* Category Leaderboards */}
                <div className="mb-12">

                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-3">
                            {[0, 1, 2].map(index => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden"
                                >
                                    <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="h-3 w-24 bg-indigo-100 rounded-full mb-2" />
                                                <div className="h-4 w-32 bg-indigo-50 rounded-full" />
                                            </div>
                                            <div className="h-6 w-20 bg-indigo-50 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-1.5">
                                        {[0, 1, 2, 3, 4].map(item => (
                                            <div
                                                key={item}
                                                className="flex items-center pr-3 py-3 rounded-xl border border-transparent"
                                            >
                                                <div className="w-8 h-4 bg-indigo-50 rounded-full mr-3" />
                                                <div className="relative w-10 h-10 flex-shrink-0 mr-4">
                                                    <div className="w-full h-full bg-indigo-50 rounded-full" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="h-3 w-32 bg-indigo-50 rounded-full mb-1" />
                                                    <div className="h-2 w-20 bg-indigo-100 rounded-full" />
                                                </div>
                                                <div className="w-10 h-4 bg-indigo-50 rounded-full ml-3" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-3">
                            {categoryLeaderboards.map(category => (
                                <div
                                    key={category.slug}
                                    className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden"
                                >
                                    <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-[0.18em]">
                                                    {category.trackLabel}
                                                </p>
                                                <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                                                    <span>{category.title}</span>
                                                </h3>
                                                <p className="text-xs font-semibold text-indigo-700 mt-1">
                                                    {category.subtitle}
                                                </p>
                                            </div>
                                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                                                Top 5
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-0.5">
                                        {category.profiles.length > 0 ? (
                                            category.profiles.map((profile, index) => (
                                                <div
                                                    key={profile.id}
                                                    className="flex items-center pr-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors group border border-transparent hover:border-indigo-100 cursor-pointer"
                                                >
                                                    <div
                                                        className={`font-bold w-8 text-lg mr-2 ${
                                                            profile.rank === 1
                                                                ? 'text-yellow-500'
                                                                : profile.rank === 2
                                                                    ? 'text-gray-400'
                                                                    : profile.rank === 3
                                                                        ? 'text-amber-600'
                                                                        : 'text-indigo-300'
                                                        }`}
                                                    >
                                                        #{String(profile.rank).padStart(2, '0')}
                                                    </div>

                                                    <div className="relative w-10 h-10 flex-shrink-0 mr-4">
                                                        {profile.logo_url ? (
                                                            <img
                                                                src={profile.logo_url}
                                                                alt={profile.organization_name}
                                                                className="w-full h-full object-cover rounded-full border-2 border-indigo-100 group-hover:border-indigo-200 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-bold border-2 border-indigo-50 text-sm">
                                                                {profile.organization_name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                        {index === 0 && (
                                                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[9px] px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                                                                Top
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-indigo-900 truncate">
                                                            {profile.organization_name}
                                                        </p>
                                                        {profile.country && (
                                                            <p className="text-[11px] text-indigo-500 truncate">
                                                                {profile.country}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="text-right pl-3">
                                                        <div className="font-bold text-indigo-600 text-xl leading-none">
                                                            {profile.votes_count || 0}
                                                        </div>
                                                        <div className="text-[10px] text-indigo-400 uppercase tracking-wide font-semibold mt-1">
                                                            Votes
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-slate-500 bg-indigo-50/60 border border-dashed border-indigo-100 rounded-xl px-4 py-6 text-center">
                                                No organizations in this track yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
