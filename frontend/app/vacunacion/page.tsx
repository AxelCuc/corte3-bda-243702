'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type VacunaItem = {
  mascota_id: number;
  nombre_mascota: string;
  especie: string;
  nombre_dueno: string;
  telefono_dueno: string;
  ultima_vacuna: string | null;
  dias_sin_vacuna: number;
  estado: string;
};

export default function VacunacionPage() {
  const { rol, vetId } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<VacunaItem[]>([]);
  const [source, setSource] = useState<'cache' | 'db' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rol) router.push('/');
  }, [rol, router]);

  const fetchVacunacion = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/api/vacunacion-pendiente`, {
        headers: {
          'X-Role': rol,
          'X-Vet-Id': vetId,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al obtener reporte de vacunación');
      }

      const result = await res.json();
      setData(result.data || []);
      setSource(result.source);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [rol, vetId]);

  useEffect(() => {
    if (rol) fetchVacunacion();
  }, [rol, fetchVacunacion]);

  const roleChipClass: Record<string, string> = {
    veterinario: 'role-chip-vet',
    recepcion: 'role-chip-recepcion',
    administrador: 'role-chip-administrador',
  };

  const criticalCount = data.filter((i) => i.estado === 'NUNCA VACUNADA' || i.dias_sin_vacuna > 365).length;
  const warningCount = data.filter((i) => i.estado !== 'NUNCA VACUNADA' && i.dias_sin_vacuna <= 365).length;

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
          <Link href="/buscar" className="btn btn-ghost" style={{ fontSize: '13px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Buscar Mascotas
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

      {/* Main */}
      <main className="animate-fadein">
        {/* Page header */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Vacunación Pendiente
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Mascotas que requieren vacunación urgente o nunca han sido vacunadas.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {source && (
                <span className={`badge ${source === 'cache' ? 'badge-cache' : 'badge-db'}`}>
                  {source === 'cache' ? '⚡ Caché HIT' : '🔴 Base de datos'}
                </span>
              )}
              <button
                id="btn-actualizar"
                onClick={fetchVacunacion}
                disabled={loading}
                className="btn btn-ghost"
                style={{ fontSize: '13px' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Actualizar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary stats */}
          {!loading && data.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '120px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Total</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text)' }}>{data.length}</p>
              </div>
              <div style={{ flex: '1', minWidth: '120px', background: 'var(--color-danger-dim)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Críticos</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-danger)' }}>{criticalCount}</p>
              </div>
              <div style={{ flex: '1', minWidth: '120px', background: 'var(--color-warning-dim)', border: '1px solid rgba(210,153,34,0.25)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Pendientes</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-warning)' }}>{warningCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mascota</th>
                  <th>Especie</th>
                  <th>Dueño</th>
                  <th>Teléfono</th>
                  <th>Última Vacuna</th>
                  <th style={{ textAlign: 'center' }}>Días sin Vacuna</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Consultando base de datos...
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && data.length === 0 && !error && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <p>¡Todo al día! No hay mascotas con vacunación pendiente.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && data.map((item, index) => {
                  const isNunca = item.estado === 'NUNCA VACUNADA';
                  const isCritical = item.dias_sin_vacuna > 365 || isNunca;
                  return (
                    <tr key={`${item.mascota_id}-${index}`} className="animate-fadein" style={{ animationDelay: `${index * 25}ms` }}>
                      <td style={{ fontWeight: '600' }}>
                        {item.nombre_mascota}
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '6px', fontFamily: 'monospace', fontWeight: '400' }}>
                          #{item.mascota_id}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '11px' }}>
                          {item.especie}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{item.nombre_dueno}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                        {item.telefono_dueno}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>
                        {item.ultima_vacuna
                          ? new Date(item.ultima_vacuna).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
                          : <span style={{ color: 'var(--color-danger)', fontWeight: '600' }}>Nunca</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '15px',
                          color: isCritical ? 'var(--color-danger)' : 'var(--color-warning)',
                        }}>
                          {item.dias_sin_vacuna === 9999 ? '∞' : item.dias_sin_vacuna}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isNunca ? 'badge-danger' : 'badge-warning'}`}>
                          {item.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}