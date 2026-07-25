import React from 'react';
import { ThemeProvider } from '../core/state/ThemeContext';
import { CurrencyProvider } from '../core/state/CurrencyContext';
import { SimpleModeProvider } from '../core/state/SimpleModeContext';
import { AuthProvider } from '../core/state/AuthContext';
import { DataProvider } from '../core/state/DataContext';
import { AlertProvider } from '../core/state/AlertContext';
import { ModalStackProvider } from '../core/state/ModalStackContext';
import { TerryProvider } from '../core/state/TerryContext';
import { TutorialProvider } from '../core/state/TutorialContext';

/**
 * App-wide state. Wraps the router, so anything needing navigation (see
 * UiProvider) lives inside the shell instead.
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <CurrencyProvider>
      <SimpleModeProvider>
        <AuthProvider>
          <DataProvider>
            <AlertProvider>
              <ModalStackProvider>
                <TerryProvider>
                  <TutorialProvider>{children}</TutorialProvider>
                </TerryProvider>
              </ModalStackProvider>
            </AlertProvider>
          </DataProvider>
        </AuthProvider>
      </SimpleModeProvider>
    </CurrencyProvider>
  </ThemeProvider>
);
