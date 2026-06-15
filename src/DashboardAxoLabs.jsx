import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, Edit2, TrendingUp, Target, CheckCircle, ChevronUp } from 'lucide-react';

export default function DashboardAxoLabs() {
  const [prospects, setProspects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // El contador de mensajes se queda local por velocidad diaria
  const [messagesSent, setMessagesSent] = useState(() => {
    const savedMessages = localStorage.getItem('axo_messages');
    return savedMessages ? parseInt(savedMessages, 10) : 0;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    niche: '',
    phone: '',
    budget: '',
    phase: 'Contactados / Frío',
    hasCall: false,
    isPaid: false,
    notes: ''
  });

  // Cargar prospectos desde Neon DB al iniciar
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const token = localStorage.getItem('axo_token');
        const response = await fetch('/api/prospects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Mapeamos los booleanos por si Postgres los devuelve diferentes
          const formattedData = data.map(p => ({
            ...p,
            hasCall: p.has_call,
            isPaid: p.is_paid
          }));
          setProspects(formattedData);
        }
      } catch (error) {
        console.error("Error cargando la base de datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProspects();
  }, []);

  // Guardar mensajes localmente
  useEffect(() => {
    localStorage.setItem('axo_messages', messagesSent.toString());
  }, [messagesSent]);

  const totalAccumulated = prospects
    .filter(p => p.phase === 'Cerrados / Facturados' && p.isPaid)
    .reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  const GOAL = 100000;
  const progressPercentage = Math.min((totalAccumulated / GOAL) * 100, 100);
  const conversionRate = messagesSent > 0 
    ? ((prospects.filter(p => p.phase === 'Cerrados / Facturados').length / messagesSent) * 100).toFixed(1) 
    : 0;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('axo_token');

    // Adaptamos los nombres para Postgres (snake_case)
    const dbPayload = {
      ...formData,
      has_call: formData.hasCall,
      is_paid: formData.isPaid
    };

    try {
      if (formData.id) {
        // En un futuro puedes agregar el endpoint PUT para editar en la DB
        // Por ahora, actualizamos la vista local
        setProspects(prospects.map(p => p.id === formData.id ? formData : p));
      } else {
        // Guardar nuevo prospecto en Neon DB
        const response = await fetch('/api/prospects', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dbPayload)
        });

        if (response.ok) {
          const savedProspect = await response.json();
          // Lo agregamos a la pantalla usando el ID real de la base de datos
          setProspects([{
            ...savedProspect,
            hasCall: savedProspect.has_call,
            isPaid: savedProspect.is_paid
          }, ...prospects]);
        }
      }
      
      setFormData({ id: '', name: '', niche: '', phone: '', budget: '', phase: 'Contactados / Frío', hasCall: false, isPaid: false, notes: '' });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  const deleteProspect = (id) => {
    // Pendiente: Endpoint DELETE en la API
    setProspects(prospects.filter(p => p.id !== id));
  };

  const editProspect = (prospect) => {
    setFormData(prospect);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePaidStatus = (id) => {
    // Pendiente: Endpoint PUT en la API
    setProspects(prospects.map(p => p.id === id ? { ...p, isPaid: !p.isPaid } : p));
  };

  const updatePhase = (id, newPhase) => {
    // Pendiente: Endpoint PUT en la API
    setProspects(prospects.map(p => p.id === id ? { ...p, phase: newPhase } : p));
  };

  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "La disciplina de hoy es la infraestructura del éxito de mañana.";
    if (progressPercentage < 25) return "El primer paso requiere la mayor energía. Mantén el rigor técnico.";
    if (progressPercentage < 50) return "Ejecución perfecta. El sistema está demostrando su rendimiento.";
    if (progressPercentage < 75) return "La meta es inminente. Acelera el ritmo sin perder la estética.";
    if (progressPercentage < 100) return "Último tramo. Cierra con la precisión de un profesional.";
    return "Meta superada. El estándar ha sido redefinido.";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-[#D4AF37] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#1A1A1A] text-[#F9F8F6] font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#1A1A1A]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}} />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center opacity-5 grayscale transition-all duration-[2000ms]"></div>
        <div className="absolute inset-0 bg-[#1A1A1A]/80"></div>
        <div className="absolute w-px h-full bg-[#F9F8F6]/5 left-[25%] hidden md:block"></div>
        <div className="absolute w-px h-full bg-[#F9F8F6]/5 left-[50%] hidden md:block"></div>
        <div className="absolute w-px h-full bg-[#F9F8F6]/5 left-[75%] hidden md:block"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-16 py-12 md:py-24">
        
        <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="w-full md:w-2/3">
            <h2 className="text-[#6C6863] text-xs uppercase tracking-[0.3em] mb-4">AXO LABS / Q3 - Q4 2026</h2>
            <div className="flex items-baseline gap-4 mb-8">
              <h1 className="font-serif text-6xl md:text-8xl leading-[0.9] tracking-tight">
                ${totalAccumulated.toLocaleString('es-MX')}
              </h1>
              <span className="text-[#6C6863] text-xl font-serif italic">MXN</span>
            </div>
            
            <div className="w-full relative mt-8">
              <div className="flex justify-between text-xs tracking-[0.2em] uppercase text-[#6C6863] mb-3">
                <span>Progreso</span>
                <span>${GOAL.toLocaleString('es-MX')}</span>
              </div>
              <div className="h-px w-full bg-[#F9F8F6]/20 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#D4AF37] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="mt-6 text-[#6C6863] font-serif italic text-lg">{getMotivationalMessage()}</p>
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div className="border-t border-[#F9F8F6]/20 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-[#6C6863] flex items-center gap-2">
                  <Target size={14} className="text-[#D4AF37]" />
                  Mensajes (Semana)
                </span>
                <span className="font-serif text-2xl">{messagesSent} / 25</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMessagesSent(Math.max(0, messagesSent - 1))} className="flex-1 py-3 border border-[#F9F8F6]/20 hover:bg-[#F9F8F6]/10 transition-all duration-500 rounded-none text-xs uppercase tracking-[0.2em]">-</button>
                <button onClick={() => setMessagesSent(Math.min(25, messagesSent + 1))} className="flex-1 py-3 bg-[#F9F8F6]/5 hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all duration-500 rounded-none text-xs uppercase tracking-[0.2em]">+</button>
              </div>
            </div>
            <div className="border-t border-[#F9F8F6]/20 pt-6 flex justify-between items-center">
              <span className="text-xs uppercase tracking-[0.2em] text-[#6C6863] flex items-center gap-2">
                <TrendingUp size={14} />
                Conversión Est.
              </span>
              <span className="font-serif text-2xl text-[#D4AF37]">{conversionRate}%</span>
            </div>
          </div>
        </header>

        <section className="mb-24">
          <div className="border-t border-[#F9F8F6]/20 pt-8 mb-8 flex justify-between items-center cursor-pointer group" onClick={() => setIsFormOpen(!isFormOpen)}>
            <h3 className="font-serif text-3xl md:text-4xl group-hover:text-[#D4AF37] transition-colors duration-500">
              Registrar <span className="italic text-[#6C6863]">Prospecto</span>
            </h3>
            {isFormOpen ? <ChevronUp size={24} className="text-[#6C6863]" /> : <Plus size={24} className="text-[#6C6863] group-hover:text-[#D4AF37] transition-colors duration-500" />}
          </div>

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 animate-in fade-in duration-700">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#6C6863] mb-2">Nombre del Negocio</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="bg-transparent border-b border-[#F9F8F6]/20 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors duration-500 font-serif italic text-lg" placeholder="Ej. Maquinaria Industrial S.A." />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#6C6863] mb-2">Giro / Nicho</label>
                <input required name="niche" value={formData.niche} onChange={handleInputChange} className="bg-transparent border-b border-[#F9F8F6]/20 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors duration-500 text-sm" placeholder="Ej. Consultorio, Academia" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#6C6863] mb-2">Teléfono</label>
                <input required name="phone" value={formData.phone} onChange={handleInputChange} className="bg-transparent border-b border-[#F9F8F6]/20 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors duration-500 text-sm" placeholder="+52 ..." />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#6C6863] mb-2">Presupuesto ($)</label>
                <input required type="number" name="budget" value={formData.budget} onChange={handleInputChange} className="bg-transparent border-b border-[#F9F8F6]/20 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors duration-500 font-serif text-lg text-[#D4AF37]" placeholder="4000" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#6C6863] mb-2">Fase del Embudo</label>
                <select name="phase" value={formData.phase} onChange={handleInputChange} className="bg-transparent border-b border-[#F9F8F6]/20 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors duration-500 text-sm appearance-none rounded-none">
                  <option className="bg-[#1A1A1A] text-[#F9F8F6]">Contactados / Frío</option>
                  <option className="bg-[#1A1A1A] text-[#F9F8F6]">En Seguimiento / Con Interés</option>
                  <option className="bg-[#1A1A1A] text-[#F9F8F6]">Cerrados / Facturados</option>
                </select>
              </div>
              
              <div className="flex flex-col md:col-span-2 lg:col-span-3">
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#6C6863] mb-2">Notas Estratégicas</label>
                <input name="notes" value={formData.notes} onChange={handleInputChange} className="bg-transparent border-b border-[#F9F8F6]/20 py-3 focus:outline-none focus:border-[#D4AF37] transition-colors duration-500 font-serif italic text-sm" placeholder="Detalles de requerimientos, fechas clave..." />
              </div>

              <div className="flex items-center gap-8 md:col-span-2 lg:col-span-3 mt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-[#F9F8F6]/40 flex items-center justify-center group-hover:border-[#D4AF37] transition-colors duration-500">
                    {formData.hasCall && <div className="w-2 h-2 bg-[#D4AF37]"></div>}
                  </div>
                  <input type="checkbox" name="hasCall" checked={formData.hasCall} onChange={handleInputChange} className="hidden" />
                  <span className="text-xs uppercase tracking-[0.2em] text-[#6C6863] group-hover:text-[#F9F8F6] transition-colors duration-500">Llamada Agendada</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 border border-[#F9F8F6]/40 flex items-center justify-center group-hover:border-[#D4AF37] transition-colors duration-500">
                    {formData.isPaid && <div className="w-2 h-2 bg-[#D4AF37]"></div>}
                  </div>
                  <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleInputChange} className="hidden" />
                  <span className="text-xs uppercase tracking-[0.2em] text-[#6C6863] group-hover:text-[#F9F8F6] transition-colors duration-500">Anticipo Pagado</span>
                </label>

                <button type="submit" className="ml-auto bg-[#F9F8F6] text-[#1A1A1A] px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all duration-500 flex items-center gap-3">
                  {formData.id ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {['Contactados / Frío', 'En Seguimiento / Con Interés', 'Cerrados / Facturados'].map(phase => (
            <div key={phase} className="flex flex-col gap-6">
              <h4 className="border-t border-[#F9F8F6]/20 pt-6 text-xs uppercase tracking-[0.2em] text-[#F9F8F6] font-medium flex justify-between items-center">
                {phase}
                <span className="text-[#6C6863]">{prospects.filter(p => p.phase === phase).length}</span>
              </h4>
              
              <div className="flex flex-col gap-6">
                {prospects.filter(p => p.phase === phase).map(prospect => (
                  <div key={prospect.id} className="group relative border-t border-[#F9F8F6]/10 pt-6 hover:border-[#D4AF37]/50 transition-colors duration-700 bg-[#1A1A1A]/50 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="font-serif text-2xl mb-1">{prospect.name}</h5>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#6C6863]">{prospect.niche}</p>
                      </div>
                      <div className="flex gap-3 text-[#6C6863]">
                        <button onClick={() => editProspect(prospect)} className="hover:text-[#D4AF37] transition-colors duration-500"><Edit2 size={16} strokeWidth={1.5} /></button>
                        <button onClick={() => deleteProspect(prospect.id)} className="hover:text-red-500/80 transition-colors duration-500"><Trash2 size={16} strokeWidth={1.5} /></button>
                      </div>
                    </div>

                    <p className="font-serif italic text-sm text-[#EBE5DE]/80 mb-6 line-clamp-2">{prospect.notes || 'Sin notas.'}</p>

                    <div className="flex justify-between items-end border-t border-[#F9F8F6]/5 pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-[#6C6863]">Presupuesto</span>
                        <span className="font-serif text-lg text-[#D4AF37]">${parseFloat(prospect.budget).toLocaleString('es-MX')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {prospect.hasCall && <Phone size={16} className="text-[#D4AF37]" strokeWidth={1.5} />}
                        <button 
                          onClick={() => togglePaidStatus(prospect.id)}
                          className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border transition-all duration-500 ${prospect.isPaid ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-[#F9F8F6]/20 text-[#6C6863] hover:border-[#F9F8F6]/50'}`}
                        >
                          {prospect.isPaid && <CheckCircle size={12} />}
                          {prospect.isPaid ? 'Pagado' : 'Pendiente'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <select 
                        value={prospect.phase} 
                        onChange={(e) => updatePhase(prospect.id, e.target.value)}
                        className="w-full bg-transparent border border-[#F9F8F6]/10 text-[10px] uppercase tracking-[0.1em] text-[#6C6863] py-2 px-3 focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer transition-colors duration-500"
                      >
                        <option className="bg-[#1A1A1A]" value="Contactados / Frío">Mover a: Frío</option>
                        <option className="bg-[#1A1A1A]" value="En Seguimiento / Con Interés">Mover a: Seguimiento</option>
                        <option className="bg-[#1A1A1A]" value="Cerrados / Facturados">Mover a: Cerrado</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}