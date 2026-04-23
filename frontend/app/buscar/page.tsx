'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mascota = {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  fecha_nacimiento?: string;
  dueno_id?: number;
};

const especieEmoji: Record<string, string> = {
  perro: '🐶',
  gato: '🐱',
  ave: '🐦',
  conejo: '🐰',
  reptil: '🦎',
};

function getEspecieEmoji(especie: string) {
  return especieEmoji[(especie || '').toLowerCase()] || '🐾';
}

export default function BuscarMascotasPage() {
  const { rol, vetId } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');

  // Proteger ruta
  useEffect(() => {
    if (!rol) router.push('/');
  }, [rol, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApiError('');
    setSearched(true);

    try {
      const res = await fetch(
        `http://localhost:3001/api/mascotas?nombre=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'X-Role': rol,
            'X-Vet-Id': vetId,
          },
        }
      );

      const data = await res.json();

      if (data.error) setApiError(data.error);

      setMascotas(data.mascotas || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError('No se pudo conectar con la API. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const roleChipClass: Record<string, string> = {
    veterinario: 'role-chip-vet',
    recepcion: 'role-chip-recepcion',
    administrador: 'role-chip-administrador',
  };

  if (!rol) return null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="site-header">
        <div className="site-header-brand">
          <span style={{ fontSize: '22px' }}>🐾</span>
          <div>
            <h2>Clínica Veterinaria</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className={`role-chip ${roleChipClass[rol] || ''}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                {rol}{rol === 'veterinario' && vetId ? ` · ID ${vetId}` : ''}
              </span>
            </div>
          </div>
        </div>
        <nav className="site-header-nav">
          <Link href="/vacunacion" className="btn btn-ghost" style={{ fontSize: '13px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
            Vacunación Pendiente
          </Link>
          <button
            id="btn-salir"
            onClick={() => {
              localStorage.clear();
              router.push('/');
            }}
            className="btn btn-ghost"
            style={{ fontSize: '13px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="card animate-fadein">
        {/* Page title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Búsqueda de Mascotas
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Busca pacientes por nombre. Los resultados se filtran según tu rol de acceso.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            id="input-buscar"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar mascota por nombre... (vacío = todas)"
            className="input"
            style={{ flex: 1 }}
          />
          <button
            id="btn-buscar"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Buscando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Buscar
              </>
            )}
          </button>
        </form>

        {/* Connection error */}
        {error && (
          <div className="alert alert-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* DB / RLS error (non-fatal) */}
        {apiError && (
          <div className="alert alert-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            <span><strong>Error de BD:</strong> {apiError}</span>
          </div>
        )}

        {/* Stats bar */}
        {searched && !loading && (
          <div
            className="animate-fadein"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>{total}</strong> mascota{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
              {searchTerm && <> para &ldquo;<em style={{ color: 'var(--color-text)' }}>{searchTerm}</em>&rdquo;</>}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Mascota</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Fecha de Nacimiento</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Consultando base de datos...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && searched && mascotas.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p>No se encontraron mascotas{searchTerm ? ` con el nombre "${searchTerm}"` : ''}</p>
                      {rol === 'veterinario' && (
                        <p style={{ fontSize: '12px', marginTop: '2px' }}>
                          Solo puedes ver mascotas que tienes asignadas (RLS activo)
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !searched && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p>Realiza una búsqueda para ver los resultados</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && mascotas.map((mascota, index) => (
                <tr key={mascota.id} className="animate-fadein" style={{ animationDelay: `${index * 30}ms` }}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                      #{mascota.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    <span style={{ marginRight: '6px' }}>{getEspecieEmoji(mascota.especie)}</span>
                    {mascota.nombre}
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '11px' }}>
                      {mascota.especie}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {mascota.raza || '—'}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {mascota.fecha_nacimiento
                      ? new Date(mascota.fecha_nacimiento).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}