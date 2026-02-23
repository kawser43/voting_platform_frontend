'use client';
import Axios from '@/Helper/Axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import HeroSection from '@/components/Home/HeroSection';
import JudgesSection from '@/components/Home/JudgesSection';
import PartnersSection from '@/components/Home/PartnersSection';

const SUBMISSION_DEADLINE = Date.UTC(2026, 1, 27, 15, 59, 59);

const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const diff = SUBMISSION_DEADLINE - now;

    if (diff <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: true,
        };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
    };
};

export default function Home() {
    const { user, isLoggedIn } = useUser();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');
    const [judges, setJudges] = useState([]);
    const [loadingJudges, setLoadingJudges] = useState(true);
    const [partners, setPartners] = useState([]);
    const [loadingPartners, setLoadingPartners] = useState(true);
    const [categories, setCategories] = useState([]);
    const [categoryLeaderboards, setCategoryLeaderboards] = useState([]);
    const [voteStatus, setVoteStatus] = useState({
        loading: false,
        hasVoted: false,
        canVote: true
    });
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    const fetchProfiles = async (pageNumber = 1, searchQuery = '') => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page: pageNumber, search: searchQuery }).toString();
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

    const fetchJudges = async () => {
        try {
            const { data } = await Axios.get('/judges');
            if (data.status) {
                setJudges(data.data);
            }
        } catch (err) {
            console.error("Error fetching judges", err);
        } finally {
            setLoadingJudges(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const { data } = await Axios.get('/partners');
            if (data.status) {
                setPartners(data.data);
            }
        } catch (err) {
            console.error("Error fetching partners", err);
        } finally {
            setLoadingPartners(false);
        }
    };

    const fetchCategoryLeaderboards = async () => {
        try {
            const { data } = await Axios.get('/categories');
            if (data.status) {
                const fetchedCategories = data.data || [];
                setCategories(fetchedCategories);

                const limitedCategories = fetchedCategories.slice(0, 3);

                if (limitedCategories.length === 0) {
                    setCategoryLeaderboards([]);
                    return;
                }

                const requests = limitedCategories.map((category, index) => {
                    const params = new URLSearchParams({
                        page: '1',
                        per_page: '5',
                        category_slug: category.slug,
                    });
                    return Axios.get(`/profiles?${params.toString()}`);
                });

                const responses = await Promise.all(requests);

                const leaders = responses.map((response, index) => {
                    const category = limitedCategories[index];
                    const apiData = response.data;
                    const profiles = apiData?.data?.profiles?.data || [];
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
                        profiles,
                    };
                });

                setCategoryLeaderboards(leaders);
            }
        } catch (err) {
            console.error('Error fetching category leaderboards', err);
        }
    };

    useEffect(() => {
        fetchProfiles();
        fetchJudges();
        fetchPartners();
        fetchCategoryLeaderboards();
    }, []);

    useEffect(() => {
        const checkVoteStatus = async () => {
            if (!isLoggedIn || !user || user.account_type !== 'voter') {
                setVoteStatus(prev => ({
                    ...prev,
                    hasVoted: false,
                    canVote: true
                }));
                return;
            }

            setVoteStatus(prev => ({
                ...prev,
                loading: true
            }));

            try {
                const { data } = await Axios.get('/vote/status');
                if (data.status && data.data) {
                    setVoteStatus({
                        loading: false,
                        hasVoted: !!data.data.has_voted,
                        canVote: !!data.data.can_vote
                    });
                } else {
                    setVoteStatus(prev => ({
                        ...prev,
                        loading: false
                    }));
                }
            } catch (err) {
                console.error('Error fetching vote status', err);
                setVoteStatus(prev => ({
                    ...prev,
                    loading: false
                }));
            }
        };

        checkVoteStatus();
    }, [isLoggedIn, user]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const applyHref = isLoggedIn && user?.account_type === 'submitter'
        ? '/dashboard/submission'
        : '/auth/register';

    return (
        <div className="bg-gray-50">
            <main>
                <div className="sticky top-0 z-30 bg-indigo-900 text-indigo-50 border-b border-indigo-700/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Submissions Close In:</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {timeLeft.isPast ? (
                                <span className="text-xs sm:text-sm font-semibold text-amber-200">
                                    Submissions are now closed
                                </span>
                            ) : (
                                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono">
                                    <div className="flex flex-col items-center">
                                        <span className="px-2 py-1 rounded-md bg-indigo-800 text-indigo-50 min-w-[2.5rem] text-center">
                                            {String(timeLeft.days).padStart(2, '0')}
                                        </span>
                                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-indigo-200">Days</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="px-2 py-1 rounded-md bg-indigo-800 text-indigo-50 min-w-[2.5rem] text-center">
                                            {String(timeLeft.hours).padStart(2, '0')}
                                        </span>
                                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-indigo-200">Hours</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="px-2 py-1 rounded-md bg-indigo-800 text-indigo-50 min-w-[2.5rem] text-center">
                                            {String(timeLeft.minutes).padStart(2, '0')}
                                        </span>
                                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-indigo-200">Minutes</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="px-2 py-1 rounded-md bg-indigo-800 text-indigo-50 min-w-[2.5rem] text-center">
                                            {String(timeLeft.seconds).padStart(2, '0')}
                                        </span>
                                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-indigo-200">Seconds</span>
                                    </div>
                                </div>
                            )}
                            <Link
                                href={applyHref}
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-400 text-indigo-950 text-xs sm:text-sm font-semibold shadow-sm hover:bg-emerald-300 transition-colors"
                            >
                                Apply Now
                            </Link>
                        </div>
                    </div>
                </div>
                <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-b border-indigo-100">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 space-y-5">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-100">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                    <span>Ma’a Impact Prize 2026</span>
                                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-indigo-700">
                                        New
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-indigo-900 leading-tight">
                                    Ma’a Impact Innovation Prize
                                </h1>
                                <p className="text-base md:text-lg text-indigo-800 max-w-xl">
                                    Empowering ventures and projects that create lasting change. Open to projects from any country.
                                </p>
                                <p className="text-xs md:text-sm text-indigo-700 max-w-md">
                                    Inspired by the classical meaning of Ma&apos;a, the inseparable bond between effort and support.
                                </p>
                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href={applyHref}
                                        className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Apply Now
                                    </Link>
                                    <Link
                                        href="/faq"
                                        className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-indigo-100 bg-white/70 text-xs md:text-sm text-indigo-800 font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                    >
                                        Visit our FAQ
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-md">
                                <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-white/60 p-6 md:p-7 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
                                            Powered by GlobalSadaqah
                                        </p>
                                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                            2026 Cohort
                                        </span>
                                    </div>
                                    <p className="text-[15px] text-slate-700">
                                        Three tracks, fifteen winners, one shared mission: scale meaningful, faith-driven impact.
                                    </p>
                                    <div className="grid grid-cols-3 gap-3 text-center text-[15px]">
                                        <div className="rounded-xl bg-indigo-50/80 px-3 py-3">
                                            <div className="text-lg font-extrabold text-indigo-800">3</div>
                                            <div className="mt-1 text-sm font-medium text-indigo-700">
                                                Impact tracks
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-indigo-50/80 px-3 py-3">
                                            <div className="text-lg font-extrabold text-indigo-800">15</div>
                                            <div className="mt-1 text-sm font-medium text-indigo-700">
                                                Prize winners
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-indigo-50/80 px-3 py-3">
                                            <div className="text-lg font-extrabold text-indigo-800">$75k</div>
                                            <div className="mt-1 text-sm font-medium text-indigo-700">
                                                Total grants
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20 bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-10 md:grid-cols-2 items-start">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 mb-3">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    <span className="tracking-[0.18em] uppercase">
                                        Who should apply
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-4">
                                    Who Should Apply?
                                </h2>
                                <p className="text-slate-700 text-sm md:text-base mb-6 max-w-xl">
                                    Ma’a Prize is designed for mission-driven builders and movers using technology and impactful models to uplift the Ummah. Whether you have a long track record or are just starting out, we want to support your good work.
                                </p>
                                <div className="space-y-2 text-slate-700 text-sm md:text-base mb-4">
                                    <p>
                                        <span className="font-semibold">Any Stage:</span>{' '}
                                        We welcome small, early-stage or established applicants. Impact is what matters most.
                                    </p>
                                    <p>
                                        <span className="font-semibold">Any Country:</span>{' '}
                                        This is a global call for applications.
                                    </p>
                                    <p>
                                        <span className="font-semibold">Entities Only:</span>{' '}
                                        Open to registered organizations and project groups.{' '}
                                        <span className="italic text-amber-700 font-medium">
                                            We do not accept applications from individuals.
                                        </span>
                                    </p>
                                </div>
                                <div className="inline-flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white/80 border border-indigo-100 text-[11px] font-semibold text-indigo-700">
                                        Early-stage teams
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white/80 border border-indigo-100 text-[11px] font-semibold text-indigo-700">
                                        Growth-stage projects
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white/90 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/60 p-5 md:p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                                        ✓
                                    </div>
                                    <p className="text-sm font-semibold text-indigo-900">
                                        You’re a good fit if you are:
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                                            01
                                        </div>
                                        <p className="text-sm md:text-base text-slate-700">
                                            Tech Startups creating scalable impact for the Ummah.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                                            02
                                        </div>
                                        <p className="text-sm md:text-base text-slate-700">
                                            Impact-focused organizations addressing real social or spiritual needs.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                                            03
                                        </div>
                                        <p className="text-sm md:text-base text-slate-700">
                                            Projects serving overlooked or forgotten causes within the Ummah.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                                            04
                                        </div>
                                        <p className="text-sm md:text-base text-slate-700">
                                            Innovators with proven or emerging solutions ready to scale impact.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>



                <section className="py-10 md:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    <span className="tracking-[0.18em] uppercase">
                                        Prize structure
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-indigo-900">
                                    The three tracks of impact
                                </h2>
                                <p className="text-slate-600">
                                    We are rewarding excellence across three categories of meaningful work. Which one are you?
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-indigo-800">
                                <span className="rounded-full bg-indigo-50 px-3 py-1">
                                    For-profit
                                </span>
                                <span className="rounded-full bg-indigo-50 px-3 py-1">
                                    Non-profit
                                </span>
                                <span className="rounded-full bg-indigo-50 px-3 py-1">
                                    Ibadah
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex items-center justify-between text-xs font-semibold text-indigo-700">
                                    <span className="rounded-full bg-white/70 px-2.5 py-1">
                                        Track 01
                                    </span>
                                    <span className="text-[11px] uppercase tracking-[0.18em] text-indigo-500">
                                        For-profit
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-indigo-900">
                                    For-Profit
                                </h3>
                                <p className="text-xs font-semibold text-indigo-700 mt-1">
                                    Ethical startup
                                </p>
                                <p className="text-sm text-slate-700 mt-2 mb-6">
                                    Startups balancing profit with social purpose and delivering sustainable impact.
                                </p>
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-amber-100">
                                    <span className="text-base">🏆</span>
                                    <span>5 winners of $5,000</span>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex items-center justify-between text-xs font-semibold text-indigo-700">
                                    <span className="rounded-full bg-white/70 px-2.5 py-1">
                                        Track 02
                                    </span>
                                    <span className="text-[11px] uppercase tracking-[0.18em] text-indigo-500">
                                        Non-profit
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-indigo-900">
                                    Non-Profit Organisation
                                </h3>
                                <p className="text-xs font-semibold text-indigo-700 mt-1">
                                    Pure service
                                </p>
                                <p className="text-sm text-slate-700 mt-2 mb-6">
                                    Registered NGOs and charities serving the vulnerable through verified, values-driven work.
                                </p>
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-amber-100">
                                    <span className="text-base">🏆</span>
                                    <span>5 winners of $5,000</span>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex items-center justify-between text-xs font-semibold text-indigo-700">
                                    <span className="rounded-full bg-white/70 px-2.5 py-1">
                                        Track 03
                                    </span>
                                    <span className="text-[11px] uppercase tracking-[0.18em] text-indigo-500">
                                        Ibadah
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-indigo-900">
                                    Ibadah Support
                                </h3>
                                <p className="text-xs font-semibold text-indigo-700 mt-1">
                                    Spiritual innovation
                                </p>
                                <p className="text-sm text-slate-700 mt-2 mb-6">
                                    Initiatives enhancing worship, religious education, and spiritual life in creative ways.
                                </p>
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-amber-100">
                                    <span className="text-base">🏆</span>
                                    <span>5 winners of $5,000</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-indigo-50 px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                                    Total prize pool
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                    Across all three tracks, Ma&apos;a Impact Prize 2026 awards grants to 15 winning initiatives.
                                </p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl md:text-3xl font-extrabold text-amber-700">
                                    $75,000
                                </span>
                                <span className="text-xs md:text-sm font-medium text-amber-800">
                                    in impact grants
                                </span>
                            </div>
                        </div>
                    </div>
                </section>


                <section className="py-10 md:py-14 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xl md:text-2xl font-semibold text-white mb-4">
                            Ready to take your organization to the next level?
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                            <Link
                                href={applyHref}
                                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-indigo-900 text-sm font-semibold shadow-md hover:bg-indigo-50 transition-colors"
                            >
                                Start Your Impact Journey Today
                            </Link>
                            <span className="hidden sm:inline-block text-indigo-100 text-sm">
                                or
                            </span>
                            <Link
                                href="/faq"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-indigo-300 bg-indigo-800/40 text-sm font-semibold text-indigo-50 hover:bg-indigo-700 hover:border-indigo-200 transition-colors"
                            >
                                Visit our FAQ
                            </Link>
                        </div>
                        <p className="text-indigo-100 text-xs md:text-sm">
                            Get clarity on eligibility, timelines, and how Ma’a Impact works before you apply.
                        </p>
                    </div>
                </section>

                {/* <HowItWorks /> */}

                <section className="py-10 md:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    <span className="tracking-[0.18em] uppercase">
                                        The roadmap
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-indigo-900">
                                    Key dates &amp; next steps
                                </h2>
                                <p className="text-slate-700 text-sm md:text-base">
                                    Follow the key milestones from submission to final selection and announcement.
                                </p>
                            </div>
                            <div className="text-xs md:text-sm text-indigo-800">
                                <p className="font-semibold">
                                    Tip: align your launch, updates, and reminders with each date to maximise engagement.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="hidden lg:block absolute inset-x-8 top-10 h-px bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100" />
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm relative">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[11px] font-semibold text-indigo-600 uppercase">
                                            Step 1: Submissions open
                                        </p>
                                        <span className="hidden lg:inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-indigo-100 text-[11px] font-semibold text-indigo-700">
                                            01
                                        </span>
                                    </div>
                                    <p className="font-semibold text-indigo-900 text-sm">
                                        20 – 27 February 2026
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1.5">
                                        Submit your project profile and a 2-minute pitch video.
                                    </p>
                                </div>

                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[11px] font-semibold text-indigo-600 uppercase">
                                            Step 2: Voting starts
                                        </p>
                                        <span className="hidden lg:inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-indigo-100 text-[11px] font-semibold text-indigo-700">
                                            02
                                        </span>
                                    </div>
                                    <p className="font-semibold text-indigo-900 text-sm">
                                        2 – 7 March 2026
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1.5">
                                        Your profile goes live. Rally your community to vote and support your cause.
                                    </p>
                                </div>

                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[11px] font-semibold text-indigo-600 uppercase">
                                            Step 3: Final selection
                                        </p>
                                        <span className="hidden lg:inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-indigo-100 text-[11px] font-semibold text-indigo-700">
                                            03
                                        </span>
                                    </div>
                                    <p className="font-semibold text-indigo-900 text-sm">
                                        Final judging round
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1.5">
                                        The top 10 voted projects from each track move to the final judging round.
                                    </p>
                                </div>

                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[11px] font-semibold text-indigo-600 uppercase">
                                            Step 4: Winners announced
                                        </p>
                                        <span className="hidden lg:inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-indigo-100 text-[11px] font-semibold text-indigo-700">
                                            04
                                        </span>
                                    </div>
                                    <p className="font-semibold text-indigo-900 text-sm">
                                        11 March 2026 / 21 Ramadan
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1.5">
                                        15 winners are selected to receive $5,000 each.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                
                <section className="py-10 md:py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 md:mb-4">
                            We want to reward the good you do, in this world and the next
                        </h2>
                        <p className="text-indigo-100 text-sm md:text-base mb-6">
                            Submit your application before the deadline.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href={applyHref}
                                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-indigo-900 text-sm font-semibold shadow-md hover:bg-indigo-50 transition-colors"
                            >
                                Apply Now
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-10 md:py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    <span className="tracking-[0.18em] uppercase">
                                        Top organizations
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-indigo-900">
                                    See the leaders in each track
                                </h2>
                                <p className="text-slate-700 text-sm md:text-base max-w-2xl">
                                    Browse the highest-voted organizations across the For-Profit, Non-Profit, and Ibadah tracks.
                                </p>
                            </div>
                        </div>

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
                                                            className={`font-bold w-8 text-lg mr-2 ${index === 0
                                                                ? 'text-yellow-500'
                                                                : index === 1
                                                                    ? 'text-gray-400'
                                                                    : index === 2
                                                                        ? 'text-amber-600'
                                                                        : 'text-indigo-300'
                                                                }`}
                                                        >
                                                            #{String(index + 1).padStart(2, '0')}
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
                </section>

                {/* <HeroSection profiles={profiles} /> */}


                <JudgesSection judges={judges} loading={loadingJudges} />

                <PartnersSection partners={partners} loading={loadingPartners} />
            </main>
        </div>
    );
}
