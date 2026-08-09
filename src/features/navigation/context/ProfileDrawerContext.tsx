import {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from "react";

interface ProfileDrawerContextValue {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const ProfileDrawerContext =
  createContext<ProfileDrawerContextValue | null>(
    null
  );

export function ProfileDrawerProvider({
  children,
}: PropsWithChildren) {
  const [isOpen, setIsOpen] =
    useState(false);

  const value =
    useMemo<ProfileDrawerContextValue>(
      () => ({
        isOpen,

        openDrawer: () => {
          setIsOpen(true);
        },

        closeDrawer: () => {
          setIsOpen(false);
        },
      }),
      [isOpen]
    );

  return (
    <ProfileDrawerContext.Provider
      value={value}
    >
      {children}
    </ProfileDrawerContext.Provider>
  );
}

export function useProfileDrawer() {
  const context = useContext(
    ProfileDrawerContext
  );

  if (!context) {
    throw new Error(
      "useProfileDrawer must be used inside ProfileDrawerProvider"
    );
  }

  return context;
}