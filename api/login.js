import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const rateLimit = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { attempts: 1, resetTime: currentTime + windowMs });
  } else {
    const data = rateLimit.get(ip);
    if (currentTime > data.resetTime) {
      rateLimit.set(ip, { attempts: 1, resetTime: currentTime + windowMs });
    } else {
      data.attempts++;
      if (data.attempts > 5) {
        return res.status(429).json({ error: 'Demasiados intentos. IP bloqueada por 15 minutos.' });
      }
    }
  }

  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    // eslint-disable-next-line no-undef
    const isValid = await bcrypt.compare(password, process.env.MASTER_HASH);

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales denegadas' });
    }

    rateLimit.delete(ip);

    const token = jwt.sign(
      { role: 'admin', context: 'axo_executive' },
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en el motor de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}