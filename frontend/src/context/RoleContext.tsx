// src/context/RoleContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserRole } from "@/types";

export interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;

  userId: string | null;
  setUserId: (id: string | null) => void;

  userName: string | null;
  setUserName: (name: string | null) => void;

  userEmail: string | null;
  setUserEmail: (email: string | null) => void;

  userAvatar: string | null;
  setUserAvatar: (avatar: string | null) => void;

  organization: string | null;
  setOrganization: (org: string | null) => void;
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [organization, setOrganization] = useState<string | null>(null);

  // Load from localStorage once on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("role") as UserRole;
    const storedId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedAvatar = localStorage.getItem("userAvatar");
    const storedOrg = localStorage.getItem("organization");

    if (storedRole) setRole(storedRole);
    if (storedId) setUserId(storedId);
    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);
    if (storedAvatar) setUserAvatar(storedAvatar);
    if (storedOrg) setOrganization(storedOrg);
  }, []);

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      userId,
      setUserId,
      userName,
      setUserName,
      userEmail,
      setUserEmail,
      userAvatar,
      setUserAvatar,
      organization,
      setOrganization
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be inside RoleProvider");
  return context;
};
