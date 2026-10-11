import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (Set FIREBASE_SERVICE_ACCOUNT in your Vercel environment variables)
if (getApps().length === 0) {
    initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}'))
    });
}

const db = getFirestore();

export default async function handler(req, res) {
    // Enable CORS for mobile shortcuts
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { name, phone, phoneNumber, action } = req.body || req.query;

        const contactName = name || 'Unknown Name';
        const contactPhone = phone || phoneNumber || 'Unknown Number';
        const contactAction = action || 'start';
        const appId = process.env.APP_ID || 'contact-peek-app-id';

        // Reference matches your frontend listener path: artifacts/{appId}/data/control_state
        const stateDocRef = db.collection('artifacts').doc(appId).collection('data').doc('control_state');

        await stateDocRef.set({
            action: contactAction,
            name: contactName,
            phoneNumber: contactPhone,
            updatedBy: 'mobile-shortcut-api',
            timestamp: Date.now()
        }, { merge: true });

        return res.status(200).json({ 
            success: true, 
            message: 'Contact received and synced successfully!',
            data: { name: contactName, phoneNumber: contactPhone, action: contactAction }
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
