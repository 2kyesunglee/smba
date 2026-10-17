'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAppStore } from '@/presentation/context/AppContext';
import {
  ShieldCheck,
  Bell,
  Smartphone,
  Download,
  QrCode,
  Check,
  X,
  ExternalLink,
  Wifi,
  Settings,
  Radio,
  FileSignature,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileView: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileView }) => {
  const { notifications, pendingPTWCount, pendingWorkerCount, hasActiveSOS } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Server Host (default to detected LAN IPv4)
  const [serverHost, setServerHost] = useState('192.168.0.99');
  const [installTab, setInstallTab] = useState<'apk' | 'web'>('apk');

  // QR Code Data URLs
  const [apkQrData, setApkQrData] = useState<string>('');
  const [webQrData, setWebQrData] = useState<string>('');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const apkUrl = `http://${serverHost}:3000/downloads/safeguard-ai-mobile.apk`;
  const webUrl = `http://${serverHost}:3000/mobile`;

  useEffect(() => {
    QRCode.toDataURL(apkUrl, { width: 220, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then((url) => setApkQrData(url))
      .catch((err) => console.error(err));

    QRCode.toDataURL(webUrl, { width: 220, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then((url) => setWebQrData(url))
      .catch((err) => console.error(err));
  }, [serverHost, apkUrl, webUrl]);

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
        {/* Smartphone App Install Button (APK & QR) */}
        <button
          onClick={() => setShowInstallModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          title="스마트폰에 안드로이드 APK 앱 설치 및 QR 연동"
        >
          <Download className="w-4 h-4" />
          <span>스마트폰 앱 설치 (APK / QR)</span>
        </button>

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
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-800">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Smartphone App Installation & QR Code Pairing */}
      {showInstallModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-5 max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    스마트폰 앱 설치 및 실시간 연동 (Android APK & QR)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    스마트폰 카메라로 QR 코드를 비추면 즉시 앱을 다운로드 및 설치하여 관리자 PC와 연동할 수 있습니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Network IP Configuration Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Wifi className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  현재 PC Wi-Fi IP: <strong className="font-mono text-slate-900">{serverHost}</strong> (스마트폰과 동일한 공유기 연결)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">IP 변경:</span>
                <input
                  type="text"
                  value={serverHost}
                  onChange={(e) => setServerHost(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 font-mono text-xs w-32 text-slate-800"
                  placeholder="예: 192.168.0.99"
                />
              </div>
            </div>

            {/* Install Type Tabs */}
            <div className="flex border-b border-slate-100 gap-4 text-xs font-bold">
              <button
                onClick={() => setInstallTab('apk')}
                className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 ${
                  installTab === 'apk'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Download className="w-4 h-4" />
                방법 1: 안드로이드 APK 파일 설치 (추천)
              </button>
              <button
                onClick={() => setInstallTab('web')}
                className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 ${
                  installTab === 'web'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" />
                방법 2: 모바일 웹 / PWA 바로 접속
              </button>
            </div>

            {/* Tab 1 Content: APK Installation */}
            {installTab === 'apk' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    {apkQrData ? (
                      <img src={apkQrData} alt="APK Download QR Code" className="w-44 h-44" />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                        QR 생성 중...
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-2">
                    [스마트폰 카메라로 스캔하여 APK 다운로드]
                  </span>
                  <a
                    href={apkUrl}
                    download="safeguard-ai-mobile.apk"
                    className="btn-primary text-xs mt-3 w-full justify-center bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PC에서 직접 다운로드 (11.9MB)
                  </a>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        1
                      </span>
                      스마트폰 카메라로 QR 스캔
                    </h4>
                    <p className="text-emerald-800 text-[11px]">
                      스마트폰 기본 카메라로 좌측 QR을 비추고 노출되는 링크를 눌러 APK 파일을 다운로드합니다.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px]">
                        2
                      </span>
                      패키지 설치 진행
                    </h4>
                    <p className="text-slate-600 text-[11px]">
                      다운로드 완료 후 알림창의 [열기]를 누르고 설치합니다. (보안 경고 시 [출처를 알 수 없는 앱 설치 허용] 선택)
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        3
                      </span>
                      실시간 연동 테스트
                    </h4>
                    <p className="text-blue-800 text-[11px]">
                      설치된 <strong>SafeGuard AI</strong> 앱을 실행하면 현장 근로자 전용 모바일 화면이 뜨며, SOS나 전자서명 제출 시 PC 대시보드에 즉시 반영됩니다!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2 Content: Web / PWA Direct Access */}
            {installTab === 'web' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    {webQrData ? (
                      <img src={webQrData} alt="Web App QR Code" className="w-44 h-44" />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                        QR 생성 중...
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-2">
                    [스마트폰 브라우저 즉시 접속 QR]
                  </span>
                  <a
                    href={webUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs mt-3 w-full justify-center flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    모바일 웹창 새창 열기
                  </a>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800">
                    앱 설치 없이 스마트폰 웹 브라우저(크롬, 사파리, 삼성인터넷)에서 바로 테스트하고 싶을 때 사용합니다.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-800 block">📱 홈 화면에 웹앱 추가(PWA):</span>
                    <p className="text-[11px] text-slate-500">
                      - <strong>Android</strong>: 브라우저 메뉴(⋮) -&gt; [홈 화면에 추가] 또는 [앱 설치]<br />
                      - <strong>iPhone</strong>: 사파리 하단 공유(↑) -&gt; [홈 화면에 추가]
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                    ※ 스마트폰과 PC가 반드시 같은 Wi-Fi 공유기(네트워크)에 연결되어 있어야 로컬 IP({serverHost})로 접속 가능합니다.
                  </div>
                </div>
              </div>
            )}

            {/* Live Sync Test Tips Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-600">
                <Radio className="w-3.5 h-3.5 text-red-500" />
                앱에서 SOS 전송 시 PC 상단 비상 바 실시간 점멸 테스트 지원
              </span>
              <button
                onClick={() => setShowInstallModal(false)}
                className="btn-secondary text-xs py-1 px-3"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
