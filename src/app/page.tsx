'use client';

import React, { useState } from 'react';
import { SOSAlertBar } from '@/presentation/components/common/SOSAlertBar';
import { Header } from '@/presentation/components/common/Header';
import { Sidebar, ActiveTab } from '@/presentation/components/common/Sidebar';
import { DashboardView } from '@/presentation/components/dashboard/DashboardView';
import { WorkerManagementView } from '@/presentation/components/worker/WorkerManagementView';
import { SafetyHealthView } from '@/presentation/components/safety/SafetyHealthView';
import { EquipmentProcessView } from '@/presentation/components/equipment/EquipmentProcessView';
import { ComplianceExportView } from '@/presentation/components/compliance/ComplianceExportView';
import { WorkerMobileSimulator } from '@/presentation/components/mobile/WorkerMobileSimulator';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-100">
      {/* 1. Top SOS Alert Bar (when emergency triggered) */}
      <SOSAlertBar />

      {/* 2. Global Navigation Bar */}
      <Header onOpenMobileView={() => setIsMobileSimulatorOpen(true)} />

      {/* 3. Main Body: Sidebar + Dynamic Content Page */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (LNB) */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Right Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-70px)] bg-[#0B0F19]">
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
