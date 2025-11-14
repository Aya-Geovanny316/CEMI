import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { menu as menuConfig } from './pages';

const NursingContext = createContext(null);

const findFirstLeaf = (items) => {
  if (!Array.isArray(items)) {
    return null;
  }

  for (const item of items) {
    if (item?.children && item.children.length > 0) {
      const nested = findFirstLeaf(item.children);
      if (nested) {
        return nested;
      }
    } else if (item) {
      return item;
    }
  }

  return null;
};

const findByKey = (items, key) => {
  if (!Array.isArray(items) || !key) {
    return null;
  }

  for (const item of items) {
    if (item?.key === key) {
      return item;
    }
    if (item?.children) {
      const nested = findByKey(item.children, key);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const resolveIframeSrc = (item) => {
  if (!item) {
    return '';
  }

  if (item.iframe) {
    return item.iframe;
  }

  return '';
};

export const ContextProvider = ({ children }) => {
  const [menuItems] = useState(() => menuConfig);

  const firstItem = useMemo(() => findFirstLeaf(menuItems), [menuItems]);

  const [activeMenuKey, setActiveMenuKey] = useState(firstItem?.key ?? null);
  const [iframeSrc, setIframeSrc] = useState(() => resolveIframeSrc(firstItem));
  const [patient, setPatient] = useState(null);
  const [lastSubmission, setLastSubmission] = useState(null);

  useEffect(() => {
    const initialItem = findFirstLeaf(menuItems);
    setActiveMenuKey(initialItem?.key ?? null);
    setIframeSrc(resolveIframeSrc(initialItem));
  }, [menuItems]);

  const resolveItemByKey = useCallback((key) => findByKey(menuItems, key), [menuItems]);

  const handleMenuSelect = useCallback(
    (key, item, event) => {
      if (event?.preventDefault) {
        event.preventDefault();
      }

      const resolvedItem = item?.key === key ? item : resolveItemByKey(key);
      setActiveMenuKey(key ?? null);
      setIframeSrc(resolveIframeSrc(resolvedItem));
    },
    [resolveItemByKey]
  );

  const handlePatientFormSubmit = useCallback((payload) => {
    if (payload?.patient) {
      setPatient(payload.patient);
    }
    setLastSubmission(payload ?? null);
  }, []);

  const value = useMemo(
    () => ({
      menuItems,
      activeMenuKey,
      iframeSrc,
      patient,
      lastSubmission,
      handleMenuSelect,
      setIframeSrc,
      setPatient,
      handlePatientFormSubmit
    }),
    [
      menuItems,
      activeMenuKey,
      iframeSrc,
      patient,
      lastSubmission,
      handleMenuSelect
    ]
  );

  return <NursingContext.Provider value={value}>{children}</NursingContext.Provider>;
};

export const useMyContext = () => {
  const context = useContext(NursingContext);
  if (!context) {
    throw new Error('useMyContext must be used within a ContextProvider');
  }
  return context;
};

