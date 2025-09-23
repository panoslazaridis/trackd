import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BusinessType, businessTypes } from '@/components/BusinessTypeSelector';

interface BusinessContextType {
  businessType: string;
  setBusinessType: (type: string) => void;
  getCurrentBusiness: () => BusinessType | null;
  userProfile: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    serviceArea: string;
    specializations: string[];
    targetHourlyRate: number;
    location: string;
    monthlyRevenueGoal: number;
    weeklyHoursTarget: number;
  };
  updateProfile: (updates: Partial<BusinessContextType['userProfile']>) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
}

interface BusinessProviderProps {
  children: ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  // Initialize with plumbing as default but load from localStorage if available
  const [businessType, setBusinessTypeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trackd_business_type') || 'plumbing';
    }
    return 'plumbing';
  });

  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trackd_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      businessName: "Manchester Plumbing Pro",
      ownerName: "John Smith", 
      email: "john@plumbingpro.co.uk",
      phone: "0161 123 4567",
      address: "45 Trade Street, Manchester, M1 2AB",
      serviceArea: "Greater Manchester",
      specializations: ["Emergency callouts (burst pipes, blocked drains, boiler breakdowns)", "Bathroom installations (full/partial)", "Boiler repairs and servicing"],
      targetHourlyRate: 55,
      location: "Greater Manchester",
      monthlyRevenueGoal: 8000,
      weeklyHoursTarget: 35
    };
  });

  // Save to localStorage when businessType changes
  const setBusinessType = (type: string) => {
    setBusinessTypeState(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trackd_business_type', type);
    }
  };

  // Save to localStorage when profile changes
  const updateProfile = (updates: Partial<BusinessContextType['userProfile']>) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trackd_user_profile', JSON.stringify(newProfile));
    }
  };

  const getCurrentBusiness = (): BusinessType | null => {
    return businessTypes.find(b => b.id === businessType) || null;
  };

  return (
    <BusinessContext.Provider value={{
      businessType,
      setBusinessType,
      getCurrentBusiness,
      userProfile,
      updateProfile
    }}>
      {children}
    </BusinessContext.Provider>
  );
}