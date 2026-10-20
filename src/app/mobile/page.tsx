'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Truck,
  LogOut,
  Calendar,
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
    equipmentUsageLogs,
    equipmentTypes,
    inspectionTargets,
    requestEquipmentUsage,
    addWorker,
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  // Login / Auth State (Request #2)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSignUpView, setIsSignUpView] = useState(false);
  const [loginPhone, setLoginPhone] = useState('010-3456-7890');
  const [loginPassword, setLoginPassword] = useState('1234');
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    nationality: 'VN',
    phoneNumber: '',
    password: '',
  });

  // Current worker & language
  const currentWorker = workers.find((w) => w.id === activeWorkerId) || workers[0];
  const [selectedLang, setSelectedLang] = useState<string>(
    translationService.detectLanguageByNationality(currentWorker?.nationality || 'VN')
  );

  // Sync language automatically when worker changes (Request #3)
  useEffect(() => {
    if (currentWorker) {
      setSelectedLang(translationService.detectLanguageByNationality(currentWorker.nationality));
    }
  }, [currentWorker?.id, currentWorker?.nationality]);

  const [activeTab, setActiveTab] = useState<'instructions' | 'tbm' | 'ptw' | 'equipment_use' | 'inspect' | 'report'>('instructions');

  // 작업 지시 목록
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

  // Inspection Form State (Synced with Admin inspection targets)
  const [selectedInspectTarget, setSelectedInspectTarget] = useState<string>(inspectionTargets[0]?.id || 'target-1');
  const [inspectData, setInspectData] = useState({
    temperature: 132,
    pressure: 2.5,
    steam_leak: '정상',
  });

  // Equipment Usage Request State (Request #7)
  const [equipmentUseForm, setEquipmentUseForm] = useState({
    equipmentType: equipmentTypes[0] || '지게차',
    equipmentNumber: '1호기',
    purpose: '원자재 하역 및 창고 이송',
    startTime: '2026-10-20 09:00',
    endTime: '2026-10-20 12:00',
    location: 'A동 야적장',
    hasLicense: true,
    preCheckCompleted: true,
  });

  // Before/After Form State (Request #4)
  const [reportForm, setReportForm] = useState({
    taskName: '보일러실 배관 보온재 교체 및 청소',
    workerName: currentWorker ? `${currentWorker.name} (${currentWorker.koreanName || ''})` : '작업자',
    workDate: '',
    location: 'B동 보일러실 2구역',
    beforeImg1: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
    beforeImg2: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    afterImg1: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    afterImg2: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    beforeDescription: '노후 보온재 탈락으로 인한 열 손실 및 작업자 접촉 화상 위험 발생.',
    afterDescription: '고효율 난연성 글라스울 재시공 및 외장 알루미늄 커버 체결 완료.',
    description: '보온재 교체 작업 완료함.',
  });

  // Auto-fill worker details and workDate
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setReportForm((prev) => ({
      ...prev,
      workerName: currentWorker ? `${currentWorker.name} (${currentWorker.koreanName || currentWorker.nationality})` : prev.workerName,
      workDate: today,
    }));
  }, [currentWorker?.id]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = workers.find((w) => w.phoneNumber === loginPhone);
    if (!matched) {
      alert('등록되지 않은 전화번호입니다. 회원가입을 먼저 진행해주세요.');
      return;
    }
    if (matched.status === 'PENDING_APPROVAL') {
      alert('현재 관리자의 앱 연동 승인 대기 중입니다. 관리자 승인 후 계정이 활성화됩니다.');
      return;
    }
    setActiveWorker(matched.id);
    setIsLoggedIn(true);
    alert(`[로그인 성공] ${matched.name}님 환영합니다.`);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpForm.name || !signUpForm.phoneNumber || !signUpForm.password) {
      alert('이름, 국적, 핸드폰 번호, 비밀번호를 모두 입력해주세요.');
      return;
    }
    addWorker({
      name: signUpForm.name,
      nationality: signUpForm.nationality,
      phoneNumber: signUpForm.phoneNumber,
      password: signUpForm.password,
      status: 'PENDING_APPROVAL',
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: '2027-12-31',
    });
    alert(
      '🎉 [회원가입 승인 요청 완료]\n\n관리자의 "앱 연동 승인 대기열"로 정보가 전송되었습니다. 관리자가 인사기록카드 보완 및 승인 시 계정이 활성화됩니다.'
    );
    setIsSignUpView(false);
    setLoginPhone(signUpForm.phoneNumber);
  };

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
    ctx.strokeStyle = '#0071E3';
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

  const handleEquipmentUseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestEquipmentUsage({
      equipmentType: equipmentUseForm.equipmentType,
      equipmentNumber: equipmentUseForm.equipmentNumber,
      purpose: equipmentUseForm.purpose,
      startTime: equipmentUseForm.startTime,
      endTime: equipmentUseForm.endTime,
      location: equipmentUseForm.location,
      hasLicense: equipmentUseForm.hasLicense,
      preCheckCompleted: equipmentUseForm.preCheckCompleted,
    });
    alert(`[${equipmentUseForm.equipmentType}] 사용 승인 요청이 관리자에게 전송되었습니다.`);
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = inspectionTargets.find((t) => t.id === selectedInspectTarget) || inspectionTargets[0];
    const isAbnormal = inspectData.temperature > 130;
    const notes = isAbnormal ? `온도 기준치 초과 (${inspectData.temperature}°C > 130°C)` : '정상';
    submitInspection(target?.id || 'eq-1', target?.name || '설비', inspectData, isAbnormal, notes);
    alert(
      isAbnormal
        ? '⚠️ [주의] 온도가 기준치(130°C)를 초과하여 관리자 웹에 경고가 즉시 전송되었습니다.'
        : `[${target?.name}] 설비 점검 데이터가 정상 등록되어 웹에 실시간 반영되었습니다.`
    );
    setActiveTab('instructions');
  };

  const handlePhotoUpload = (field: 'beforeImg1' | 'beforeImg2' | 'afterImg1' | 'afterImg2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReportForm((prev) => ({
            ...prev,
            [field]: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
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
      [reportForm.afterImg1, reportForm.afterImg2],
      reportForm.beforeDescription,
      reportForm.afterDescription
    );
    alert('Before & After 작업 완료 보고서 (문제점 & 개선이후 설명 포함)가 관리자 갤러리로 전송되었습니다.');
    setActiveTab('instructions');
  };

  const langInfo = translationService.getLanguageInfo(selectedLang);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl border-x border-[#2C2C2E] font-sans">
      {/* Floating SOS Emergency Button */}
      {isLoggedIn && (
        <button
          onClick={handleSOS}
          className="fixed bottom-20 right-4 z-50 w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF3B30] to-[#FF453A] text-white font-extrabold text-sm shadow-2xl shadow-red-500/60 flex flex-col items-center justify-center border-2 border-white active:scale-95 transition-transform animate-pulse"
        >
          <Radio className="w-5 h-5 mb-0.5 animate-ping" />
          <span className="text-[11px] font-black">SOS</span>
        </button>
      )}

      {/* 1. Top Header Bar */}
      <header className="bg-[#1C1C1E]/95 backdrop-blur px-4 py-3 border-b border-white/10 sticky top-0 z-40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3] flex items-center justify-center text-white font-bold shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white">SafeGuard AI Mobile</h1>
              <p className="text-[10px] text-slate-400">근로자 전용 스마트폰 안전 앱</p>
            </div>
          </div>

          {/* Languages Selector */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2 py-1 rounded-xl">
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

        {/* Worker Switcher & Profile (when logged in) */}
        {isLoggedIn ? (
          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{langInfo.flag}</span>
              <span className="font-bold text-white">{currentWorker.name}</span>
              <span className="text-[11px] text-slate-400">
                ({currentWorker.koreanName || currentWorker.nationality})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeWorkerId}
                onChange={(e) => setActiveWorker(e.target.value)}
                className="text-[11px] bg-black/60 text-slate-200 rounded-lg px-2 py-0.5 border border-white/10"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id} className="bg-gray-900">
                    {w.name} ({w.nationality})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="text-gray-400 hover:text-white"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-[11px] text-blue-400 font-semibold pt-1">
            스마트폰 로그인 또는 신규 회원가입을 진행해주세요.
          </div>
        )}
      </header>

      {/* 2. Main Body Content */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {!isLoggedIn ? (
          /* Login & Registration Screen (Request #2) */
          <div className="space-y-4 py-4 text-xs">
            {!isSignUpView ? (
              /* Login */
              <div className="p-5 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-4 shadow-xl">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#0071E3] flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-white pt-1">스마트폰 근로자 로그인</h2>
                  <p className="text-[11px] text-gray-400">
                    핸드폰 번호(ID)와 비밀번호를 입력해주세요.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">스마트폰 번호 (ID)</label>
                    <input
                      type="text"
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="010-XXXX-XXXX"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">비밀번호 (Pass word)</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center py-3 bg-[#0071E3] hover:bg-[#0077ED] rounded-xl text-xs font-bold">
                    로그인 (Login)
                  </button>
                </form>

                <div className="pt-3 border-t border-white/10 text-center space-y-2">
                  <p className="text-[11px] text-gray-400">신규 입사자이신가요?</p>
                  <button
                    type="button"
                    onClick={() => setIsSignUpView(true)}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    회원가입 및 계정 승인 요청 (Sign Up)
                  </button>
                </div>
              </div>
            ) : (
              /* Sign up */
              <div className="p-5 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h2 className="text-base font-bold text-white">신규 회원가입</h2>
                    <p className="text-[11px] text-gray-400">승인 요청 후 관리자가 계정을 활성화합니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSignUpView(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    로그인
                  </button>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">이름 (영문 성명) *</label>
                    <input
                      type="text"
                      required
                      value={signUpForm.name}
                      onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                      placeholder="예: Nguyen Van An"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">국적 (모국어 자동 매핑) *</label>
                    <select
                      value={signUpForm.nationality}
                      onChange={(e) => setSignUpForm({ ...signUpForm, nationality: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code.toUpperCase()} className="bg-gray-900 text-white">
                          {l.flag} {l.country} ({l.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">핸드폰 번호 *</label>
                    <input
                      type="text"
                      required
                      value={signUpForm.phoneNumber}
                      onChange={(e) => setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })}
                      placeholder="010-XXXX-XXXX"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">비밀번호 (Pass word) *</label>
                    <input
                      type="password"
                      required
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                      placeholder="비밀번호 설정"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-200">
                    💡 승인 요청을 보내면 관리자 웹의 <strong>&quot;앱 연동 승인 대기열&quot;</strong>에 표시되고 관리자가 주민번호, 비자, 건강검진 등 인사기록카드 보완 후 최종 승인합니다.
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center py-3 bg-[#0071E3] hover:bg-[#0077ED] rounded-xl text-xs font-bold">
                    회원가입 승인 요청 (Request Approval)
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Logged-in Content Area */
          <>
            {/* Tab 1: 작업지시 (Instructions) */}
            {activeTab === 'instructions' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      {langInfo.flag} {langInfo.nativeName} 실시간 작업 지시함
                    </span>
                    <span className="badge badge-amber text-[9px]">실시간 푸시</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    관리자가 보낸 한국어 지시가 근로자의 <strong>모국어({langInfo.name})</strong>로 자동 번역되어 전달됩니다.
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
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        !inst.isConfirmed
                          ? 'bg-[#1C1C1E] border-blue-500/40 shadow-lg'
                          : 'bg-[#1C1C1E]/60 border-white/10 opacity-90'
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
                      <div className="p-3 bg-black/60 border border-blue-400/20 rounded-xl space-y-1">
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
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        {inst.isConfirmed ? (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            확인 및 숙지 완료 (Checked)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmInstruction(inst.id)}
                            className="btn-primary w-full justify-center text-xs py-2.5 bg-[#0071E3] hover:bg-[#0077ED] rounded-xl"
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
              <div className="space-y-4 text-xs bg-[#1C1C1E] p-4 rounded-2xl border border-white/10">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-blue-400" />
                  TBM & 안전교육 교안 모바일 전자서명
                </div>

                <div className="p-3 bg-black/50 rounded-xl space-y-2 border border-white/10">
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
                    className="btn-secondary text-xs flex-1 justify-center rounded-xl"
                  >
                    서명 지우기
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitSignature}
                    disabled={!hasSigned}
                    className="btn-primary text-xs flex-1 justify-center bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 rounded-xl"
                  >
                    서명 제출 완료
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: PTW 안전작업허가 신청 */}
            {activeTab === 'ptw' && (
              <div className="space-y-4 text-xs bg-[#1C1C1E] p-4 rounded-2xl border border-white/10">
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
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">작업 구역/위치</label>
                    <input
                      type="text"
                      required
                      value={ptwForm.location}
                      onChange={(e) => setPtwForm({ ...ptwForm, location: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">위험 요인</label>
                    <input
                      type="text"
                      value={ptwForm.hazardFactors}
                      onChange={(e) => setPtwForm({ ...ptwForm, hazardFactors: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">안전 조치 사항</label>
                    <textarea
                      rows={2}
                      value={ptwForm.safetyMeasures}
                      onChange={(e) => setPtwForm({ ...ptwForm, safetyMeasures: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5 bg-[#0071E3] hover:bg-[#0077ED] rounded-xl font-bold">
                    작업허가서 관리자 승인 신청
                  </button>
                </form>
              </div>
            )}

            {/* Tab 4: Equipment Usage Request (Request #7) */}
            {activeTab === 'equipment_use' && (
              <div className="space-y-4 text-xs bg-[#1C1C1E] p-4 rounded-2xl border border-white/10">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  기기/장비 사용 승인 요청 (지게차, 크레인 등)
                </div>

                <form onSubmit={handleEquipmentUseSubmit} className="space-y-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">사용 기기 종류 *</label>
                    <select
                      value={equipmentUseForm.equipmentType}
                      onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, equipmentType: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white text-xs"
                    >
                      {equipmentTypes.map((type) => (
                        <option key={type} value={type} className="bg-gray-900 text-white">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">작업 목적 *</label>
                    <input
                      type="text"
                      required
                      value={equipmentUseForm.purpose}
                      onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, purpose: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">시작 시간</label>
                      <input
                        type="text"
                        value={equipmentUseForm.startTime}
                        onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, startTime: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">종료 예정</label>
                      <input
                        type="text"
                        value={equipmentUseForm.endTime}
                        onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, endTime: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={equipmentUseForm.hasLicense}
                        onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, hasLicense: e.target.checked })}
                        className="rounded"
                      />
                      <span>면허/자격증 확인</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={equipmentUseForm.preCheckCompleted}
                        onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, preCheckCompleted: e.target.checked })}
                        className="rounded"
                      />
                      <span>사전 점검 완료</span>
                    </label>
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5 bg-[#0071E3] hover:bg-[#0077ED] rounded-xl font-bold">
                    기기 사용 승인 요청 전송
                  </button>
                </form>

                {/* Histories */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[11px] text-slate-400 font-bold block">
                    내 기기 사용 승인 상태:
                  </span>
                  {equipmentUsageLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-black/50 rounded-xl text-xs flex justify-between items-center border border-white/5">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-blue-400">[{log.equipmentType}]</span>
                          <span>{log.purpose}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {log.startTime} ~ {log.endTime}
                        </div>
                      </div>
                      <span className={`badge ${log.status === 'APPROVED' ? 'badge-green' : log.status === 'REJECTED' ? 'badge-red' : 'badge-amber'}`}>
                        {log.status === 'APPROVED' ? '승인완료' : log.status === 'REJECTED' ? '반려' : '승인대기'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: 스마트 체크리스트 점검 (Request #6) */}
            {activeTab === 'inspect' && (
              <div className="space-y-4 text-xs bg-[#1C1C1E] p-4 rounded-2xl border border-white/10">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                  설비 점검 일지 (웹 실시간 연동)
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">
                    점검 대상 설비 선택
                  </label>
                  <select
                    value={selectedInspectTarget}
                    onChange={(e) => setSelectedInspectTarget(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-xs text-white"
                  >
                    {inspectionTargets.map((target) => (
                      <option key={target.id} value={target.id} className="bg-gray-900 text-white">
                        {target.name} ({target.location})
                      </option>
                    ))}
                  </select>
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
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-amber-300 font-mono text-sm font-bold"
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
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white font-mono text-xs"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold">
                    점검 완료 및 관리자 웹 전송
                  </button>
                </form>
              </div>
            )}

            {/* Tab 6: Before & After 4장 사진 작업 보고서 (Request #4) */}
            {activeTab === 'report' && (
              <div className="space-y-4 text-xs bg-[#1C1C1E] p-4 rounded-2xl border border-white/10">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Before & After 사진 작업 완료 보고서
                </div>

                <form onSubmit={handleReportSubmit} className="space-y-3">
                  {/* Auto-filled metadata */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-slate-400 block mb-1">작업명 (자동)</label>
                      <input
                        type="text"
                        value={reportForm.taskName}
                        onChange={(e) => setReportForm({ ...reportForm, taskName: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">작업자 (자동 기입)</label>
                      <input
                        type="text"
                        readOnly
                        value={reportForm.workerName}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-emerald-300 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">작업일 (자동 기입)</label>
                      <input
                        type="text"
                        readOnly
                        value={reportForm.workDate}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">작업 위치</label>
                      <input
                        type="text"
                        value={reportForm.location}
                        onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Before Photos & Problem Description (Request #4) */}
                  <div className="p-3 bg-red-950/25 rounded-2xl border border-red-500/30 space-y-2">
                    <div className="text-[11px] text-red-400 font-bold flex items-center justify-between">
                      <span>BEFORE (작업 전 사진)</span>
                      <span className="text-[10px] text-slate-400">사진 등록 가능</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <img
                          src={reportForm.beforeImg1}
                          alt="Before 1"
                          className="h-20 w-full object-cover rounded-xl border border-red-500/40"
                        />
                        <label className="absolute bottom-1 right-1 p-1.5 bg-black/75 rounded-lg text-[9px] cursor-pointer hover:bg-black">
                          <Upload className="w-3 h-3 text-white inline" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload('beforeImg1', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="relative">
                        <img
                          src={reportForm.beforeImg2}
                          alt="Before 2"
                          className="h-20 w-full object-cover rounded-xl border border-red-500/40"
                        />
                        <label className="absolute bottom-1 right-1 p-1.5 bg-black/75 rounded-lg text-[9px] cursor-pointer hover:bg-black">
                          <Upload className="w-3 h-3 text-white inline" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload('beforeImg2', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-red-300 block mb-1 font-semibold text-[11px]">
                        Before 문제점에 대한 설명 *
                      </label>
                      <textarea
                        rows={2}
                        value={reportForm.beforeDescription}
                        onChange={(e) => setReportForm({ ...reportForm, beforeDescription: e.target.value })}
                        placeholder="작업 전 파손, 누설, 마모 등 문제점을 기재하세요."
                        className="w-full bg-black/60 border border-red-500/30 rounded-xl p-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* After Photos & Improvement Description (Request #4) */}
                  <div className="p-3 bg-emerald-950/25 rounded-2xl border border-emerald-500/30 space-y-2">
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center justify-between">
                      <span>AFTER (작업 후 사진)</span>
                      <span className="text-[10px] text-slate-400">사진 등록 가능</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <img
                          src={reportForm.afterImg1}
                          alt="After 1"
                          className="h-20 w-full object-cover rounded-xl border border-emerald-500/40"
                        />
                        <label className="absolute bottom-1 right-1 p-1.5 bg-black/75 rounded-lg text-[9px] cursor-pointer hover:bg-black">
                          <Upload className="w-3 h-3 text-white inline" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload('afterImg1', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="relative">
                        <img
                          src={reportForm.afterImg2}
                          alt="After 2"
                          className="h-20 w-full object-cover rounded-xl border border-emerald-500/40"
                        />
                        <label className="absolute bottom-1 right-1 p-1.5 bg-black/75 rounded-lg text-[9px] cursor-pointer hover:bg-black">
                          <Upload className="w-3 h-3 text-white inline" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload('afterImg2', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-emerald-300 block mb-1 font-semibold text-[11px]">
                        After 개선이후 설명 *
                      </label>
                      <textarea
                        rows={2}
                        value={reportForm.afterDescription}
                        onChange={(e) => setReportForm({ ...reportForm, afterDescription: e.target.value })}
                        placeholder="개선 완료 사항 및 안전 조치 내용을 기재하세요."
                        className="w-full bg-black/60 border border-emerald-500/30 rounded-xl p-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full justify-center text-xs py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    완료 보고서 관리자 전송
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. Bottom Mobile Tab Navigation Bar */}
      {isLoggedIn && (
        <nav className="bg-[#1C1C1E] border-t border-white/10 px-2 py-2.5 flex items-center justify-around text-slate-400 sticky bottom-0 z-40">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'instructions' ? 'text-blue-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="text-[10px]">작업지시</span>
          </button>

          <button
            onClick={() => setActiveTab('tbm')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'tbm' ? 'text-blue-400 font-bold' : 'hover:text-white'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span className="text-[10px]">TBM서명</span>
          </button>

          <button
            onClick={() => setActiveTab('equipment_use')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'equipment_use' ? 'text-blue-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span className="text-[10px]">기기신청</span>
          </button>

          <button
            onClick={() => setActiveTab('inspect')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'inspect' ? 'text-blue-400 font-bold' : 'hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="text-[10px]">설비점검</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'report' ? 'text-blue-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-[10px]">사진보고</span>
          </button>
        </nav>
      )}
    </div>
  );
}
