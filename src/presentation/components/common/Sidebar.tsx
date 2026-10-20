'use client';

import React from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Wrench,
  FileSpreadsheet,
  AlertTriangle,
  QrCode,
  FileCheck2,
  Calendar,
  Layers,
  HeartPulse,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'workers' | 'safety' | 'equipment' | 'compliance';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { pendingPTWCount, pendingWorkerCount, abnormalInspectionCount, expiringVisaCount, hasActiveSOS } = useAppStore();

  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string; subItems: string[] }[] = [
    {
      id: 'dashboard',
      label: '메인 대시보드',
      icon: <LayoutDashboard className="w-5 h-5" />,
      subItems: ['현장 종합 모니터링', '이상 징후 및 LOTO 현황'],
    },
    {
      id: 'workers',
      label: '근로자 관리 (HR)',
      icon: <Users className="w-5 h-5" />,
      badge: pendingWorkerCount > 0 ? pendingWorkerCount : undefined,
      badgeColor: 'badge-amber',
      subItems: ['전체 근로자 마스터 DB', '앱 연동 승인 대기열', '비자/검진 만료 캘린더'],
    },
    {
      id: 'safety',
      label: '안전·보건 관리',
      icon: <ShieldAlert className="w-5 h-5" />,
      badge: pendingPTWCount > 0 ? pendingPTWCount : undefined,
      badgeColor: 'badge-blue',
      subItems: ['안전교육 교안 & 서명', 'TBM & 서명', '기기 사용 일지 (지게차/크레인)', '16개국어 작업지시'],
    },
    {
      id: 'equipment',
      label: '설비·공정 관리',
      icon: <Wrench className="w-5 h-5" />,
      badge: abnormalInspectionCount > 0 ? abnormalInspectionCount : undefined,
      badgeColor: 'badge-red',
      subItems: ['Before & After 갤러리/엑셀', '설비점검 일지 & 대상 관리', '실제 스캔 QR 관리'],
    },
    {
      id: 'compliance',
      label: '컴플라이언스 & 서류',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      badge: expiringVisaCount > 0 ? expiringVisaCount : undefined,
      badgeColor: 'badge-purple',
      subItems: ['법정 서식 원클릭 추출', '문서 업로드 & 자료실'],
    },
  ];

  return (
    <aside className="w-64 bg-white/85 backdrop-blur-xl border-r border-black/8 flex flex-col justify-between p-4 min-h-[calc(100vh-68px)] select-none">
      <div className="space-y-5">
        <div className="px-3 text-[11px] font-bold tracking-wider text-[#86868B] uppercase">
          관리자 관제 메뉴
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all flex flex-col gap-0.5 ${
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-sm font-bold scale-[1.01]'
                    : 'text-[#515154] hover:text-[#1D1D1F] hover:bg-black/4'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-[#86868B]'}>{item.icon}</span>
                    <span className="font-semibold text-xs">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`badge ${isActive ? 'bg-white/20 text-white' : item.badgeColor || 'badge-blue'} text-[10px]`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {/* Sub-item preview */}
                <div className={`pl-7 text-[10.5px] truncate ${isActive ? 'text-white/80' : 'text-[#86868B]'}`}>
                  {item.subItems.join(' · ')}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Compliance / Safety Standard Info Box */}
      <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/5 text-xs">
        <div className="flex items-center gap-1.5 text-[#0071E3] font-bold mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>중대재해처벌법 대응</span>
        </div>
        <p className="text-[11px] text-[#6E6E73] leading-relaxed">
          전자서명, 점검 일지 및 기기 사용 기록이 타임스탬프와 함께 보관됩니다.
        </p>
      </div>
    </aside>
  );
};

