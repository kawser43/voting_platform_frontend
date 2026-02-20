'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function PartnersSection({ partners, loading }) {
    if (loading || !partners || partners.length === 0) return null;

    return (
        <section className="relative py-20 bg-white border-t border-indigo-50 overflow-hidden">
             {/* Background Decorative Shapes */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-50 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-teal-50 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-48 h-48 bg-orange-50 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                
                {/* Geometric Pattern */}
                <svg className="absolute top-0 right-0 w-64 h-64 text-gray-50 transform translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 100 100">
                    <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" />
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid-pattern)" />
                </svg>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-indigo-900 mb-2">Trusted Partners</h2>
                    <p className="text-indigo-500 font-medium">Collaborating with the best to drive innovation</p>
                </div>

                <div className="partners-swiper-container relative px-8 md:px-12">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={40}
                        slidesPerView={2}
                        breakpoints={{
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                        }}
                        centerInsufficientSlides={true}
                        autoplay={{ delay: 2500, disableOnInteraction: false }}
                        loop={true}
                        className="partners-swiper !py-4"
                    >
                        {partners.map((partner) => (
                            <SwiperSlide key={partner.id}>
                                <div className="group flex flex-col items-center justify-center p-4 transition-all duration-300">
                                    <div className="relative w-32 h-20 flex items-center justify-center transition-all duration-500 transform group-hover:scale-110">
                                        {partner.logo ? (
                                            <img 
                                                src={partner.logo} 
                                                alt={partner.name} 
                                                className="object-contain max-w-full max-h-full drop-shadow-sm group-hover:drop-shadow-md"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-300 font-bold text-xl">
                                                {partner.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="mt-4 text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors text-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                        {partner.name}
                                    </h3>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
