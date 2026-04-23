'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setRol, setVetId } = useAuth();

  const [localRol, setLocalRol] = useState('');
  const [localVetId, setLocalVetId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!localRol) {
      setError('Por favor selecciona un rol.');
      return;
    }

    if (localRol === 'veterinario' && !localVetId.trim()) {
      setError('El ID del veterinario es obligatorio para este rol.');
      return;
    }

    setRol(localRol);
    setVetId(localRol === 'veterinario' ? localVetId : '');
    router.push('/buscar');
  };

  const roleInfo: Record<string, { icon: string; desc: string; chipClass: string }> = {
    veterinario: {
      icon: '🩺',
      desc: 'Acceso a mascotas asignadas y registro de vacunas',
      chipClass: 'role-chip-vet',
    },
    recepcion: {
      icon: '📋',
      desc: 'Gestión de pacientes y agenda de citas',
      chipClass: 'role-chip-recepcion',
    },
    administrador: {
      icon: '⚡',
      desc: 'Acceso total al sistema y reportes',
      chipClass: 'role-chip-administrador',
    },
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background:
            'radial-gradient(ellipse, rgba(46,160,67,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        className="card animate-fadein"
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'var(--color-accent-dim)',
              border: '1px solid rgba(46,160,67,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            🐾
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '4px' }}>
            Clínica Veterinaria
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Sistema de Gestión · Corte 3
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Rol selector */}
          <div>
            <label className="label" htmlFor="rol-select">Rol de acceso</label>
            <select
              id="rol-select"
              value={localRol}
              onChange={(e) => setLocalRol(e.target.value)}
              className="input select"
            >
              <option value="">Selecciona tu rol...</option>
              <option value="veterinario">🩺 Veterinario</option>
              <option value="recepcion">📋 Recepción</option>
              <option value="administrador">⚡ Administrador</option>
            </select>
          </div>

          {/* Role description card */}
          {localRol && (
            <div
              className="animate-fadein"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '18px' }}>{roleInfo[localRol]?.icon}</span>
              <div>
                <span className={`role-chip ${roleInfo[localRol]?.chipClass}`} style={{ marginBottom: '4px' }}>
                  {localRol}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {roleInfo[localRol]?.desc}
                </p>
              </div>
            </div>
          )}

          {/* Vet ID */}
          {localRol === 'veterinario' && (
            <div className="animate-fadein">
              <label className="label" htmlFor="vet-id">ID del Veterinario</label>
              <input
                id="vet-id"
                type="number"
                min="1"
                value={localVetId}
                onChange={(e) => setLocalVetId(e.target.value)}
                placeholder="Ej: 1"
                className="input"
              />
              <p style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '5px' }}>
                Se usará para filtrar las mascotas y citas asignadas a este veterinario.
              </p>
            </div>
          )}

          <div className="separator" style={{ margin: '4px 0' }} />

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Ingresar al sistema
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'var(--color-text-subtle)' }}>
          Base de Datos Avanzada · BDA-243702
        </p>
      </div>
    </main>
  );
}