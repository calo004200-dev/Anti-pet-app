import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import PetList from "./PetList";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return null;
    }

    // Fetch user's pets
    const myPets = await prisma.pet.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch other lost pets in the area (For MVP, just all lost pets except user's)
    const lostAreaPets = await prisma.pet.findMany({
        where: {
            isLost: true,
            ownerId: { not: session.user.id }
        },
        include: { owner: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <main className="container fade-in" style={{ padding: '24px 20px' }}>
            <header className="app-header slide-up flex-between" style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <h1 className="heading-3">Mis Mascotas</h1>
                <Link href="/register-pet" className="btn-primary" style={{ padding: '8px 16px', width: 'auto', fontSize: '0.9rem' }}>
                    <Plus size={18} /> Agregar
                </Link>
            </header>

            <section className="flex-col gap-lg slide-up" style={{ animationDelay: '0.1s', marginTop: '24px' }}>
                {myPets.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: '40px 24px' }}>
                        <p className="text-body mt-2 mb-4">Aún no registras a tu mascota.</p>
                        <Link href="/register-pet" className="btn-primary" style={{ display: 'inline-flex' }}>
                            Registrar ahora
                        </Link>
                    </div>
                ) : (
                    <PetList initialPets={myPets} />
                )}
            </section>

            {lostAreaPets.length > 0 && (
                <section className="flex-col gap-md slide-up" style={{ animationDelay: '0.2s', marginTop: '40px' }}>
                    <h2 className="heading-3" style={{ color: 'var(--danger)' }}>🚨 Alertas en tu zona</h2>
                    <div className="flex-col gap-md">
                        {lostAreaPets.map(pet => (
                            <div key={pet.id} className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    {pet.photo ? (
                                        <img src={pet.photo} alt={pet.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🐕</div>
                                    )}
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{pet.name} se perdió</h3>
                                        <p className="text-small" style={{ color: 'var(--text-main)' }}>Visto en: {pet.lastSeenLocation}</p>
                                        <p className="text-small">Dueño: <a href={`https://wa.me/${pet.rescueContact}`} target="_blank" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>{pet.owner.name}</a></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>
    );
}
