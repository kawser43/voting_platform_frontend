'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import Axios from '@/Helper/Axios';

export default function HeroSection({ profiles }) {
    const { isLoggedIn } = useUser();
    // Sort profiles by votes (descending) and take top 5
    const topProfiles = profiles ? [...profiles].sort((a, b) => b.votes_count - a.votes_count).slice(0, 5) : [];
    
    const [heroContent, setHeroContent] = useState({
        hero_title: 'Vote for Your <br class="hidden lg:block" /> <span class="text-indigo-600">Favorite Organization</span>',
        hero_subtitle: 'Discover and support amazing organizations making a difference. Your vote counts in shaping the future!',
        hero_button_text: 'Get Started',
        hero_button_2_text: 'View Leaderboard'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await Axios.get('/settings?group=hero_section');
                if (data.status && Object.keys(data.data).length > 0) {
                    setHeroContent(prev => ({ ...prev, ...data.data }));
                }
            } catch (err) {
                console.error("Error fetching hero settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleGetStarted = (e) => {
        if (isLoggedIn) {
            e.preventDefault();
            const element = document.getElementById('organizations-section');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="bg-indigo-50 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Left Column: Heading, Subheading, Short Description */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <h1 
                            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-indigo-900 leading-tight"
                            dangerouslySetInnerHTML={{ __html: heroContent.hero_title }}
                        >
                        </h1>
                        
                        <p className="text-lg md:text-xl text-indigo-800 max-w-lg mx-auto md:mx-0 leading-relaxed">
                            {heroContent.hero_subtitle}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                            <Link 
                                href={isLoggedIn ? "#organizations-section" : "/auth/login"}
                                onClick={handleGetStarted}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {heroContent.hero_button_text}
                            </Link>
                            <Link 
                                href="/leaderboard" 
                                className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-semibold hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md"
                            >
                                {heroContent.hero_button_2_text}
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Leaderboard */}
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden transform transition-all hover:shadow-2xl">
                            <div className="p-6 border-b border-indigo-50 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                                    <span className="text-2xl">🏆</span> Top Organizations
                                </h2>
                                <Link 
                                    href="/leaderboard" 
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                >
                                    View All <span>→</span>
                                </Link>
                            </div>
                            
                            <div className="p-4 space-y-0.5">
                                {topProfiles.length > 0 ? (
                                    topProfiles.map((profile, index) => (
                                        <div 
                                            key={profile.id} 
                                            className="flex items-center pr-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors group border border-transparent hover:border-indigo-100 cursor-pointer"
                                        >
                                            <div className={`font-bold w-8 text-lg mr-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-indigo-300'}`}>
                                                #{String(index + 1).padStart(2, '0')}
                                            </div>
                                            
                                            <div className="relative w-12 h-12 flex-shrink-0 mr-4">
                                                {profile.logo_url ? (
                                                    <img 
                                                        src={profile.logo_url} 
                                                        alt={profile.organization_name} 
                                                        className="w-full h-full object-cover rounded-full border-2 border-indigo-100 group-hover:border-indigo-200 shadow-sm" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-bold border-2 border-indigo-50 text-xl">
                                                        {profile.organization_name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                {index === 0 && (
                                                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                                                        Top
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-indigo-900 truncate text-base">
                                                    {profile.organization_name}
                                                </h3>
                                            </div>
                                            
                                            <div className="text-right pl-3">
                                                <div className="font-bold text-indigo-600 text-2xl leading-none">
                                                    {profile.votes_count || 0}
                                                </div>
                                                <div className="text-[10px] text-indigo-400 uppercase tracking-wide font-semibold mt-1">
                                                    Votes
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-indigo-400">
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="h-12 w-12 bg-indigo-100 rounded-full mb-4"></div>
                                            <div className="h-4 w-32 bg-indigo-100 rounded mb-2"></div>
                                            <div className="h-3 w-24 bg-indigo-50 rounded"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}