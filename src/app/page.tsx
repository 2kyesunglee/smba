'use client';

import React, { useState, useEffect } from 'react';
import { SOSAlertBar } from '@/presentation/components/common/SOSAlertBar';
import { Header } from '@/presentation/components/common/Header';
import { Sidebar, ActiveTab } from '@/presentation/components/common/Sidebar';
import { DashboardView } from '@/presentation/components/dashboard/DashboardView';
import { WorkerManagementView } from '@/presentation/components/worker/WorkerManagementView';
import { SafetyHealthView } from '@/presentation/components/safety/SafetyHealthView';
import { EquipmentProcessView } from '@/presentation/components/equipment/EquipmentProcessView';
import { ComplianceExportView } from '@/presentation/components/compliance/ComplianceExportView';
import { WorkerMobileSimulator } from '@/presentation/components/mobile/WorkerMobileSimulator';
import { AdminLoginView } from '@/presentation/components/auth/AdminLoginView';
import { AdminAuthService } from '@/infrastructure/services/AdminAuthService';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const authService = new AdminAuthService();
    const session = authService.getSession();
    setIsAdminLoggedIn(!!session);
  }, []);

  if (isAdminLoggedIn === false) {
    return <AdminLoginView onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
  }

  if (isAdminLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium text-sm">
        관리자 보안 세션 확인 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] text-slate-800">
      {/* 1. Top SOS Alert Bar (when emergency triggered) */}
      <SOSAlertBar />

      {/* 2. Global Navigation Bar */}
      <Header
        onOpenMobileView={() => setIsMobileSimulatorOpen(true)}
        onLogout={() => setIsAdminLoggedIn(false)}
      />

      {/* 3. Main Body: Sidebar + Dynamic Content Page */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (LNB) */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Right Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-70px)] bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />
            )}
            {activeTab === 'workers' && <WorkerManagementView />}
            {activeTab === 'safety' && <SafetyHealthView />}
            {activeTab === 'equipment' && <EquipmentProcessView />}
            {activeTab === 'compliance' && <ComplianceExportView />}
          </div>
        </main>
      </div>


      {/* 4. Worker Smartphone Mobile App Simulator Modal */}
      <WorkerMobileSimulator
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
      />
    </div>
  );
}
