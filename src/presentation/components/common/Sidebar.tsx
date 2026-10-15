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
      subItems: ['인사기록카드 마스터 DB', '앱 연동 승인 대기열', '비자/검진 캘린더'],
    },
    {
      id: 'safety',
      label: '안전·보건 관리',
      icon: <ShieldAlert className="w-5 h-5" />,
      badge: pendingPTWCount > 0 ? pendingPTWCount : undefined,
      badgeColor: 'badge-blue',
      subItems: ['16개국어 푸시 지시', 'TBM 교육 교안 & 전자서명', 'PTW 안전작업허가', 'SOS 비상 호출'],
    },
    {
      id: 'equipment',
      label: '설비·공정 관리',
      icon: <Wrench className="w-5 h-5" />,
      badge: abnormalInspectionCount > 0 ? abnormalInspectionCount : undefined,
      badgeColor: 'badge-red',
      subItems: ['QR 통합 관리 (LOTO/MSDS)', '스마트 체크리스트 빌더', '점검 일지 & 이상 수치', 'Before & After 갤러리'],
    },
    {
      id: 'compliance',
      label: '컴플라이언스 & 서류',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      badge: expiringVisaCount > 0 ? expiringVisaCount : undefined,
      badgeColor: 'badge-purple',
      subItems: ['원클릭 표준 양식(Excel/PDF)', '출입국/연장 서류 게시판'],
    },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-white/10 flex flex-col justify-between p-4 min-h-[calc(100vh-70px)] select-none">
      <div className="space-y-6">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
          관리자 관제 메뉴 (Admin Menu)
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${
                  isActive
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-400' : 'text-gray-400'}>{item.icon}</span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`badge ${item.badgeColor || 'badge-blue'}`}>{item.badge}</span>
                  )}
                </div>
                {/* Sub-item preview */}
                <div className="pl-8 text-[11px] text-gray-500 truncate">
                  {item.subItems.join(' · ')}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Compliance / Safety Standard Info Box */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>중대재해처벌법 100% 대비</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          전자서명 및 점검 일지가 위·변조 방지 암호화 타임스탬프와 함께 보관됩니다.
        </p>
      </div>
    </aside>
  );
};
