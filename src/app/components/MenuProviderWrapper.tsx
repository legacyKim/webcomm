"use client";

import { MenuProvider } from "@/contexts/MenuContext";
import { ReactNode } from "react";

interface MenuProviderWrapperProps {
  children: ReactNode;
  initialBoards: any[];
}

export default function MenuProviderWrapper({
  children,
  initialBoards,
}: MenuProviderWrapperProps) {
  return (
    <MenuProvider initialBoards={initialBoards}>
      {children}
    </MenuProvider>
  );
}
