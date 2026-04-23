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

    // Guardar en el contexto global
    setRol(localRol);
    setVetId(localRol === 'veterinario' ? localVetId : '');
    
    // Redirigir
    router.push('/buscar');
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Clínica Veterinaria <br/>
          <span className="text-sm font-normal text-gray-500">Sistema de Gestión</span>
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select 
              value={localRol} 
              onChange={(e) => setLocalRol(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Selecciona tu rol...</option>
              <option value="veterinario">Veterinario</option>
              <option value="recepcion">Recepción</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          {localRol === 'veterinario' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID del Veterinario</label>
              <input 
                type="number" 
                value={localVetId}
                onChange={(e) => setLocalVetId(e.target.value)}
                placeholder="Ej: 1"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Ingresar al sistema
          </button>
        </form>
      </div>
    </main>
  );
}