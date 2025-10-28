const express = require('express');
const supabase = require('./database');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ENDPOINTS 

// Endpoint POST para registrar médicos
app.post('/registrar_medico', async (req, res) => {
    const { 
        nombre_completo, 
        correo, 
        contrasena, 
        rol, 
        fecha_nac, 
        teléfono,
        especialidad, 
        matricula_profesional,
        departamento,
        carnet_profesional, 
    } = req.body;

    if (!nombre_completo || !correo || !contrasena || !rol || !fecha_nac || !teléfono || !especialidad || !matricula_profesional || !departamento || !carnet_profesional) {
        return res.status(400).json({ error: "Todos los campos deben ser llenados" });
    }

    try {

        // Primero buscar la equivalencia de la especialidad
        const { data: especialidadData, error: especialidadError } = await supabase
            .from("especialidad")
            .select("id_especialidad")
            .eq("nombre", especialidad)
            .single();
        
        if (especialidadError) throw especialidadError;
        if (!especialidadData) {
            return res.status(404).json({ error: `Especialidad ${especialidad} no encontrada` });
        }

        const id_especialidad = especialidadData.id_especialidad;

        // Luego hasheo

        const saltRounds = 10;
        const hashed_contrasena = await bcrypt.hash(contrasena, saltRounds);

        const { data: usuarioData, error: usuarioError } = await supabase
            .from("usuario")
            .insert([
                {
                    nombre_completo,
                    correo,
                    contrasena: hashed_contrasena,
                    rol,
                    fecha_nac,
                    teléfono
                },
            ]).select();

            if (usuarioError) throw usuarioError;

            const usuario = usuarioData[0];

            const { data: medicoData, error: medicoError } = await supabase
                .from("medico")
                .insert([
                    {
                        id_usuario: usuario.id_usuario,
                        id_especialidad: id_especialidad,
                        matricula_profesional,
                        departamento,
                        carnet_profesional,
                    },
                ]).select();

            if (medicoError) throw medicoError;
            const medico = medicoData[0];

            delete usuario.contrasena;

            res.status(200).json({ 
                message: "Usuario y médico registrados correctamente",
                usuario,
                medico 
            });
    } catch (error) {
        console.error("Error al insertar datos: ", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});