'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Dữ liệu form mặc định
  const [formData, setFormData] = useState({
    recipientTarget: 'dat.test@gmail.com',
    channel: 'EMAIL',
    priority: 'HIGH',
    templateKey: 'WELCOME_OTP',
    name: 'Phát Đạt',
    otp: '889900',
    delaySeconds: 0,
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: `req_${Date.now()}`, // Tự sinh key mới mỗi lần bấm
          sourceService: 'web-dashboard',
          recipientTarget: formData.recipientTarget,
          channel: formData.channel,
          priority: formData.priority,
          templateKey: formData.templateKey,
          templateData: {
            name: formData.name,
            otp: formData.otp,
          },
          delaySeconds: Number(formData.delaySeconds),
        }),
      });

      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-bold text-white mb-1">🚀 Notification Gateway</h1>
        <p className="text-sm text-neutral-400 mb-6">Bảng điều khiển gửi thông báo bất đồng bộ</p>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Kênh gửi (Channel)</label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-white"
            >
              <option value="EMAIL">EMAIL (Resend)</option>
              <option value="SMS">SMS (Twilio)</option>
              <option value="PUSH">PUSH (Firebase)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Người nhận (Target)</label>
            <input
              type="text"
              value={formData.recipientTarget}
              onChange={(e) => setFormData({ ...formData, recipientTarget: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Tên người dùng</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Mã OTP</label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Hẹn giờ gửi (Giây - 0 là gửi ngay)</label>
            <input
              type="number"
              value={formData.delaySeconds}
              onChange={(e) => setFormData({ ...formData, delaySeconds: Number(e.target.value) })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-neutral-200 transition disabled:opacity-50 mt-2"
          >
            {loading ? '⏳ Đang đẩy vào hàng đợi...' : 'Phát lệnh gửi tin (Dispatch Job)'}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-neutral-950 border border-neutral-800 rounded-lg overflow-x-auto">
            <div className="text-xs font-mono text-neutral-400 mb-1">Phản hồi từ Gateway:</div>
            <pre className="text-xs text-green-400">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}