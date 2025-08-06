"use client";

import { MenuProvider } from "@/contexts/MenuContext";
import { ReactNode } from "react";

interface Board {
  id: number;
  board_name: string;
  url_slug: string;
  [key: string]: unknown;
}

interface MenuProviderWrapperProps {
  children: ReactNode;
  initialBoards: Board[];
}

export default function MenuProviderWrapper({
  children,
  initialBoards,
}: MenuProviderWrapperProps) {
  return <MenuProvider initialBoards={initialBoards}>{children}</MenuProvider>;
}
