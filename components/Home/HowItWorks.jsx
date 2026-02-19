import React from 'react'

export default function HowItWorks() {
    return (
        <>
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

        </>
    )
}
