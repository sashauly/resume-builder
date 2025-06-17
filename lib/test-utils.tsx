import { LocaleProvider } from '@/components/locale/locale-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
};

export function MockRouterProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function createMockSearchParams(params: Record<string, string>) {
  return new URLSearchParams(params);
}

export function resetRouterMocks() {
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockRouter.prefetch.mockReset();
  mockRouter.back.mockReset();
  mockRouter.forward.mockReset();
  mockRouter.refresh.mockReset();
}

export const mockUseIsSSR = vi.fn().mockReturnValue(false);

export function simulateRouterNavigation(url: string) {
  mockRouter.pathname = url;
}

export function renderWithRouter(ui: React.ReactElement) {
  return {
    ui,
  };
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocaleProvider>
      <ThemeProvider
        attribute='class'
        defaultTheme='light'
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
