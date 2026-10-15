'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { MultiLanguageTranslationService, SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';
import {
  ShieldAlert,
  Send,
  Languages,
  CheckCircle2,
  Bell,
  Clock,
  Radio,
  FileSignature,
  FileCheck2,
  QrCode,
  ClipboardList,
  Camera,
  User,
  Smartphone,
  Phone,
  Lock,
} from 'lucide-react';

export default function MobileWorkerPage() {
  const {
    workers,
    activeWorkerId,
    setActiveWorker,
    notifications,
    triggerSOS,
    equipmentList,
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  // 로그인된 근로자 (기본: 첫번째 활성 근로자)
  const currentWorker = workers.find((w) => w.id === activeWorkerId) || workers[0];

  // 근로자 선호 언어
  const [selectedLang, setSelectedLang] = useState<string>(
    currentWorker.nationality.toLowerCase() === 'vn'
      ? 'vi'
      : currentWorker.nationality.toLowerCase() === 'mn'
      ? 'mn'
      : currentWorker.nationality.toLowerCase() === 'ph'
      ? 'ph'
      : 'vi'
  );

  const [activeTab, setActiveTab] = useState<'instructions' | 'tbm' | 'ptw' | 'qr'>('instructions');

  // 작업 지시 목록 (관리자가 보낸 공지/푸시 및 기본 안전작업지시)
  const [instructions, setInstructions] = useState([
    {
      id: 'inst-1',
      sender: '김공장장 (안전관리자)',
      koreanText: '오늘 스크러버 배관 용접 작업 주의. 안전그네 및 소화기 2기 배치 필수.',
      time: '오늘 08:30',
      priority: 'HIGH',
      isConfirmed: false,
    },
    {
      id: 'inst-2',
      sender: '현장반장',
      koreanText: '오후 2시 폐수처리장 슬러지 압착기 주변 고압세척 작업 시 미끄럼 및 감전 주의.',
      time: '오늘 09:10',
      priority: 'NORMAL',
      isConfirmed: true,
    },
    {
      id: 'inst-3',
      sender: '안전총괄팀',
      koreanText: 'B동 보일러실 청관제 투입 작업 시 방독마스크 및 내화학 장갑 착용 필수.',
      time: '어제 16:00',
      priority: 'HIGH',
      isConfirmed: true,
    },
  ]);

  const handleConfirmInstruction = (id: string) => {
    setInstructions(
      instructions.map((inst) => (inst.id === id ? { ...inst, isConfirmed: true } : inst))
    );
    alert('작업지시를 확인하고 서약했습니다. (관리자 웹 대시보드에 확인 기록이 전송됩니다.)');
  };

  const handleSOS = () => {
    const ok = window.confirm('🚨 긴급 SOS 비상 호출을 관리자에게 전송하시겠습니까?');
    if (ok) {
      triggerSOS('모바일 GPS 실시간 구역', '작업자 긴급 지원 요청');
      alert('관리자 웹 대시보드로 비상 경보가 즉시 전송되었습니다!');
    }
  };

  const langInfo = translationService.getLanguageInfo(selectedLang);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-gray-100 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl border-x border-white/10">
      {/* 상시 노출 SOS 비상 버튼 */}
      <button
        onClick={handleSOS}
        className="fixed bottom-20 right-4 z-50 w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-extrabold text-sm shadow-2xl shadow-red-500/60 flex flex-col items-center justify-center border-2 border-white active:scale-95 transition-transform animate-pulse"
      >
        <Radio className="w-5 h-5 mb-0.5 animate-ping" />
        <span className="text-[11px] font-black">SOS</span>
      </button>

      {/* 1. 상단 바: 언어 선택 및 근로자 프로필 */}
      <header className="bg-[#111827] px-4 py-3 border-b border-white/10 sticky top-0 z-40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white">SafeGuard Mobile</h1>
              <p className="text-[10px] text-gray-400">외국인 근로자 전용 모바일 앱</p>
            </div>
          </div>

          {/* 16개국 다국어 즉각 전환기 */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2 py-1 rounded-lg">
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-gray-900 text-white">
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 근로자 로그인 정보 바 */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{langInfo.flag}</span>
            <span className="font-bold text-white">{currentWorker.name}</span>
            <span className="text-[11px] text-gray-400">({currentWorker.koreanName || currentWorker.nationality})</span>
          </div>

          {/* 테스트용 근로자 전환 드롭다운 */}
          <select
            value={activeWorkerId}
            onChange={(e) => setActiveWorker(e.target.value)}
            className="text-[10px] bg-white/5 text-gray-300 rounded px-1.5 py-0.5 border border-white/10"
          >
            {workers.map((w) => (
              <option key={w.id} value={w.id} className="bg-gray-900">
                {w.name} ({w.nationality})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 2. 본문 컨텐츠 */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* 상단 안내 배너 */}
        <div className="p-3 bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/30 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-blue-300">
            <span className="flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              {langInfo.flag} {langInfo.nativeName} 작업 지시 수신함
            </span>
            <span className="badge badge-amber text-[9px]">실시간 푸시</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            관리자가 한국어로 보낸 작업 지시가 근로자의 <strong>모국어({langInfo.name})</strong>로 자동 번역되어 전달됩니다.
          </p>
        </div>

        {/* 작업 지시 목록 (카드 뷰) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
            <span>수신된 작업 지시 ({instructions.length}건)</span>
            <span>최신순</span>
          </div>

          {instructions.map((inst) => {
            const translated = translationService.translateInstruction(inst.koreanText, selectedLang);

            return (
              <div
                key={inst.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  !inst.isConfirmed
                    ? 'bg-gradient-to-br from-gray-900 to-blue-950/40 border-blue-500/40 shadow-lg'
                    : 'bg-white/5 border-white/10 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="text-xs font-bold text-white">{inst.sender}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{inst.time}</span>
                  </div>
                </div>

                {/* 1) 모국어 번역본 (큰 글씨로 강조) */}
                <div className="p-3 bg-black/50 border border-blue-400/20 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <span>{langInfo.flag}</span>
                    <span>{langInfo.name} 번역 (모국어)</span>
                  </div>
                  <div className="text-sm font-bold text-white leading-relaxed">
                    {translated}
                  </div>
                </div>

                {/* 2) 관리자 한국어 원문 */}
                <div className="px-2 text-xs text-gray-400">
                  <span className="text-[10px] text-gray-500 block mb-0.5">🇰🇷 한국어 원문:</span>
                  <p className="leading-snug text-gray-300">{inst.koreanText}</p>
                </div>

                {/* 3) 근로자 확인 버튼 */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  {inst.isConfirmed ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      확인 및 숙지 완료 (Checked)
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConfirmInstruction(inst.id)}
                      className="btn-primary w-full justify-center text-xs py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      작업지시 확인 및 서약 (Confirm)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. 하단 네비게이션 탭 바 */}
      <nav className="bg-[#111827] border-t border-white/10 px-4 py-2 flex items-center justify-around text-gray-400 sticky bottom-0 z-40">
        <button
          onClick={() => setActiveTab('instructions')}
          className="flex flex-col items-center gap-1 text-blue-400"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-bold">작업지시</span>
        </button>
        <a
          href="/#tbm"
          onClick={(e) => {
            e.preventDefault();
            alert('TBM 전자서명 화면으로 이동합니다.');
          }}
          className="flex flex-col items-center gap-1 hover:text-white"
        >
          <FileSignature className="w-5 h-5" />
          <span className="text-[10px]">TBM서명</span>
        </a>
        <a
          href="/#ptw"
          onClick={(e) => {
            e.preventDefault();
            alert('작업허가서(PTW) 화면으로 이동합니다.');
          }}
          className="flex flex-col items-center gap-1 hover:text-white"
        >
          <FileCheck2 className="w-5 h-5" />
          <span className="text-[10px]">작업허가</span>
        </a>
        <a
          href="/#qr"
          onClick={(e) => {
            e.preventDefault();
            alert('설비 QR 스캐너를 엽니다.');
          }}
          className="flex flex-col items-center gap-1 hover:text-white"
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px]">QR스캔</span>
        </a>
      </nav>
    </div>
  );
}
