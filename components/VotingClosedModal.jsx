'use client';
import { useState, useEffect } from 'react';

const VOTING_END_DATE = process.env.NEXT_PUBLIC_VOTING_END_DATE;

export default function VotingClosedModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-slideUp">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pattern-dots"></div>
                    <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Voting Closed</h3>
                </div>

                <div className="p-8 text-center">
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                        Thank you for your participation! The voting period for the <span className="font-semibold text-indigo-600">Ma'a Impact Prize</span> has officially ended.
                    </p>
                    
                    <button
                        onClick={onClose}
                        className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
