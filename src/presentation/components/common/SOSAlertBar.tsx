'use client';

import React from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { AlertTriangle, Bell, PhoneCall, CheckCircle } from 'lucide-react';

export const SOSAlertBar: React.FC = () => {
  const { activeSOSAlerts, hasActiveSOS, resolveSOS } = useAppStore();

  if (!hasActiveSOS) return null;

  const currentAlert = activeSOSAlerts[0];

  return (
    <div className="sos-alert-bar sticky top-0 z-50 text-white px-4 py-2.5 flex items-center justify-between shadow-2xl border-b border-red-500">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white text-red-600 rounded-full animate-bounce">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded text-yellow-300">
              EMERGENCY SOS 호출
            </span>
            <span className="font-bold text-sm">
              [{currentAlert.location}] {currentAlert.workerName} ({currentAlert.phoneNumber})
            </span>
          </div>
          <p className="text-xs text-red-100 opacity-90 mt-0.5">
            사유: {currentAlert.message || '긴급 구조 및 현장 안전관리자 지원 요청'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`tel:${currentAlert.phoneNumber}`}
          className="bg-black/50 hover:bg-black/70 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-yellow-300/30 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          직통 전화 연결
        </a>
        <button
          onClick={() => resolveSOS(currentAlert.id)}
          className="bg-white hover:bg-gray-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          상황 확인 및 해제
        </button>
      </div>
    </div>
  );
};
