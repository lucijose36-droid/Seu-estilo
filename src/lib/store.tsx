"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  EstiloData,
  LookSuggestion,
  OcasiaoData,
  PerfilUsuario,
  SavedLook,
  WardrobeItem,
} from "./types";
import { generateLooks, type AnaliseFoto, analisarFoto } from "./mockEngine";

const STORAGE_KEY = "seu-estilo:v1";

interface PersistedState {
  fotoUsuario: string | null;
  analiseFoto: AnaliseFoto | null;
  ocasiao: OcasiaoData | null;
  estilo: EstiloData | null;
  currentLooks: LookSuggestion[];
  savedLooks: SavedLook[];
  wardrobeItems: WardrobeItem[];
  perfil: PerfilUsuario;
  onboardingConcluido: boolean;
}

const DEFAULT_STATE: PersistedState = {
  fotoUsuario: null,
  analiseFoto: null,
  ocasiao: null,
  estilo: null,
  currentLooks: [],
  savedLooks: [],
  wardrobeItems: [],
  perfil: { nome: "", preferenciasEstilo: [] },
  onboardingConcluido: false,
};

interface AppContextValue extends PersistedState {
  hydrated: boolean;
  setFotoUsuario: (foto: string | null) => void;
  setOcasiao: (o: OcasiaoData) => void;
  setEstilo: (e: EstiloData) => void;
  gerarLooks: (nonce?: number) => LookSuggestion[];
  salvarLook: (look: LookSuggestion, contexto: string) => void;
  removerLookSalvo: (id: string) => void;
  isLookSalvo: (id: string) => boolean;
  addWardrobeItem: (item: WardrobeItem) => void;
  removeWardrobeItem: (id: string) => void;
  excluirFoto: () => void;
  atualizarPerfil: (p: Partial<PerfilUsuario>) => void;
  marcarOnboardingConcluido: () => void;
  resetFluxo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação única a partir do localStorage no mount
        setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      }
    } catch {
      // ignora leitura corrompida e segue com o estado padrão
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // armazenamento indisponível (ex: modo privado) — segue apenas em memória
    }
  }, [state, hydrated]);

  const setFotoUsuario = useCallback((foto: string | null) => {
    setState((s) => ({
      ...s,
      fotoUsuario: foto,
      analiseFoto: foto ? analisarFoto(foto) : null,
    }));
  }, []);

  const setOcasiao = useCallback((o: OcasiaoData) => {
    setState((s) => ({ ...s, ocasiao: o }));
  }, []);

  const setEstilo = useCallback((e: EstiloData) => {
    setState((s) => ({ ...s, estilo: e }));
  }, []);

  const gerarLooks = useCallback(
    (nonce = 0) => {
      let looks: LookSuggestion[] = [];
      setState((s) => {
        if (!s.ocasiao || !s.estilo) return s;
        looks = generateLooks(s.ocasiao, s.estilo, nonce);
        return { ...s, currentLooks: looks };
      });
      return looks;
    },
    [],
  );

  const salvarLook = useCallback((look: LookSuggestion, contexto: string) => {
    setState((s) => {
      if (s.savedLooks.some((l) => l.id === look.id)) return s;
      const saved: SavedLook = { ...look, savedAt: Date.now(), contexto };
      return { ...s, savedLooks: [saved, ...s.savedLooks] };
    });
  }, []);

  const removerLookSalvo = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      savedLooks: s.savedLooks.filter((l) => l.id !== id),
    }));
  }, []);

  const isLookSalvo = useCallback(
    (id: string) => state.savedLooks.some((l) => l.id === id),
    [state.savedLooks],
  );

  const addWardrobeItem = useCallback((item: WardrobeItem) => {
    setState((s) => ({ ...s, wardrobeItems: [item, ...s.wardrobeItems] }));
  }, []);

  const removeWardrobeItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      wardrobeItems: s.wardrobeItems.filter((i) => i.id !== id),
    }));
  }, []);

  const excluirFoto = useCallback(() => {
    setState((s) => ({ ...s, fotoUsuario: null, analiseFoto: null }));
  }, []);

  const atualizarPerfil = useCallback((p: Partial<PerfilUsuario>) => {
    setState((s) => ({ ...s, perfil: { ...s.perfil, ...p } }));
  }, []);

  const marcarOnboardingConcluido = useCallback(() => {
    setState((s) => ({ ...s, onboardingConcluido: true }));
  }, []);

  const resetFluxo = useCallback(() => {
    setState((s) => ({
      ...s,
      fotoUsuario: null,
      analiseFoto: null,
      ocasiao: null,
      estilo: null,
      currentLooks: [],
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      setFotoUsuario,
      setOcasiao,
      setEstilo,
      gerarLooks,
      salvarLook,
      removerLookSalvo,
      isLookSalvo,
      addWardrobeItem,
      removeWardrobeItem,
      excluirFoto,
      atualizarPerfil,
      marcarOnboardingConcluido,
      resetFluxo,
    }),
    [
      state,
      hydrated,
      setFotoUsuario,
      setOcasiao,
      setEstilo,
      gerarLooks,
      salvarLook,
      removerLookSalvo,
      isLookSalvo,
      addWardrobeItem,
      removeWardrobeItem,
      excluirFoto,
      atualizarPerfil,
      marcarOnboardingConcluido,
      resetFluxo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
