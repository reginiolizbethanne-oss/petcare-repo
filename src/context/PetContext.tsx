import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAllPets, getActivePet, setActivePet as dbSetActivePet } from '@/db/pets';
import { getTodayMeals } from '@/db/meals';
import { getUpcomingReminders } from '@/db/reminders';
import { getAllWeightEntries } from '@/db/weights';
import type { Pet } from '@/db/types';

interface PetContextType {
  pets: Pet[];
  activePet: Pet | null;
  activePetId: string | null;
  setActivePetId: (id: string) => Promise<void>;
  refreshPets: () => Promise<void>;
  refreshAll: () => Promise<void>;
  todayMealsCount: number;
  pendingRemindersCount: number;
  latestWeight: number | null;
  loading: boolean;
}

const PetContext = createContext<PetContextType | null>(null);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePetState] = useState<Pet | null>(null);
  const [todayMealsCount, setTodayMealsCount] = useState<number>(0);
  const [pendingRemindersCount, setPendingRemindersCount] = useState<number>(0);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshPets = useCallback(async () => {
    try {
      const list = await getAllPets();
      setPets(list);
      const active = await getActivePet();
      setActivePetState(active);
      return active;
    } catch (err) {
      console.warn('Failed to load pets:', err);
      return null;
    }
  }, []);

  const refreshStats = useCallback(async (currentPet: Pet | null) => {
    if (!currentPet) {
      setTodayMealsCount(0);
      setPendingRemindersCount(0);
      setLatestWeight(null);
      return;
    }
    try {
      const [meals, reminders, weights] = await Promise.all([
        getTodayMeals(currentPet.id),
        getUpcomingReminders(currentPet.id, 50),
        getAllWeightEntries(currentPet.id),
      ]);
      setTodayMealsCount(meals.length);
      setPendingRemindersCount(reminders.length);
      const lastEntry = weights.length > 0 ? weights[weights.length - 1] : null;
      setLatestWeight(lastEntry ? lastEntry.weight : (currentPet.weight ?? null));
    } catch (err) {
      console.warn('Failed to refresh stats:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const active = await refreshPets();
      await refreshStats(active);
    } finally {
      setLoading(false);
    }
  }, [refreshPets, refreshStats]);

  const setActivePetId = useCallback(async (id: string) => {
    try {
      await dbSetActivePet(id);
      const active = await refreshPets();
      await refreshStats(active);
    } catch (err) {
      console.warn('Failed to set active pet:', err);
    }
  }, [refreshPets, refreshStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAll();
  }, [refreshAll]);

  return (
    <PetContext.Provider
      value={{
        pets,
        activePet,
        activePetId: activePet?.id ?? null,
        setActivePetId,
        refreshPets: async () => {
          await refreshPets();
        },
        refreshAll,
        todayMealsCount,
        pendingRemindersCount,
        latestWeight,
        loading,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet(): PetContextType {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used within PetProvider');
  return ctx;
}
