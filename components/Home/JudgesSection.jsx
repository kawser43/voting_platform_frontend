'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function JudgesSection({ judges, loading }) {
    if (loading || !judges || judges.length === 0) return null;

    return (
        <section className="relative py-24 bg-gradient-to-b from-white to-indigo-50/50 overflow-hidden">
            {/* Background Decorative Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-teal-100/40 blur-[100px] mix-blend-multiply"></div>
                <div className="absolute top-[20%] -right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-100/40 blur-[100px] mix-blend-multiply"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-orange-50/40 blur-[100px] mix-blend-multiply"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-900 tracking-tight mb-4">
                        Meet Our Judges
                    </h2>
                    <div className="w-20 h-1.5 bg-gradient-to-r from-indigo-500 to-teal-400 mx-auto rounded-full mb-6"></div>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                        Industry leaders and visionaries ensuring fair and expert evaluation.
                    </p>
                </div>

                <div className="judges-swiper-container relative">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 },
                        }}
                        centerInsufficientSlides={true}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        navigation
                        className="judges-swiper !pb-12"
                    >
                        {judges.map((judge) => (
                            <SwiperSlide key={judge.id}>
                                <div className="group relative bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-2 border border-indigo-50/50 h-full flex flex-col items-center">
                                    <div className="relative w-40 h-40 mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-teal-50 rounded-full transform rotate-6 scale-105 transition-transform group-hover:rotate-12"></div>
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md">
                                            {judge.profile_picture ? (
                                                <img 
                                                    src={judge.profile_picture} 
                                                    alt={judge.name} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="text-center w-full">
                                        <h3 className="text-xl font-bold text-indigo-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {judge.name}
                                        </h3>
                                        <div className="inline-block px-3 py-1 bg-indigo-50 rounded-full">
                                            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                                                {judge.designation}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decorative subtle pattern */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
