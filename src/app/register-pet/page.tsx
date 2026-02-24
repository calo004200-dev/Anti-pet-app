'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon, ChevronRight, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function RegisterPet() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        type: 'dog',
        breed: '',
        rescueContact: '',
        photoBase64: ''
    });

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("La imagen es muy grande (Máx 5MB)");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoBase64: reader.result as string }));
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.name) return setError("El nombre es requerido");
        if (step === 2 && !formData.rescueContact) return setError("El contacto de rescate es vital");

        setError('');
        setStep(p => p + 1);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Error al registrar mascota");

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <main className="container flex-center fade-in" style={{ padding: '40px 20px' }}>
            <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '500px' }}>

                {/* Progress bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            height: '4px',
                            flex: 1,
                            background: i <= step ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                            borderRadius: '2px',
                            transition: 'background 0.3s ease'
                        }} />
                    ))}
                </div>

                <h1 className="heading-2" style={{ marginBottom: '8px' }}>
                    {step === 1 && "Conozcamos a tu mascota"}
                    {step === 2 && "Datos de Rescate"}
                    {step === 3 && "Sube su mejor foto"}
                </h1>

                <p className="text-body" style={{ marginBottom: '32px' }}>
                    {step === 1 && "Estos datos ayudarán a tus vecinos a identificarla rápido."}
                    {step === 2 && "Si se pierde, ¿a dónde llamarán los vecinos?"}
                    {step === 3 && "Una foto clara de su cara o cuerpo completo."}
                </p>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}

                <div className="flex-col gap-lg">
                    {step === 1 && (
                        <div className="fade-in flex-col gap-md">
                            <input
                                type="text"
                                placeholder="Nombre (Ej. Max)"
                                className="input-field"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />

                            <select
                                className="input-field"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="dog">Perro 🐕</option>
                                <option value="cat">Gato 🐈</option>
                                <option value="bird">Ave 🦜</option>
                                <option value="other">Otro</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Raza o color distintivo (Opcional)"
                                className="input-field"
                                value={formData.breed}
                                onChange={e => setFormData({ ...formData, breed: e.target.value })}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="fade-in flex-col gap-md">
                            <input
                                type="tel"
                                placeholder="Teléfono (Whatsapp recomedado)"
                                className="input-field"
                                value={formData.rescueContact}
                                onChange={e => setFormData({ ...formData, rescueContact: e.target.value })}
                            />
                            <p className="text-small">
                                Este número solo se compartirá si activas la Alerta Física o Botón de Pánico.
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="fade-in flex-col gap-md flex-center">

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            {formData.photoBase64 ? (
                                <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                                    <img src={formData.photoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(4px)' }}
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ width: '100%', height: '200px', border: '2px dashed var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255, 123, 84, 0.05)', color: 'var(--primary)' }}
                                >
                                    <Camera size={48} style={{ marginBottom: '16px', opacity: 0.8 }} />
                                    <span style={{ fontWeight: 600 }}>Toca para subir foto</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Atrás
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={nextStep}
                                className="btn-primary"
                                style={{ flex: 2 }}
                            >
                                Continuar <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="btn-primary"
                                style={{ flex: 2 }}
                                disabled={loading || !formData.photoBase64}
                            >
                                {loading ? 'Guardando...' : 'Finalizar Registro'} <Check size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
