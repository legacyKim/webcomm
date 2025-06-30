"use client";

import React, { createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthContextType } from "./type/type";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
