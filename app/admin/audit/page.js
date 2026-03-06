'use client';

import { useState, useEffect } from 'react';
import Axios from '@/Helper/Axios';

export default function AuditPage() {
    const [loading, setLoading] = useState(true);
    const [runningAudit, setRunningAudit] = useState(false);
    const [error, setError] = useState(null);
    const [report, setReport] = useState(null);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await Axios.get('admin/audit/report');
            setReport(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching audit report:', err);
            setError('Failed to fetch audit report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const runAudit = async () => {
        if (!confirm('This will scan all votes and flag suspicious activity. Continue?')) {
            return;
        }

        try {
            setRunningAudit(true);
            const response = await Axios.post('/admin/audit/run');
            alert(`Audit completed. ${response.data.suspicious_count} suspicious users flagged.`);
            fetchReport(); // Refresh data
        } catch (err) {
            console.error('Error running audit:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to run audit.';
            alert(msg);
        } finally {
            setRunningAudit(false);
        }
    };

    if (loading && !report) {
        return <div className="p-8 text-center text-gray-500">Loading audit data...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    const { summary, sample_list } = report;
    const { total_votes, suspicious_count, breakdown } = summary;
    const suspiciousPercentage = total_votes > 0 ? ((suspicious_count / total_votes) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Data Integrity Audit</h1>
                    <p className="text-sm text-gray-500 mt-1">Scan for fraudulent user accounts based on email patterns, IP clusters, and registration timestamps.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button
                        onClick={runAudit}
                        disabled={true}
                        title="Temporarily disabled due to server resource limits"
                        className="px-4 py-2 rounded-md font-medium text-white transition-colors bg-gray-400 cursor-not-allowed"
                    >
                        Audit Scan Disabled
                    </button>
                    <span className="text-xs text-red-500 font-medium">Disabled: Resource Optimization Required</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Users</span>
                    <span className="text-4xl font-bold text-gray-800">{total_votes}</span>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Suspicious Users</span>
                    <span className={`text-4xl font-bold ${suspicious_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {suspicious_count}
                    </span>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Suspicious %</span>
                    <span className="text-4xl font-bold text-orange-500">{suspiciousPercentage}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Breakdown Chart/List */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-1">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Red Flag Breakdown</h2>
                    <ul className="space-y-3">
                        {Object.entries(breakdown).map(([reason, count]) => (
                            <li key={reason} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{reason}</span>
                                <span className="font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-800">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sample List */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Flagged Entries Sample</h2>
                        <span className="text-xs text-gray-500">Showing up to 100 entries</span>
                    </div>

                    {sample_list.length === 0 ? (
                        <div className="text-center py-8 text-green-600 font-medium">
                            No suspicious entries found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason(s)</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined At</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {sample_list.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-800 font-medium">{user.voter_email}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-500 text-xs">{user.ip_address}</td>
                                            <td className="px-6 py-3 text-red-600 max-w-[200px] truncate" title={user.flag_reason}>
                                                {user.flag_reason}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-400 text-xs">{user.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
