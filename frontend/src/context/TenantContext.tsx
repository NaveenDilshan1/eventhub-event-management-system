import { createContext, useContext, useState, ReactNode } from "react";

interface TenantContextType {
  tenantId: string | null;
  campusName: string | null;
  setTenantId: (id: string | null) => void;
  setCampusName: (name: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenantId, setTenantId] = useState<string | null>(() =>
    localStorage.getItem("tenantId")
  );

  const [campusName, setCampusName] = useState<string | null>(() =>
    localStorage.getItem("organization")
  );

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        campusName,
        setTenantId,
        setCampusName,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used inside TenantProvider");
  return ctx;
};
