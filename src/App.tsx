import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { WizardView } from './views/WizardView';
import { OrderStatusView } from './views/OrderStatusView';
import { FAQView } from './views/FAQView';
import { ContactView } from './views/ContactView';
import { LegalView } from './views/LegalView';
import { AdminView } from './views/AdminView';
import { CurrentScreen, OrderRecord } from './types';

export function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('home');
  const [latestOrder, setLatestOrder] = useState<OrderRecord | null>(null);

  const handleScreenChange = (screen: CurrentScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartWizard = () => {
    handleScreenChange('wizard');
  };

  const handleOrderCompleted = (order: OrderRecord) => {
    setLatestOrder(order);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Header with Language Selection and Navigation */}
      <Header 
        currentScreen={currentScreen}
        setCurrentScreen={handleScreenChange}
        onStartWizard={handleStartWizard}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeView 
            onStartWizard={handleStartWizard}
            setCurrentScreen={handleScreenChange}
          />
        )}

        {currentScreen === 'wizard' && (
          <WizardView 
            onOrderCompleted={handleOrderCompleted}
            setCurrentScreen={handleScreenChange}
          />
        )}

        {currentScreen === 'order-status' && (
          <OrderStatusView 
            setCurrentScreen={handleScreenChange}
          />
        )}

        {currentScreen === 'faq' && (
          <FAQView 
            onStartWizard={handleStartWizard}
            setCurrentScreen={handleScreenChange}
          />
        )}

        {currentScreen === 'contact' && (
          <ContactView 
            setCurrentScreen={handleScreenChange}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminView 
            setCurrentScreen={handleScreenChange}
          />
        )}

        {(currentScreen === 'impressum' || 
          currentScreen === 'datenschutz' || 
          currentScreen === 'agb' || 
          currentScreen === 'widerruf') && (
          <LegalView 
            screen={currentScreen}
            setCurrentScreen={handleScreenChange}
          />
        )}
      </main>

      {/* German Compliant Legal Footer with Commercial Disclaimer */}
      <Footer setCurrentScreen={handleScreenChange} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
