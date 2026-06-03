import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const BASE_Z = 60;
const Z_STEP = 10;
const MAX_Z = 180;

type ModalStackContextValue = {
  stackVersion: number;
  register: (id: string) => void;
  unregister: (id: string) => void;
  activate: (id: string) => void;
  getZIndex: (id: string) => number;
};

const ModalStackContext = createContext<ModalStackContextValue | null>(null);

export const ModalStackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stackRef = useRef<string[]>([]);
  const zMapRef = useRef(new Map<string, number>());
  const counterRef = useRef(BASE_Z - Z_STEP);
  const [stackVersion, setStackVersion] = useState(0);

  const bump = useCallback(() => setStackVersion((v) => v + 1), []);

  const assignTopZ = useCallback((id: string) => {
    counterRef.current = Math.min(counterRef.current + Z_STEP, MAX_Z);
    zMapRef.current.set(id, counterRef.current);
  }, []);

  const register = useCallback(
    (id: string) => {
      if (zMapRef.current.has(id)) return;
      stackRef.current.push(id);
      assignTopZ(id);
      bump();
    },
    [assignTopZ, bump],
  );

  const unregister = useCallback((id: string) => {
    if (!zMapRef.current.has(id)) return;
    stackRef.current = stackRef.current.filter((entry) => entry !== id);
    zMapRef.current.delete(id);
    // No bump: other modals keep the same z-index values.
  }, []);

  const activate = useCallback(
    (id: string) => {
      if (!zMapRef.current.has(id)) return;
      const previousZ = zMapRef.current.get(id);
      stackRef.current = stackRef.current.filter((entry) => entry !== id);
      stackRef.current.push(id);
      assignTopZ(id);
      if (zMapRef.current.get(id) !== previousZ) {
        bump();
      }
    },
    [assignTopZ, bump],
  );

  const getZIndex = useCallback((id: string) => zMapRef.current.get(id) ?? BASE_Z, []);

  const value = useMemo(
    () => ({ stackVersion, register, unregister, activate, getZIndex }),
    [stackVersion, register, unregister, activate, getZIndex],
  );

  return <ModalStackContext.Provider value={value}>{children}</ModalStackContext.Provider>;
};

export function useModalStackLayer(isOpen: boolean) {
  const id = useId();
  const ctx = useContext(ModalStackContext);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const stackVersion = ctx?.stackVersion ?? 0;

  const [zIndex, setZIndex] = useState(BASE_Z);

  // Register only when open/closed toggles — never re-run on stackVersion changes.
  useLayoutEffect(() => {
    if (!isOpen) return;

    const api = ctxRef.current;
    if (!api) {
      setZIndex(BASE_Z);
      return;
    }

    api.register(id);
    setZIndex(api.getZIndex(id));

    return () => api.unregister(id);
  }, [isOpen, id]);

  // Re-read z-index when another modal joins or moves to front.
  useLayoutEffect(() => {
    if (!isOpen || !ctxRef.current) return;
    const next = ctxRef.current.getZIndex(id);
    setZIndex((current) => (current === next ? current : next));
  }, [stackVersion, isOpen, id]);

  const activate = useCallback(() => {
    if (!isOpen) return;
    const api = ctxRef.current;
    if (!api) return;
    api.activate(id);
    setZIndex(api.getZIndex(id));
  }, [isOpen, id]);

  const layerProps = {
    style: { zIndex } as React.CSSProperties,
    onPointerDown: activate,
  };

  return { zIndex, activate, layerProps };
}
