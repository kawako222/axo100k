import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // 1. Verificamos que tengas tu pase VIP (Token JWT)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado: Falla de token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // eslint-disable-next-line no-undef
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // 2. Conectamos a Neon DB
  // eslint-disable-next-line no-undef
  const sql = neon(process.env.DATABASE_URL);

  // 3. Manejamos las peticiones
  if (req.method === 'GET') {
    try {
      const allProspects = await sql`SELECT * FROM prospects ORDER BY created_at DESC`;
      return res.status(200).json(allProspects);
    } catch (error) {
       console.log(error);
      return res.status(500).json({ error: 'Error al obtener prospectos' });
    }
  } 
  
  if (req.method === 'POST') {
    try {
      const { name, niche, phone, budget, phase, has_call, is_paid, notes } = req.body;
      
      const newProspect = await sql`
        INSERT INTO prospects (name, niche, phone, budget, phase, has_call, is_paid, notes)
        VALUES (${name}, ${niche}, ${phone}, ${budget}, ${phase}, ${has_call}, ${is_paid}, ${notes})
        RETURNING *
      `;
      
      return res.status(201).json(newProspect[0]);
    } catch (error) {
            console.log(error);

      return res.status(500).json({ error: 'Error al guardar el prospecto' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}