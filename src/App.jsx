import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import DashboardAxoLabs from './DashboardAxoLabs';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Enviamos la contraseña al servidor (api/login.js)
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      // 2. Si el servidor dice que todo está bien (response.ok)
      if (response.ok && data.token) {
        localStorage.setItem('axo_token', data.token); // Guardamos el pase VIP
        setIsAnimating(true);
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 800);
      } else {
        // 3. Si la contraseña es incorrecta o hubo demasiados intentos
        setError(true);
        setPassword('');
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  if (isAuthenticated) {
    return <DashboardAxoLabs />;
  }

  return (
    <div className="min-h-screen relative bg-[#1A1A1A] flex items-center justify-center overflow-hidden selection:bg-[#D4AF37] selection:text-[#1A1A1A]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}} />

      <div className={`absolute inset-0 transition-all duration-[1500ms] ease-out ${isAnimating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/80 to-transparent"></div>
      </div>

      <div className={`relative z-10 w-full max-w-md px-8 transition-all duration-[1000ms] ${isAnimating ? 'translate-y-[-50px] opacity-0' : 'translate-y-0 opacity-100'}`}>
        
        <div className="text-center mb-12">
          <h2 className="text-[#6C6863] text-[10px] uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[#D4AF37]/50"></span>
            Acceso Restringido
            <span className="w-8 h-px bg-[#D4AF37]/50"></span>
          </h2>
          <h1 className="font-serif text-5xl text-[#F9F8F6] tracking-tight">Axo Labs</h1>
          <p className="font-serif italic text-[#6C6863] mt-2">Executive Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center text-[#6C6863] group-focus-within:text-[#D4AF37] transition-colors duration-500">
              <Lock size={16} strokeWidth={1.5} />
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la clave maestra"
              className={`w-full bg-transparent border-b py-4 pl-10 pr-4 text-[#F9F8F6] text-sm tracking-widest focus:outline-none transition-all duration-500 placeholder:text-[#6C6863]/50 placeholder:font-serif placeholder:italic placeholder:tracking-normal ${error ? 'border-red-900 text-red-500' : 'border-[#F9F8F6]/20 focus:border-[#D4AF37]'}`}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="group relative w-full border border-[#F9F8F6]/20 py-4 text-xs uppercase tracking-[0.2em] text-[#F9F8F6] overflow-hidden transition-all duration-500 hover:border-[#D4AF37]"
          >
            <div className="absolute inset-0 bg-[#D4AF37] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
            <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-[#1A1A1A] transition-colors duration-500">
              Autenticar
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
            </span>
          </button>
        </form>

        {error && (
          <p className="absolute left-0 right-0 text-center mt-6 text-red-500 font-serif italic text-sm animate-pulse">
            Credenciales denegadas.
          </p>
        )}
      </div>
    </div>
  );
}