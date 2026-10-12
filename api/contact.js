// Simple in-memory storage (no database needed)
let latestContact = {
    name: "Waiting for input...",
    phone: "",
    action: "stop"
};

export default function handler(req, res) {
    // Allow your frontend and shortcuts to talk to it
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // If your phone shortcut sends data (via POST or URL parameters)
    if (req.method === 'POST' || req.query.name || req.query.phone) {
        const data = req.method === 'POST' ? req.body : req.query;
        
        latestContact = {
            name: data.name || latestContact.name,
            phone: data.phone || latestContact.phone,
            action: data.action || latestContact.action,
            timestamp: Date.now()
        };
        
        return res.status(200).json({ success: true, contact: latestContact });
    }

    // Default: Send the latest contact to your website dashboard
    return res.status(200).json(latestContact);
}
