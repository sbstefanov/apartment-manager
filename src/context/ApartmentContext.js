import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getApartments } from '../services/storage';
import { useAuth } from './AuthContext';

const ApartmentContext = createContext();

export function ApartmentProvider({ children }) {
  const [apartments, setApartments] = useState([]);
  const [currentId, setCurrentId]   = useState(() => localStorage.getItem('apt_id') || 'all');
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    if (!user) return;
    const data = await getApartments();
    setApartments(data);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  function select(id) {
    setCurrentId(id);
    localStorage.setItem('apt_id', id);
  }

  const current = apartments.find(a => a.id === currentId) ?? null;

  return (
    <ApartmentContext.Provider value={{ apartments, current, currentId, select, refresh }}>
      {children}
    </ApartmentContext.Provider>
  );
}

export function useApartment() {
  return useContext(ApartmentContext);
}
