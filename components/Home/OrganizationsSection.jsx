'use client';
import Link from 'next/link';

export default function OrganizationsSection({ 
    profiles, 
    loading, 
    search, 
    setSearch, 
    handleSearch, 
    page, 
    lastPage, 
    fetchProfiles,
    categories = [],
    selectedCategory = 'all',
    onCategoryChange,
}) {
    return (
        <section id="organizations-section" className="relative py-20 bg-gray-50/50 overflow-hidden">
            {/* Background Decorative Shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Large circle top right */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-50/50 to-teal-50/30 blur-3xl"></div>
                
                {/* Small circle bottom left */}
                <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-gradient-to-tr from-orange-50/40 to-white blur-2xl"></div>
                
                {/* Dots Pattern */}
                <div className="absolute top-1/4 left-10 w-20 h-20 opacity-20">
                    <div className="w-2 h-2 bg-indigo-200 rounded-full mb-2 ml-4"></div>
                    <div className="w-2 h-2 bg-indigo-200 rounded-full mb-2 ml-8"></div>
                    <div className="w-2 h-2 bg-indigo-200 rounded-full mb-2"></div>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                {/* Header, Search & Filters */}
                <div className="flex flex-col items-center justify-center text-center gap-8 mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold text-indigo-900 mb-2">Explore Organizations</h2>
                        <p className="text-slate-600">Discover impactful initiatives and cast your vote.</p>
                    </div>

                    <div className="w-full max-w-xl space-y-4">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative flex items-center">
                                <input 
                                    type="text" 
                                    placeholder="Search organizations..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-6 pr-32 py-4 bg-white border-2 border-indigo-100 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                        {categories.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-indigo-500 text-center">
                                    Filter by category
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onCategoryChange && onCategoryChange('all')}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                                            selectedCategory === 'all'
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                : 'bg-white text-indigo-700 border-indigo-100 hover:bg-indigo-50'
                                        }`}
                                    >
                                        All
                                    </button>
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => onCategoryChange && onCategoryChange(category.slug)}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                                                selectedCategory === category.slug
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-indigo-700 border-indigo-100 hover:bg-indigo-50'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-50 animate-pulse h-96">
                                <div className="h-48 bg-gray-100 rounded-xl mb-4"></div>
                                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : profiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {profiles.map(profile => (
                            <div 
                                key={profile.id} 
                                className="group bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-50 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Image Container */}
                                <div className="h-52 bg-gray-100 relative overflow-hidden">
                                    {profile.logo_url ? (
                                        <img 
                                            src={profile.logo_url} 
                                            alt={profile.organization_name} 
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-indigo-50 text-indigo-300">
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-indigo-900/95 px-3.5 py-1.5 rounded-full shadow-lg border border-indigo-500/70 flex items-baseline gap-1.5">
                                        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-indigo-200">
                                            Votes
                                        </span>
                                        <span className="text-sm font-extrabold text-white leading-none">
                                            {profile.votes_count}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-indigo-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        <Link href={`/profiles/${profile.id}`} className="hover:underline">
                                            {profile.organization_name}
                                        </Link>
                                    </h3>
                                    {profile.category && profile.category.name && (
                                        <div className="mb-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {profile.category.name}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                                        {profile.summary || "No description available."}
                                    </p>
                                    
                                    <div className="mt-auto pt-6 border-t border-indigo-50">
                                        <Link 
                                            href={`/profiles/${profile.id}`}
                                            className="block w-full text-center bg-white border-2 border-indigo-100 text-indigo-600 px-4 py-3 rounded-xl hover:bg-indigo-600 hover:border-indigo-600 hover:text-white font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-indigo-200">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-indigo-900 mb-2">No organizations found</h3>
                        <p className="text-indigo-500">Try adjusting your search terms</p>
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex justify-center mt-16 gap-3">
                        <button 
                            disabled={page === 1}
                            onClick={() => fetchProfiles(page - 1, search)}
                            className="px-5 py-2.5 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            Previous
                        </button>
                        <span className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 font-semibold min-w-[3rem] text-center">
                            {page}
                        </span>
                        <button 
                            disabled={page === lastPage}
                            onClick={() => fetchProfiles(page + 1, search)}
                            className="px-5 py-2.5 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
