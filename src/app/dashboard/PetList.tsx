'use client';

import { useState } from 'react';
import { AlertTriangle, Share2, CheckCircle2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PetList({ initialPets }: { initialPets: any[] }) {
    const [pets, setPets] = useState(initialPets);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [locationPrompt, setLocationPrompt] = useState<string | null>(null);
    const [lastSeen, setLastSeen] = useState('');
    const router = useRouter();

    const toggleLostStatus = async (petId: string, currentStatus: boolean, location?: string) => {
        try {
            setLoadingId(petId);
            const res = await fetch(`/api/pets/${petId}/lost`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLost: !currentStatus, lastSeenLocation: location })
            });

            if (!res.ok) throw new Error("Error");

            const { pet: updatedPet } = await res.json();

            setPets(pets.map(p => p.id === petId ? updatedPet : p));

            if (!currentStatus) {
                // Just got lost. Trigger Share API
                shareToWhatsApp(updatedPet);
            }

            setLocationPrompt(null);
            setLastSeen('');
            router.refresh();
        } catch (err) {
            alert("Error actualizando mascota");
        } finally {
            setLoadingId(null);
        }
    };

    const shareToWhatsApp = async (pet: any) => {
        const text = `🚨 ¡Emergencia Vecinal! 🚨\nMi mascota *${pet.name}* se acaba de perder.\n\n📍 Visto por última vez en: ${pet.lastSeenLocation}\n📞 Si la ves, por favor contáctame: wa.me/${pet.rescueContact}\n\nAyúdame a compartir este mensaje.`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mascota Perdida',
                    text: text,
                });
            } catch (err) {
                console.log("Share failed", err);
            }
        } else {
            // Fallback to whatsapp link
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    return (
        <div className="flex-col gap-md">
            {pets.map(pet => (
                <div key={pet.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', border: pet.isLost ? '2px solid var(--danger)' : '1px solid rgba(0,0,0,0.1)' }}>
                    {/* Pet Header */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px', background: pet.isLost ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        {pet.photo ? (
                            <img src={pet.photo} alt={pet.name} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🐈</div>
                        )}

                        <div style={{ flex: 1 }}>
                            <div className="flex-between">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{pet.name}</h3>
                                {pet.isLost && <span style={{ background: 'var(--danger)', color: 'white', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 700, animation: 'pulse 2s infinite' }}>PERDIDO</span>}
                            </div>
                            <p className="text-small" style={{ textTransform: 'capitalize' }}>{pet.type === 'dog' ? 'Perro' : pet.type === 'cat' ? 'Gato' : pet.type}</p>
                        </div>
                    </div>

                    {/* Location Prompt Modal/Inline for Panic */}
                    {locationPrompt === pet.id && (
                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.05)' }} className="slide-up">
                            <p style={{ fontWeight: 600, marginBottom: '8px' }}>📍 ¿Dónde la viste por última vez?</p>
                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Ej. Parque Lincoln verde, esq. Virgilio"
                                    className="input-field"
                                    style={{ paddingLeft: '40px', padding: '12px 12px 12px 40px', fontSize: '1rem' }}
                                    value={lastSeen}
                                    onChange={e => setLastSeen(e.target.value)}
                                />
                            </div>
                            <div className="flex-center gap-sm">
                                <button className="btn-secondary" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => setLocationPrompt(null)}>Cancelar</button>
                                <button
                                    className="btn-danger"
                                    style={{ padding: '8px', fontSize: '0.9rem' }}
                                    disabled={!lastSeen}
                                    onClick={() => toggleLostStatus(pet.id, pet.isLost, lastSeen)}
                                >
                                    Confirmar y Alertar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SOS Action Bar */}
                    {!locationPrompt && (
                        <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '8px' }}>
                            {!pet.isLost ? (
                                <button
                                    className="btn-danger"
                                    style={{ padding: '12px', fontSize: '1rem', flex: 1 }}
                                    onClick={() => setLocationPrompt(pet.id)}
                                >
                                    <AlertTriangle size={18} /> PÁNICO: Se perdió
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '12px', fontSize: '1rem', flex: 1, background: 'var(--success)', boxShadow: 'none' }}
                                        onClick={() => toggleLostStatus(pet.id, pet.isLost)}
                                        disabled={loadingId === pet.id}
                                    >
                                        <CheckCircle2 size={18} /> Ya la encontré
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '12px', fontSize: '1rem', width: 'auto' }}
                                        onClick={() => shareToWhatsApp(pet)}
                                    >
                                        <Share2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            ))}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}} />
        </div>
    );
}
