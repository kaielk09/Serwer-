const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// === USTAWIENIA SKLEPU ===
const TOSTHOST_API_KEY = 'TUTAJ_WKLEJ_SWÓJ_KLUCZ_API_Z_TOSTHOST';
const LINK_DO_PLUGINU = 'TUTAJ_WKLEJ_LINK_DO_PLIKU_JAR_Z_KROKU_1';
const CENA_PLUGINU = 19.99; // Kwota w PLN
// =========================

// Endpoint 1: Tworzenie bezpiecznej transakcji w TostHost
app.post('/api/create-payment', async (req, res) => {
    try {
        const response = await axios.post('https://tosthost.pl', {
            amount: CENA_PLUGINU,
            description: "Zakup automatyczny pluginu",
            redirect_url: "https://vercel.app" // Tutaj wkleisz swój link ze sklepu Vercel
        }, {
            headers: { 'Authorization': `Bearer ${TOSTHOST_API_KEY}` }
        });

        res.json({ payment_url: response.data.paymentUrl, payment_id: response.data.id });
    } catch (error) {
        res.status(500).json({ error: "Błąd komunikacji z systemem płatności TostHost." });
    }
});

// Endpoint 2: Automatyczna weryfikacja płatności
app.get('/api/check-payment/:id', async (req, res) => {
    const paymentId = req.params.id;
    try {
        const response = await axios.get(`https://tosthost.pl{paymentId}`, {
            headers: { 'Authorization': `Bearer ${TOSTHOST_API_KEY}` }
        });

        // Jeśli TostHost potwierdzi zaksięgowanie wpłaty, serwer wydaje link do pobrania
        if (response.data.status === 'paid' || response.data.status === 'success') {
            return res.json({ status: 'paid', download_url: LINK_DO_PLUGINU });
        } else {
            return res.json({ status: 'pending' });
        }
    } catch (error) {
        res.status(500).json({ error: "Nie udało się pobrać statusu transakcji." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend sklepu TostHost działa na porcie ${PORT}`));
