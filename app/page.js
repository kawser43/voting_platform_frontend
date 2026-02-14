'use client';
import Axios from '@/Helper/Axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import HeroSection from '@/components/Home/HeroSection';
import JudgesSection from '@/components/Home/JudgesSection';
import PartnersSection from '@/components/Home/PartnersSection';
import OrganizationsSection from '@/components/Home/OrganizationsSection';

export default function Home() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');
    const [judges, setJudges] = useState([]);
    const [loadingJudges, setLoadingJudges] = useState(true);
    const [partners, setPartners] = useState([]);
    const [loadingPartners, setLoadingPartners] = useState(true);

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

    useEffect(() => {
        fetchProfiles();
        fetchJudges();
        fetchPartners();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProfiles(1, search);
    };

    return (
        <div>
            <HeroSection profiles={profiles} />

            <OrganizationsSection
                profiles={profiles}
                loading={loading}
                search={search}
                setSearch={setSearch}
                handleSearch={handleSearch}
                page={page}
                lastPage={lastPage}
                fetchProfiles={fetchProfiles}
            />

            <JudgesSection judges={judges} loading={loadingJudges} />

            <PartnersSection partners={partners} loading={loadingPartners} />


        </div>
    );
}