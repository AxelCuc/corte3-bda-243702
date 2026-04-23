'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
  rol: string;
  vetId: string;
  setRol: (rol: string) => void;
  setVetId: (id: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<string>('');
  const [vetId, setVetId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar estado inicial desde localStorage para persistencia
  useEffect(() => {
    const savedRol = localStorage.getItem('vet_rol');
    const savedVetId = localStorage.getItem('vet_id');
    if (savedRol) setRol(savedRol);
    if (savedVetId) setVetId(savedVetId);
    setIsLoaded(true);
  }, []);

  // Sincronizar cambios con localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vet_rol', rol);
      localStorage.setItem('vet_id', vetId);
    }
  }, [rol, vetId, isLoaded]);

  return (
    <AuthContext.Provider value={{ rol, vetId, setRol, setVetId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}