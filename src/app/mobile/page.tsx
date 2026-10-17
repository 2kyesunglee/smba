'use client';

import React, { useState, useRef } from 'react';
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
  Upload,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function MobileWorkerPage() {
  const {
    workers,
    activeWorkerId,
    setActiveWorker,
    notifications,
    triggerSOS,
    submitSignature,
    createPTW,
    submitInspection,
    submitWorkReport,
    equipmentList,
    ptwList,
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  // 로그인된 근로자 (기본: 첫번째 활성 근로자)
  const currentWorker = workers.find((w) => w.id === activeWorkerId) || workers[0];

  // 근로자 선호 언어
  const [selectedLang, setSelectedLang] = useState<string>(
    currentWorker.nationality.toLowerCase() === 'kr'
      ? 'ko'
      : currentWorker.nationality.toLowerCase() === 'vn'
      ? 'vi'
      : currentWorker.nationality.toLowerCase() === 'mn'
      ? 'mn'
      : currentWorker.nationality.toLowerCase() === 'ph'
      ? 'ph'
      : 'vi'
  );

  const [activeTab, setActiveTab] = useState<'instructions' | 'tbm' | 'ptw' | 'inspect' | 'report'>('instructions');

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

  // Touch signature canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // PTW Form State
  const [ptwForm, setPtwForm] = useState({
    taskName: '스크러버 배관 플랜지 조임 및 고소 점검',
    location: 'A동 화학탱크 상부 배관',
    hazardFactors: '추락 위험, 가스 누출 가능성',
    safetyMeasures: '안전대 2개소 체결, 가스측정기 휴대, 소화기 배치',
  });

  // Inspection Form State
  const [inspectData, setInspectData] = useState({
    temperature: 132, // triggers abnormal if > 130
    pressure: 2.5,
    steam_leak: '정상',
  });

  // Before/After Form State (2 Before + 2 After Photos)
  const [reportForm, setReportForm] = useState({
    taskName: '보일러실 배관 보온재 교체 및 청소',
    location: 'B동 보일러실 2구역',
    beforeImg1: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
    beforeImg2: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    afterImg1: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    afterImg2: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: '노후 보온재 제거 후 난연성 글라스울 재시공 완료함.',
  });

  const handleConfirmInstruction = (id: string) => {
    setInstructions(
      instructions.map((inst) => (inst.id === id ? { ...inst, isConfirmed: true } : inst))
    );
    alert('작업지시를 확인하고 서약했습니다. (관리자 웹 대시보드에 확인 기록이 전송됩니다.)');
  };

  const handleSOS = () => {
    const ok = window.confirm('🚨 긴급 SOS 비상 호출을 관리자에게 전송하시겠습니까?');
    if (ok) {
      triggerSOS('모바일 GPS 실시간 구역 (스마트폰 앱)', '작업자 긴급 지원 요청');
      alert('관리자 웹 대시보드로 비상 경보가 즉시 전송되었습니다! (상단 빨간색 바 점멸)');
    }
  };

  // Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1E3A8A';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmitSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    submitSignature('TBM', 'tpl-1', '고소 및 배관 용접 작업 안전수칙', dataUrl);
    alert('모바일 전자서명이 완료되어 관리자 웹 DB에 영구 보관되었습니다.');
    setActiveTab('instructions');
  };

  const handleCreatePTWSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPTW(ptwForm);
    alert('작업허가서(PTW)가 신청되었습니다. 관리자 웹 승인 후 착수할 수 있습니다.');
    setActiveTab('instructions');
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAbnormal = inspectData.temperature > 130;
    const notes = isAbnormal ? `온도 기준치 초과 (${inspectData.temperature}°C > 130°C)` : '정상';
    submitInspection('eq-1', 'A동 렌더링 쿠커 #1', inspectData, isAbnormal, notes);
    alert(
      isAbnormal
        ? '⚠️ [주의] 온도가 기준치(130°C)를 초과하여 관리자 웹에 경고가 즉시 전송되었습니다.'
        : '설비 점검 데이터가 정상 등록되었습니다.'
    );
    setActiveTab('instructions');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWorkReport(
      reportForm.taskName,
      reportForm.location,
      reportForm.beforeImg1,
      reportForm.afterImg1,
      reportForm.description,
      [reportForm.beforeImg1, reportForm.beforeImg2],
      [reportForm.afterImg1, reportForm.afterImg2]
    );
    alert('Before & After 작업 완료 보고서 (전 2장 + 후 2장)가 관리자 갤러리로 전송되었습니다.');
    setActiveTab('instructions');
  };

  const langInfo = translationService.getLanguageInfo(selectedLang);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl border-x border-slate-700 font-sans">
      {/* Floating SOS Emergency Button */}
      <button
        onClick={handleSOS}
        className="fixed bottom-20 right-4 z-50 w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-extrabold text-sm shadow-2xl shadow-red-500/60 flex flex-col items-center justify-center border-2 border-white active:scale-95 transition-transform animate-pulse"
      >
        <Radio className="w-5 h-5 mb-0.5 animate-ping" />
        <span className="text-[11px] font-black">SOS</span>
      </button>

      {/* 1. Top Header Bar */}
      <header className="bg-slate-800/95 backdrop-blur px-4 py-3 border-b border-slate-700 sticky top-0 z-40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white">SafeGuard Mobile</h1>
              <p className="text-[10px] text-slate-400">근로자 전용 스마트폰 안전 앱</p>
            </div>
          </div>

          {/* 16 Languages Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-xl">
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Worker Switcher & Profile */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{langInfo.flag}</span>
            <span className="font-bold text-white">{currentWorker.name}</span>
            <span className="text-[11px] text-slate-400">
              ({currentWorker.koreanName || currentWorker.nationality})
            </span>
          </div>

          <select
            value={activeWorkerId}
            onChange={(e) => setActiveWorker(e.target.value)}
            className="text-[11px] bg-slate-900 text-slate-200 rounded px-2 py-0.5 border border-slate-700"
          >
            {workers.map((w) => (
              <option key={w.id} value={w.id} className="bg-slate-900">
                {w.name} ({w.nationality})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 2. Main Body Content by Tab */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Tab 1: 작업지시 (Instructions) */}
        {activeTab === 'instructions' && (
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                <span className="flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  {langInfo.flag} {langInfo.nativeName} 실시간 작업 지시함
                </span>
                <span className="badge badge-amber text-[9px]">실시간 푸시</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                관리자가 한국어로 보낸 작업 지시가 근로자의 <strong>모국어({langInfo.name})</strong>로 자동 번역되어 전달됩니다.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
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
                      ? 'bg-slate-800/90 border-blue-500/40 shadow-lg'
                      : 'bg-slate-800/40 border-slate-700/60 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span className="text-xs font-bold text-white">{inst.sender}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{inst.time}</span>
                    </div>
                  </div>

                  {/* 1) 모국어 번역본 */}
                  <div className="p-3 bg-slate-900/80 border border-blue-400/20 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                      <span>{langInfo.flag}</span>
                      <span>{langInfo.name} 번역 (모국어)</span>
                    </div>
                    <div className="text-sm font-bold text-white leading-relaxed">
                      {translated}
                    </div>
                  </div>

                  {/* 2) 관리자 한국어 원문 */}
                  <div className="px-1 text-xs text-slate-400">
                    <span className="text-[10px] text-slate-500 block mb-0.5">🇰🇷 한국어 원문:</span>
                    <p className="leading-snug text-slate-300">{inst.koreanText}</p>
                  </div>

                  {/* 3) 근로자 확인 버튼 */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    {inst.isConfirmed ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        확인 및 숙지 완료 (Checked)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmInstruction(inst.id)}
                        className="btn-primary w-full justify-center text-xs py-2 bg-blue-600 hover:bg-blue-500"
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
        )}

        {/* Tab 2: TBM & 안전교안 서명 */}
        {activeTab === 'tbm' && (
          <div className="space-y-4 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-blue-400" />
              TBM & 안전교육 교안 모바일 전자서명
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl space-y-2 border border-slate-700">
              <span className="font-bold text-blue-300 block">오늘의 안전수칙:</span>
              <p className="text-slate-300 text-xs leading-relaxed">
                1. 안전모 턱끈 체결 및 안전대 2개소 걸이<br />
                2. 용접 작업 전 소화기 배치 및 불티 비산방지포 설치<br />
                3. 이상 가스 감지 시 즉시 작업 중지 및 관리자 통보
              </p>
            </div>

            <div>
              <span className="text-slate-300 font-bold block mb-1">
                서명 패드 (손가락으로 서명하세요):
              </span>
              <canvas
                ref={canvasRef}
                width={340}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full bg-white rounded-xl border-2 border-blue-400 cursor-crosshair touch-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="btn-secondary text-xs flex-1 justify-center"
              >
                서명 지우기
              </button>
              <button
                type="button"
                onClick={handleSubmitSignature}
                disabled={!hasSigned}
                className="btn-primary text-xs flex-1 justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                서명 제출 완료
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: PTW 안전작업허가 신청 */}
        {activeTab === 'ptw' && (
          <div className="space-y-4 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              안전작업허가서(PTW) 모바일 신청
            </div>

            <form onSubmit={handleCreatePTWSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">작업 명칭</label>
                <input
                  type="text"
                  required
                  value={ptwForm.taskName}
                  onChange={(e) => setPtwForm({ ...ptwForm, taskName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">작업 구역/위치</label>
                <input
                  type="text"
                  required
                  value={ptwForm.location}
                  onChange={(e) => setPtwForm({ ...ptwForm, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">위험 요인</label>
                <input
                  type="text"
                  value={ptwForm.hazardFactors}
                  onChange={(e) => setPtwForm({ ...ptwForm, hazardFactors: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">안전 조치 사항</label>
                <textarea
                  rows={2}
                  value={ptwForm.safetyMeasures}
                  onChange={(e) => setPtwForm({ ...ptwForm, safetyMeasures: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-xs py-2 bg-blue-600 hover:bg-blue-500">
                작업허가서 관리자 승인 신청
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: 스마트 체크리스트 점검 */}
        {activeTab === 'inspect' && (
          <div className="space-y-4 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-red-400" />
              설비 점검 체크리스트 (수치 입력)
            </div>

            <form onSubmit={handleInspectionSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  가열 온도 (°C) - [기준치 130°C 초과 시 즉시 경보 발령]
                </label>
                <input
                  type="number"
                  value={inspectData.temperature}
                  onChange={(e) =>
                    setInspectData({ ...inspectData, temperature: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">공급 압력 (bar)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inspectData.pressure}
                  onChange={(e) =>
                    setInspectData({ ...inspectData, pressure: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-xs py-2 bg-rose-600 hover:bg-rose-500">
                점검 완료 및 전송
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: Before & After 4장 사진 작업 보고서 */}
        {activeTab === 'report' && (
          <div className="space-y-4 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Before & After 4분할 사진 작업 보고 (전 2장 + 후 2장)
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">작업명</label>
                <input
                  type="text"
                  required
                  value={reportForm.taskName}
                  onChange={(e) => setReportForm({ ...reportForm, taskName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">작업 위치</label>
                <input
                  type="text"
                  required
                  value={reportForm.location}
                  onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              {/* 4 Photos Preview Grid */}
              <div className="space-y-2">
                <div className="p-2.5 bg-red-950/30 rounded-xl border border-red-500/30">
                  <div className="text-[11px] text-red-400 font-bold mb-1.5 flex items-center justify-between">
                    <span>BEFORE (작업 전 2장)</span>
                    <span className="text-[10px] text-slate-400">사진1 & 사진2</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <img
                      src={reportForm.beforeImg1}
                      alt="Before 1"
                      className="h-20 w-full object-cover rounded-lg border border-red-500/40"
                    />
                    <img
                      src={reportForm.beforeImg2}
                      alt="Before 2"
                      className="h-20 w-full object-cover rounded-lg border border-red-500/40"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                  <div className="text-[11px] text-emerald-400 font-bold mb-1.5 flex items-center justify-between">
                    <span>AFTER (작업 후 2장)</span>
                    <span className="text-[10px] text-slate-400">사진1 & 사진2</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <img
                      src={reportForm.afterImg1}
                      alt="After 1"
                      className="h-20 w-full object-cover rounded-lg border border-emerald-500/40"
                    />
                    <img
                      src={reportForm.afterImg2}
                      alt="After 2"
                      className="h-20 w-full object-cover rounded-lg border border-emerald-500/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">조치 내용 요약</label>
                <textarea
                  rows={2}
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center text-xs py-2 bg-emerald-600 hover:bg-emerald-500 font-bold"
              >
                <Upload className="w-3.5 h-3.5" />
                완료 보고서 관리자 전송
              </button>
            </form>
          </div>
        )}
      </main>

      {/* 3. Bottom Mobile Tab Navigation Bar */}
      <nav className="bg-slate-800 border-t border-slate-700 px-2 py-2 flex items-center justify-around text-slate-400 sticky bottom-0 z-40">
        <button
          onClick={() => setActiveTab('instructions')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'instructions' ? 'text-blue-400 font-bold' : 'hover:text-white'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">작업지시</span>
        </button>

        <button
          onClick={() => setActiveTab('tbm')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'tbm' ? 'text-blue-400 font-bold' : 'hover:text-white'
          }`}
        >
          <FileSignature className="w-5 h-5" />
          <span className="text-[10px]">TBM서명</span>
        </button>

        <button
          onClick={() => setActiveTab('ptw')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'ptw' ? 'text-blue-400 font-bold' : 'hover:text-white'
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span className="text-[10px]">작업허가</span>
        </button>

        <button
          onClick={() => setActiveTab('inspect')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'inspect' ? 'text-blue-400 font-bold' : 'hover:text-white'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">설비점검</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'report' ? 'text-blue-400 font-bold' : 'hover:text-white'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px]">사진보고</span>
        </button>
      </nav>
    </div>
  );
}
