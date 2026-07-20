import { useState, useCallback } from 'react';

const loadingStates = new Map();

export const setLoading = (key, value) => {
  loadingStates.set(key, value);
  window.dispatchEvent(new CustomEvent('loading-change', { detail: { key, value } }));
};

export const getLoading = (key) => loadingStates.get(key) || false;

export const useLoading = (key) => {
  const [loading, setLocalLoading] = useState(getLoading(key));

  const setLoadingState = useCallback((value) => {
    setLoading(key, value);
    setLocalLoading(value);
  }, [key]);

  return [loading, setLoadingState];
};

export const LoadingProvider = ({ children }) => {
  return children;
};