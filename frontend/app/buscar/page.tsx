'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BuscarMascotasPage() {
  const { rol, vetId } = useAuth();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Proteger ruta
  useEffect(() => {
    if (!rol) router.push('/');
  }, [rol, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/api/mascotas?nombre=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'X-Role': rol,
          'X-Vet-Id': vetId
        }
      });

      if (!res.ok) throw new Error('Error al buscar mascotas');

      const data = await res.json();
      setMascotas(data.mascotas || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!rol) return null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">
          Sesión: <span className="capitalize text-blue-600">{rol}</span> {rol === 'veterinario' && `(ID: ${vetId})`}
        </h2>
        <nav className="space-x-4">
          <Link href="/vacunacion" className="text-blue-600 hover:underline font-medium">Ver Vacunación Pendiente</Link>
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-800 text-sm">Salir</button>
        </nav>
      </header>

      <main className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Búsqueda de Mascotas</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar mascota por nombre..."
            className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-2 text-sm text-gray-600 font-medium">
          Mostrando {total} mascotas
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-gray-700">
                <th className="p-3 font-semibold">ID</th>
                <th className="p-3 font-semibold">Nombre</th>
                <th className="p-3 font-semibold">Especie</th>
                <th className="p-3 font-semibold">Fecha de Nacimiento</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No se encontraron mascotas</td>
                </tr>
              )}
              {mascotas.map((mascota, index) => (
                <tr key={mascota.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-3">{mascota.id}</td>
                  <td className="p-3 font-medium">{mascota.nombre}</td>
                  <td className="p-3">{mascota.especie}</td>
                  <td className="p-3">{new Date(mascota.fecha_nacimiento).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}