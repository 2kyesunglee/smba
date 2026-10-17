'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { ShieldCheck, Bell, Smartphone, User, Globe, AlertOctagon, Check } from 'lucide-react';

interface HeaderProps {
  onOpenMobileView: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileView }) => {
  const { notifications, pendingPTWCount, pendingWorkerCount, hasActiveSOS } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-[70px] bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand & Factory Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">SafeGuard AI</span>
              <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                Enterprise 16-Lang
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">근로자 스마트 안전 보건 및 설비 통합관제</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-6 pl-6 border-l border-slate-200 text-xs text-slate-500 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>공정 제1공장 센서 & 웹소켓 정상 연결됨</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Worker Mobile App Simulator Trigger */}
        <button
          onClick={onOpenMobileView}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 border border-amber-400/30 transition-transform active:scale-95"
          title="근로자 전용 모바일 앱 화면 체험"
        >
          <Smartphone className="w-4 h-4" />
          <span>시뮬레이터 팝업</span>
          <span className="bg-black/30 text-[10px] px-1.5 py-0.5 rounded-full font-mono">16개국어</span>
        </button>

        {/* Direct Mobile Page Link */}
        <a
          href="/mobile"
          target="_blank"
          rel="noreferrer"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          title="근로자 모바일 전용 페이지 새창 열기"
        >
          <span>📱 모바일 전용창 (/mobile)</span>
        </a>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 relative transition-colors"
            title="실시간 알림 센터"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  실시간 관제 알림
                </span>
                <span className="text-xs text-slate-400">최근 발생순</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="py-2.5 flex items-start gap-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
                    <span
                      className={`w-2.5 h-2.5 mt-1 rounded-full flex-shrink-0 ${
                        notif.priority === 'CRITICAL'
                          ? 'bg-red-500 animate-ping'
                          : notif.priority === 'HIGH'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    ></span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
            김공장
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>김공장장</span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                안전총괄
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">관리자(PC Web)</p>
          </div>
        </div>
      </div>
    </header>
  );
};

