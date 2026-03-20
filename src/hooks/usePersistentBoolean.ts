import { useEffect, useState } from 'react';

export function usePersistentBoolean(key: string, defaultValue = false) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === 'true' : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value.toString());
  }, [key, value]);

  return [value, setValue] as const;
}
