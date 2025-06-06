import { LocaleProvider } from "@/components/locale/locale-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

// Mock router object that simulates Next.js router functionality
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: "/",
  query: {},
};

// Mock provider for router context if needed
export function MockRouterProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Helper to create mock search params
export function createMockSearchParams(params: Record<string, string>) {
  return new URLSearchParams(params);
}

// Helper to reset all router mocks
export function resetRouterMocks() {
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockRouter.prefetch.mockReset();
  mockRouter.back.mockReset();
  mockRouter.forward.mockReset();
  mockRouter.refresh.mockReset();
}

// Mock for server-side rendering checks
export const mockUseIsSSR = vi.fn().mockReturnValue(false);

// Helper function to simulate router navigation
export function simulateRouterNavigation(url: string) {
  mockRouter.pathname = url;
}

// Custom render function with router mock (if you want to extend this later)
export function renderWithRouter(ui: React.ReactElement) {
  return {
    ui,
    // Add additional helper methods as needed
  };
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocaleProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
