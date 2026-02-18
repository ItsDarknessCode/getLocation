export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'فقط POST مجاز است' });
  }

  try {
    const { lat, lng, accuracy, time, ua } = req.body;

    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error('تنظیمات تلگرام انجام نشده');
    }

    const message = `
📍 موقعیت جدید:
Lat: ${lat || '?'}
Lng: ${lng || '?'}
دقت تقریبی: ${accuracy ? accuracy + ' متر' : '?'}
زمان: ${time || '?'}
مرورگر/دستگاه: ${ua || 'نامشخص'}
    `.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`تلگرام خطا داد: ${errorText}`);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطای سرور' });
  }
}