import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST' || (req.method === 'GET' && (req.query.name || req.query.action))) {
            const data = req.method === 'POST' ? req.body : req.query;
            const payload = {
                name: data.name || "No Name Received",
                phone: data.phone || "No Phone Received",
                action: data.action || "start",
                timestamp: Date.now()
            };
            await kv.set('latest_contact', payload);
            return res.status(200).json({ success: true, payload });
        }

        // Default GET request fetches current state for the frontend
        const current = await kv.get('latest_contact') || { name: "Waiting for input...", phone: "", action: "stop" };
        return res.status(200).json(current);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
