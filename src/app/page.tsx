import Link from 'next/link';

export default function Home() {
  return (
    <main className="container fade-in">
      <header className="app-header slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="heading-1" style={{ color: 'var(--primary)' }}>PetConnect</h1>
        <p className="text-body mt-2">Tu red vecinal de mascotas.</p>
      </header>

      <section className="flex-col gap-lg slide-up" style={{ animationDelay: '0.2s', flexGrow: 1, justifyContent: 'center' }}>
        <div className="glass-card flex-col gap-md text-center">
          <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🐕</div>
          <h2 className="heading-2">¿Listo para proteger a tu mejor amigo?</h2>
          <p className="text-body" style={{ fontSize: '1.1rem' }}>
            Únete a la primera red vecinal proactiva. Si tu mascota se pierde, tus vecinos la encontrarán en minutos.
          </p>
        </div>
      </section>

      <footer className="slide-up flex-col gap-md" style={{ animationDelay: '0.3s', paddingBottom: '32px' }}>
        <Link href="/register" className="btn-primary">
          Registrar Mascota Gratis
        </Link>
        <Link href="/login" className="btn-secondary">
          Ya tengo cuenta
        </Link>
        <p className="text-small" style={{ textAlign: 'center', marginTop: '16px', opacity: 0.8 }}>
          Una vez registrado, tendrás acceso al botón SOS 🚨 para alertas comunitarias inmediatas.
        </p>
      </footer>
    </main>
  );
}
