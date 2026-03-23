import { useState, useEffect, useCallback } from "react";

const PROFILE_KEY = "zr_profile_name";

export const useProfile = () => {
  const [name, setName] = useState(() => {
    return localStorage.getItem(PROFILE_KEY) || "Maria";
  });

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, name);
  }, [name]);

  const updateName = useCallback((newName: string) => {
    setName(newName.trim() || "Maria");
  }, []);

  return { name, updateName };
};

export const getProfileName = (): string => {
  return localStorage.getItem(PROFILE_KEY) || "Maria";
};
