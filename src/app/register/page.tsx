'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const resp = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.message || 'Error al registrar usuario');
            }

            // Auto login after register
            const loginRes = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (loginRes?.error) {
                setError(loginRes.error);
            } else {
                router.push('/dashboard');
                router.refresh();
            }

        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container flex-center fade-in">
            <div className="glass-card slide-up" style={{ width: '100%' }}>
                <h1 className="heading-2 text-center" style={{ marginBottom: '24px' }}>Crear Cuenta</h1>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleRegister} className="flex-col gap-md">
                    <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            className="input-field"
                            style={{ paddingLeft: '48px' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className="input-field"
                            style={{ paddingLeft: '48px' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="password"
                            placeholder="Contraseña (mínimo 6 caracteres)"
                            className="input-field"
                            style={{ paddingLeft: '48px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn-primary mt-2" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <div className="text-center mt-2" style={{ marginTop: '24px' }}>
                    <span className="text-body">¿Ya tienes cuenta? </span>
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inicia sesión</Link>
                </div>
            </div>
        </main>
    );
}
