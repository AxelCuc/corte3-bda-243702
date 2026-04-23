'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VacunacionPage() {
  const { rol, vetId } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [source, setSource] = useState<'cache' | 'db' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Proteger ruta
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
          'X-Vet-Id': vetId
        }
      });

      if (!res.ok) throw new Error('Error al obtener reporte de vacunación');

      const result = await res.json();
      setData(result.data || []);
      setSource(result.source);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [rol, vetId]);

  // Cargar datos al montar la página
  useEffect(() => {
    if (rol) fetchVacunacion();
  }, [rol, fetchVacunacion]);

  if (!rol) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">
          Sesión: <span className="capitalize text-blue-600">{rol}</span> {rol === 'veterinario' && `(ID: ${vetId})`}
        </h2>
        <nav className="space-x-4">
          <Link href="/buscar" className="text-blue-600 hover:underline font-medium">Búsqueda de Mascotas</Link>
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-800 text-sm">Salir</button>
        </nav>
      </header>

      <main className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reporte: Vacunación Pendiente</h1>
          
          <div className="flex items-center gap-4">
            {source && (
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${source === 'cache' ? 'bg-green-500' : 'bg-orange-500'}`}>
                {source === 'cache' ? 'CACHÉ HIT 🟢' : 'BASE DE DATOS 🔴'}
              </span>
            )}
            <button 
              onClick={fetchVacunacion}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition text-sm"
            >
              {loading ? 'Actualizando...' : 'Actualizar consulta'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-gray-700">
                <th className="p-3 font-semibold">Mascota</th>
                <th className="p-3 font-semibold">Especie</th>
                <th className="p-3 font-semibold">Dueño</th>
                <th className="p-3 font-semibold">Teléfono</th>
                <th className="p-3 font-semibold">Última Vacuna</th>
                <th className="p-3 font-semibold">Días sin Vacuna</th>
                <th className="p-3 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">No hay mascotas pendientes de vacunación</td>
                </tr>
              )}
              {data.map((item, index) => (
                <tr key={item.mascota_id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-3 font-medium">{item.nombre_mascota} (ID: {item.mascota_id})</td>
                  <td className="p-3">{item.especie}</td>
                  <td className="p-3">{item.nombre_dueno}</td>
                  <td className="p-3">{item.telefono_dueno}</td>
                  <td className="p-3">
                    {item.ultima_vacuna ? new Date(item.ultima_vacuna).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3 text-center">{item.dias_sin_vacuna === 9999 ? '∞' : item.dias_sin_vacuna}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                      item.estado === 'NUNCA VACUNADA' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.estado}
                    </span>
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