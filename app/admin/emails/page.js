'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Axios from '@/Helper/Axios';
import AlertModal from '@/components/AlertModal';
import RichTextSimple from '@/components/inputs/RichTextSimple';

export default function AdminEmailPage() {
  const { user, isLoggedIn } = useUser();
  const router = useRouter();

  const [audience, setAudience] = useState('all');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [, setContentLen] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      // Let layout handle redirect
      return;
    }
    if (user && user.role_id !== 1) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, user, router]);

  const canSend = subject.trim().length > 0 && content.trim().length > 0 && (!testMode || testEmail.trim().length > 0);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canSend || sending) return;
    setSending(true);
    try {
      const payload = {
        audience,
        subject,
        content,
        test_mode: testMode ? 1 : 0,
        ...(testMode ? { test_email: testEmail } : {}),
      };
      const { data } = await Axios.post('/admin/broadcast-email', payload);
      if (data.status) {
        setAlertState({
          open: true,
          title: 'Email Queued',
          message: testMode
            ? 'Test email has been queued for delivery.'
            : `Emails have been queued to ${audience === 'all' ? 'all users' : (audience === 'approved_profile' ? 'approved profile users' : audience)}.`,
          type: 'success',
        });
        // Keep content for reuse; optionally clear subject/content
      } else {
        setAlertState({
          open: true,
          title: 'Failed',
          message: data.message || 'Failed to send emails',
          type: 'error',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send emails';
      setAlertState({
        open: true,
        title: 'Error',
        message: msg,
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  if (!user || user.role_id !== 1) {
    return <div className="p-8 text-center">Loading Admin Panel...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Email</h1>
        <p className="text-sm text-gray-500">Broadcast an email to users.</p>
      </div>

      <form onSubmit={handleSend} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All users</option>
              <option value="submitter">Submitter</option>
              <option value="voter">Voter</option>
              <option value="approved_profile">Approved Profile Users</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Test Email</span>
            </label>
          </div>
        </div>

        {testMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test email address</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              required={testMode}
            />
            <p className="text-xs text-gray-500 mt-1">When checked, only this address receives the email.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <RichTextSimple
              value={content}
              onChange={(html, len) => {
                setContent(html);
                setContentLen(len);
              }}
              placeholder="Write your email content here..."
            />
          <p className="text-xs text-gray-500 mt-1">Basic formatting supported. Content is sent as HTML.</p>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!canSend || sending}
            className={`px-4 py-2 rounded-md font-medium text-white ${
              canSend && !sending ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {sending ? 'Sending…' : testMode ? 'Send Test Email' : 'Send Email'}
          </button>
        </div>
      </form>

      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}

