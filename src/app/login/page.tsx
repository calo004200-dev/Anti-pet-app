'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (res?.error) {
                setError(res.error);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container flex-center fade-in">
            <div className="glass-card slide-up" style={{ width: '100%' }}>
                <h1 className="heading-2 text-center" style={{ marginBottom: '24px' }}>Bienvenido de vuelta</h1>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleLogin} className="flex-col gap-md">
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
                            placeholder="Contraseña"
                            className="input-field"
                            style={{ paddingLeft: '48px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary mt-2" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="text-center mt-2" style={{ marginTop: '24px' }}>
                    <span className="text-body">¿No tienes cuenta? </span>
                    <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Regístrate</Link>
                </div>
            </div>
        </main>
    );
}
