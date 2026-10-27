import { createContext, useContext, useEffect, type ReactNode } from 'react';

/**
 * 고대비 (high-contrast, dark) mode. Colors come from the Figma section "고대비 모드" (1:16286)
 * and live in src/styles/contrast.css, keyed off <html data-contrast="high">. Assets with a
 * dark export under src/assets/contrast/ are swapped in by <Asset>.
 */
type ContrastContextValue = { contrast: boolean; setContrast: (on: boolean) => void };

const ContrastContext = createContext<ContrastContextValue>({ contrast: false, setContrast: () => {} });

export function ContrastProvider({ contrast, setContrast, children }: ContrastContextValue & { children: ReactNode }) {
  useEffect(() => {
    if (contrast) document.documentElement.dataset.contrast = 'high';
    else delete document.documentElement.dataset.contrast;
  }, [contrast]);

  return <ContrastContext.Provider value={{ contrast, setContrast }}>{children}</ContrastContext.Provider>;
}

export const useContrast = () => useContext(ContrastContext);
