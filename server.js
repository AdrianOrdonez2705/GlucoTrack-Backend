const express = require('express');
const supabase = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ENDPOINTS 

// Endpoint the prueba GET de todos los usuarios
app.get('/usuarios', async (req, res) => {
    const { data, error } = await supabase.from('usuario').select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});