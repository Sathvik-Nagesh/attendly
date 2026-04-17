"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrandingConfig, DEFAULT_BRANDING, getBranding } from '@/lib/branding';

interface BrandingContextType {
  branding: BrandingConfig;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: DEFAULT_BRANDING,
  isLoading: true,
});

export const BrandingProvider = ({ children }: { children: React.ReactNode }) => {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const data = await getBranding();
        setBranding(data);
      } catch (error) {
        console.error("Failed to load branding:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
