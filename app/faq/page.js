'use client';

import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';

export default function FaqPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const { data } = await Axios.get('/faqs');
                if (data.status) {
                    setFaqs(data.data || []);
                }
            } catch (err) {
                console.error('Error fetching FAQs', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 mb-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span className="tracking-[0.18em] uppercase">
                            Help center
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-3">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
                        Find quick answers about the Ma’a Impact Prize, applications, and how the process works.
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">
                        Loading FAQs...
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                        No FAQs available yet. Please check back later.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                        {faqs.map((faq) => (
                            <details
                                key={faq.id}
                                className="group px-6 py-4"
                            >
                                <summary className="flex items-center justify-between cursor-pointer list-none">
                                    <h2 className="text-sm md:text-base font-semibold text-gray-900">
                                        {faq.question}
                                    </h2>
                                    <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-indigo-100 text-indigo-600 text-xs group-open:rotate-180 transition-transform">
                                        ↓
                                    </span>
                                </summary>
                                <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

