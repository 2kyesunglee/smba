'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { LocalStateStore, SafetyMaterial } from '@/infrastructure/storage/LocalStateStore';
import { translationServiceInstance, SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';
import { compressImageFile } from '@/infrastructure/utils/imageCompressor';
import {
  Smartphone,
  X,
  ShieldAlert,
  AlertTriangle,
  FileSignature,
  FileCheck2,
  FileText,
  QrCode,
  Camera,
  CheckCircle2,
  Languages,
  Radio,
  Send,
  Lock,
  ArrowRight,
  ClipboardList,
  Upload,
  User,
  KeyRound,
  Truck,
  Check,
  Clock,
  LogOut,
  Calendar,
} from 'lucide-react';

interface WorkerMobileSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkerMobileSimulator: React.FC<WorkerMobileSimulatorProps> = ({ isOpen, onClose }) => {
  const {
    workers,
    activeWorkerId,
    setActiveWorker,
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
    safetyMaterials,
    signSafetyMaterial,
    pushHistories,
    updatePushHistory,
  } = useAppStore();

  const translationService = translationServiceInstance;

  // Login / Auth State (Request #1: 최초 접속 시 미로그인 상태로 로그인 창 표시)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUpView, setIsSignUpView] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    nationality: 'VN',
    phoneNumber: '',
    password: '',
  });

  // Restore worker login session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = window.localStorage.getItem('smba_worker_session_v1');
      if (savedSession) {
        const found = workers.find((w) => w.id === savedSession);
        if (found && found.status === 'ACTIVE') {
          setActiveWorker(savedSession);
          setIsLoggedIn(true);
        }
      }
    }
  }, [workers, setActiveWorker]);

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

  const langInfo = translationService.getLanguageInfo(selectedLang);

  const [activeTab, setActiveTab] = useState<'home' | 'tbm' | 'education' | 'ptw' | 'equipment_use' | 'inspect' | 'report' | 'qr'>('home');

  // Education Material Signing State (Request #6)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [viewingEduMaterial, setViewingEduMaterial] = useState<SafetyMaterial | null>(null);
  const eduCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEduDrawing, setIsEduDrawing] = useState(false);
  const [hasEduSigned, setHasEduSigned] = useState(false);

  // Filter push histories: only for this worker or 'ALL'
  const myPushHistories = (pushHistories || []).filter(
    (item) =>
      !item.targetWorkerId ||
      item.targetWorkerId === 'ALL' ||
      item.targetWorkerId === currentWorker?.id ||
      item.targetWorkerId.includes(currentWorker?.id || '')
  );

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // PTW Request State (Initialized in worker's native language)
  const initialDefaults = translationService.getWorkerFormDefaults(selectedLang);
  const [ptwForm, setPtwForm] = useState({
    taskName: initialDefaults.ptw.taskName,
    location: initialDefaults.ptw.location,
    hazardFactors: initialDefaults.ptw.hazardFactors,
    safetyMeasures: initialDefaults.ptw.safetyMeasures,
  });

  // Inspection Form State (Synced with Admin Inspection Targets)
  const [selectedInspectTarget, setSelectedInspectTarget] = useState<string>(inspectionTargets[0]?.id || 'target-1');
  const [inspectData, setInspectData] = useState({
    temperature: 132, // triggers abnormal if > 130
    pressure: 2.5,
    steam_leak: '정상',
  });

  // Equipment Usage Request State (Request #7: 지게차, 고소작업대 등)
  const [equipmentUseForm, setEquipmentUseForm] = useState({
    equipmentType: equipmentTypes[0] || '지게차',
    equipmentNumber: '1호기',
    purpose: initialDefaults.equipmentUse.purpose,
    startTime: '2026-10-20 09:00',
    endTime: '2026-10-20 12:00',
    location: initialDefaults.equipmentUse.location,
    hasLicense: true,
    preCheckCompleted: true,
  });

  // Before/After Form State (Request #4: 자동기입 및 문제점/개선이후 설명)
  const [reportForm, setReportForm] = useState({
    taskName: initialDefaults.report.taskName,
    workerName: currentWorker ? `${currentWorker.name} (${currentWorker.koreanName || ''})` : '작업자',
    workDate: '',
    location: initialDefaults.report.location,
    beforeImg1: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
    beforeImg2: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    afterImg1: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    afterImg2: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    beforeDescription: initialDefaults.report.beforeDescription,
    afterDescription: initialDefaults.report.afterDescription,
    description: initialDefaults.report.description,
  });

  // Update auto-filled worker name, date, and native-language form defaults when worker or language changes
  useEffect(() => {
    const defaults = translationService.getWorkerFormDefaults(selectedLang);
    const today = new Date().toISOString().split('T')[0];
    setPtwForm({
      taskName: defaults.ptw.taskName,
      location: defaults.ptw.location,
      hazardFactors: defaults.ptw.hazardFactors,
      safetyMeasures: defaults.ptw.safetyMeasures,
    });
    setEquipmentUseForm((prev) => ({
      ...prev,
      purpose: defaults.equipmentUse.purpose,
      location: defaults.equipmentUse.location,
    }));
    setReportForm((prev) => ({
      ...prev,
      taskName: defaults.report.taskName,
      location: defaults.report.location,
      beforeDescription: defaults.report.beforeDescription,
      afterDescription: defaults.report.afterDescription,
      description: defaults.report.description,
      workerName: currentWorker ? `${currentWorker.name} (${currentWorker.koreanName || currentWorker.nationality})` : prev.workerName,
      workDate: today,
    }));
  }, [selectedLang, currentWorker?.id]);

  // Scanned QR result
  const [scannedEquipment, setScannedEquipment] = useState<any | null>(null);

  if (!isOpen) return null;

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = workers.find((w) => w.phoneNumber === loginPhone);
    if (!matched) {
      alert('등록되지 않은 전화번호입니다. 먼저 회원가입 및 승인 요청을 진행해주세요.');
      return;
    }
    if (matched.status === 'PENDING_APPROVAL') {
      alert('현재 관리자의 앱 연동 승인 대기 중입니다. 관리자 웹에서 인사기록카드 등록 및 승인 후 로그인할 수 있습니다.');
      return;
    }
    setActiveWorker(matched.id);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('smba_worker_session_v1', matched.id);
    }
    alert(`[로그인 성공] ${matched.name}님 환영합니다. 모국어(${matched.nationality})로 자동 전환됩니다.`);
  };

  const handleLogout = () => {
    if (confirm('스마트폰 앱에서 로그아웃 하시겠습니까?')) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('smba_worker_session_v1');
      }
      setIsLoggedIn(false);
      setLoginPhone('');
      setLoginPassword('');
    }
  };

  // Education Signature Canvas Handlers (Request #6)
  const startEduDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = eduCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsEduDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawEdu = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isEduDrawing) return;
    const canvas = eduCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#10B981';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasEduSigned(true);
  };

  const stopEduDrawing = () => {
    setIsEduDrawing(false);
  };

  const clearEduCanvas = () => {
    const canvas = eduCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasEduSigned(false);
  };

  const handleCompleteEduSignature = (materialId: string) => {
    if (!hasEduSigned) {
      alert('서명 패드에 서명을 먼저 작성해주세요.');
      return;
    }
    const canvas = eduCanvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL() : undefined;

    signSafetyMaterial(materialId, {
      id: 'ms-' + Date.now(),
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      nationality: currentWorker.nationality,
      signedAt: new Date().toLocaleString(),
      signatureDataUrl: dataUrl,
    });

    clearEduCanvas();
    setSelectedMaterialId('');
    alert('🎉 [안전교육 교안 전자서약 완료]\n\n안전교육 이수 및 서명이 완료되어 관리자 웹 대시보드로 즉시 전송되었습니다.');
  };

  // Sign up handler (Request #2)
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
      '🎉 [회원가입 승인 요청 완료]\n\n관리자 웹의 "앱 연동 승인 대기열"로 정보가 전송되었습니다.\n관리자가 주민번호, 비자, 건강검진 등 인사기록카드를 확인 및 승인하면 계정이 활성화됩니다.'
    );
    setIsSignUpView(false);
    setLoginPhone(signUpForm.phoneNumber);
  };

  // Canvas Drawing Handlers
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
    setActiveTab('home');
  };

  const handleTriggerSOS = () => {
    const confirmed = window.confirm(
      '🚨 [긴급 SOS] 관리자 웹 대시보드와 스마트폰으로 위치 알람을 즉시 전송하시겠습니까?'
    );
    if (confirmed) {
      triggerSOS('A동 3구역 (스마트폰 GPS 위치 전송)', '현장 긴급 대피 및 의료 지원 요청');
      alert('SOS가 전송되었습니다! 화면 상단 Alert Bar에 붉은색 경보가 점멸됩니다.');
    }
  };

  const handleCreatePTWSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPTW(ptwForm);
    alert('작업허가서(PTW)가 신청되었습니다. 관리자 웹 승인 후 착수할 수 있습니다.');
    setActiveTab('ptw');
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = inspectionTargets.find((t) => t.id === selectedInspectTarget) || inspectionTargets[0];
    const isAbnormal = inspectData.temperature > 130;
    const notes = isAbnormal ? `온도 기준치 초과 (${inspectData.temperature}°C > 130°C)` : '정상';
    submitInspection(target?.id || 'eq-1', target?.name || '설비', inspectData, isAbnormal, notes);
    alert(
      isAbnormal
        ? `⚠️ [주의] 온도가 기준치(130°C)를 초과하여 관리자 웹에 경고가 즉시 전송되었습니다.`
        : `[${target?.name}] 설비 점검 데이터가 정상 등록되어 관리자 웹에 실시간 반영되었습니다.`
    );
    setActiveTab('home');
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
      workerId: currentWorker?.id || 'w-1',
      workerName: currentWorker ? `${currentWorker.name} (${currentWorker.koreanName || ''})` : '근로자',
    });
    LocalStateStore.getInstance().syncToServer();
    alert(`[${equipmentUseForm.equipmentType}] 사용 승인 요청이 관리자 웹으로 전송되었습니다.`);
  };

  // Image Upload helper (with client-side compression to prevent payload bloating)
  const handlePhotoUpload = async (field: 'beforeImg1' | 'beforeImg2' | 'afterImg1' | 'afterImg2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 0.7);
        setReportForm((prev) => ({
          ...prev,
          [field]: compressed,
        }));
      } catch {
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
    setActiveTab('home');
  };

  return (
    <div className="modal-overlay">
      <div className="relative flex flex-col items-center max-w-sm w-full mx-auto animate-fadeIn">
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/90 hover:text-white bg-black/60 rounded-full border border-white/20 transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Worker & Language Top Selector Bar (Apple Style Clean Bar) */}
        <div className="w-full bg-[#1C1C1E] p-3 rounded-t-3xl border border-white/10 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">근로자:</span>
            <select
              value={activeWorkerId}
              onChange={(e) => setActiveWorker(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id} className="bg-gray-900 text-white">
                  {w.name} ({w.nationality}) - {w.status === 'PENDING_APPROVAL' ? '승인대기' : '활성'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-gray-900 text-white">
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Phone Mockup Body (Apple iPhone Style) */}
        <div className="w-full h-[710px] bg-[#000000] border-4 border-[#2C2C2E] rounded-b-3xl shadow-2xl overflow-hidden flex flex-col justify-between relative text-white">
          {/* Mobile Top Status Bar */}
          <div className="h-7 bg-black px-6 flex items-center justify-between text-[11px] text-gray-400 font-mono select-none">
            <span className="font-semibold text-white">09:41</span>
            {/* Dynamic Island Pill */}
            <div className="w-20 h-4 bg-[#1C1C1E] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500/80 mr-1.5"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-gray-400 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Floating SOS Button */}
          {isLoggedIn && (
            <button
              onClick={handleTriggerSOS}
              className="absolute bottom-16 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF3B30] to-[#FF453A] text-white font-black text-sm shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center border-2 border-white/40 active:scale-90 transition-transform beacon-pulse"
              title="비상 상황 시 즉시 누르세요"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span className="text-[10px] tracking-tight">SOS</span>
            </button>
          )}

          {/* Mobile App Header */}
          <div className="bg-[#1C1C1E] px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0071E3] flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">SafeGuard AI Mobile</div>
                <div className="text-[10px] text-gray-400">
                  {isLoggedIn ? `${currentWorker.name} (${currentWorker.nationality})` : '근로자 인증'}
                </div>
              </div>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className={`badge text-[9px] ${currentWorker.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}`}>
                  {currentWorker.status === 'ACTIVE' ? '인증완료' : '승인대기'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:text-red-400 text-gray-400 text-[10px]"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="badge badge-blue text-[10px]">로그인 필요</span>
            )}
          </div>

          {/* Main App Content Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#0A0A0C]">
            {/* VIEW A: Login / Sign Up Screen (User Request #1 & #2) */}
            {!isLoggedIn ? (
              <div className="space-y-4 py-2 text-xs">
                {!isSignUpView ? (
                  /* Login Screen */
                  <div className="p-4 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-3">
                    <div className="text-center space-y-1 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#0071E3] flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-sm text-white pt-1">근로자 모바일 로그인</h3>
                      <p className="text-[11px] text-gray-400">
                        스마트폰 번호와 비밀번호를 입력해주세요.
                      </p>
                    </div>

                    {/* Quick login worker selector chips */}
                    <div className="p-2 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-400 font-semibold block">등록 근로자 빠른 선택:</span>
                      <div className="flex flex-wrap gap-1">
                        {workers.filter(w => w.status === 'ACTIVE').slice(0, 3).map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setLoginPhone(w.phoneNumber);
                              setLoginPassword('1234');
                            }}
                            className="text-[10px] bg-blue-900/50 hover:bg-blue-800 text-blue-200 px-2 py-0.5 rounded-lg border border-blue-500/30 font-medium"
                          >
                            {w.name} ({w.nationality})
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                      <div>
                        <label className="text-[10.5px] text-gray-400 block mb-1">
                          스마트폰 번호 (ID)
                        </label>
                        <input
                          type="text"
                          required
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] text-gray-400 block mb-1">
                          비밀번호 (Password)
                        </label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-primary w-full justify-center py-2.5 mt-2 bg-[#0071E3] hover:bg-[#0077ED] rounded-xl text-xs font-bold"
                      >
                        로그인 (Login)
                      </button>
                    </form>

                    {/* 회원가입 버튼 (Request #2) */}
                    <div className="pt-3 border-t border-white/10 text-center space-y-1.5">
                      <p className="text-[11px] text-gray-400">처음 접속하셨나요?</p>
                      <button
                        type="button"
                        onClick={() => setIsSignUpView(true)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold rounded-xl text-xs transition-colors"
                      >
                        신규 회원가입 및 승인 요청 (Sign Up)
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Sign Up Screen (Request #2: 이름, 국적, 핸드폰 번호, password) */
                  <div className="p-4 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div>
                        <h3 className="font-bold text-sm text-white">회원가입 및 승인 요청</h3>
                        <p className="text-[10.5px] text-gray-400">관리자 웹 승인 후 계정이 활성화됩니다.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSignUpView(false)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        로그인으로
                      </button>
                    </div>

                    <form onSubmit={handleSignUpSubmit} className="space-y-2.5">
                      <div>
                        <label className="text-[10.5px] text-gray-400 block mb-1">
                          이름 (영문 성명) *
                        </label>
                        <input
                          type="text"
                          required
                          value={signUpForm.name}
                          onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                          placeholder="예: Nguyen Van An"
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] text-gray-400 block mb-1">
                          국적 (모국어 자동 매핑) *
                        </label>
                        <select
                          value={signUpForm.nationality}
                          onChange={(e) => setSignUpForm({ ...signUpForm, nationality: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          {SUPPORTED_LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code.toUpperCase()} className="bg-gray-900 text-white">
                              {l.flag} {l.country} ({l.nativeName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10.5px] text-gray-400 block mb-1">
                          스마트폰 번호 *
                        </label>
                        <input
                          type="text"
                          required
                          value={signUpForm.phoneNumber}
                          onChange={(e) => setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })}
                          placeholder="010-XXXX-XXXX"
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] text-gray-400 block mb-1">
                          비밀번호 (Pass word) *
                        </label>
                        <input
                          type="password"
                          required
                          value={signUpForm.password}
                          onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                          placeholder="4자리 이상 입력"
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[10.5px] text-blue-200 leading-relaxed">
                        💡 승인 요청을 누르면 관리자 웹의 <strong>&quot;앱 연동 승인 대기열&quot;</strong>에 표시되고, 관리자가 인사기록카드 보완 입력 후 최종 승인합니다.
                      </div>

                      <button
                        type="submit"
                        className="btn-primary w-full justify-center py-2.5 bg-[#0071E3] hover:bg-[#0077ED] rounded-xl text-xs font-bold"
                      >
                        승인 요청 제출 (Request Approval)
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              /* VIEW B: Logged-in App Content */
              <div className="space-y-3">
                {/* Tab: Home */}
                {activeTab === 'home' && (
                  <div className="space-y-3">
                    {/* Safety Warning Card (Auto translated in worker's native language) */}
                    <div className="p-3.5 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/30 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold">
                        <span>
                          {translationService.getLanguageInfo(selectedLang).flag} 오늘의 모국어 안전수칙
                        </span>
                        <span className="badge badge-amber text-[9px]">필독</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed font-semibold">
                        {translationService.translate('작업 전 안전점검을 반드시 실시하세요.', selectedLang)}
                      </p>
                      <p className="text-[11px] text-gray-300">
                        {translationService.translate('보호구(안전모, 안전화, 보안경) 착용 필수', selectedLang)}
                      </p>
                    </div>

                    {/* 실시간 관리자 작업지시서 카드 (수신 대상 본인 또는 전체 대상만 표출) */}
                    {myPushHistories && myPushHistories.length > 0 && (
                      <div className="p-3 bg-blue-950/50 border border-blue-500/40 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            📢 관리자 실시간 작업지시 (본인 전용)
                          </span>
                          <span className="badge badge-amber text-[9px]">실시간 푸시</span>
                        </div>
                        {myPushHistories.slice(0, 3).map((push) => {
                          const translated = translationService.translateInstruction(push.instructionText, selectedLang);
                          const isConfirmed = push.status === 'CONFIRMED';
                          return (
                            <div key={push.id} className="p-2.5 bg-black/60 rounded-xl space-y-1.5 border border-white/10">
                              <div className="text-xs font-bold text-white leading-snug">
                                {translated}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                🇰🇷 원문: {push.instructionText}
                              </div>
                              <div className="pt-1 flex items-center justify-between text-[10px]">
                                <span className="text-gray-400">{push.sentAt}</span>
                                {isConfirmed ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> 서약 완료
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      updatePushHistory(push.id, { status: 'CONFIRMED' });
                                      alert('작업지시를 확인하고 서약했습니다. (관리자 웹 대시보드에 실시간 전송)');
                                    }}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                                  >
                                    확인 및 서약
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Action Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => setActiveTab('tbm')}
                        className="p-3 bg-[#1C1C1E] hover:bg-white/10 border border-white/10 rounded-2xl text-left space-y-1 transition-colors"
                      >
                        <FileSignature className="w-5 h-5 text-emerald-400" />
                        <div className="font-bold text-white">TBM 전자서명</div>
                        <div className="text-[10px] text-gray-400">작업 전 서명 이수</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('ptw')}
                        className="p-3 bg-[#1C1C1E] hover:bg-white/10 border border-white/10 rounded-2xl text-left space-y-1 transition-colors"
                      >
                        <FileCheck2 className="w-5 h-5 text-amber-400" />
                        <div className="font-bold text-white">작업허가서(PTW)</div>
                        <div className="text-[10px] text-gray-400">고소/화기 작업 신청</div>
                      </button>

                      {/* Request #7: 기기 사용 승인요청 바로가기 */}
                      <button
                        onClick={() => setActiveTab('equipment_use')}
                        className="p-3 bg-[#1C1C1E] hover:bg-white/10 border border-white/10 rounded-2xl text-left space-y-1 transition-colors"
                      >
                        <Truck className="w-5 h-5 text-blue-400" />
                        <div className="font-bold text-white">기기 사용 승인요청</div>
                        <div className="text-[10px] text-gray-400">지게차/고소작업대/크레인</div>
                      </button>

                      {/* Request #6: 설비 일일 점검 */}
                      <button
                        onClick={() => setActiveTab('inspect')}
                        className="p-3 bg-[#1C1C1E] hover:bg-white/10 border border-white/10 rounded-2xl text-left space-y-1 transition-colors"
                      >
                        <ClipboardList className="w-5 h-5 text-purple-400" />
                        <div className="font-bold text-white">설비 일일 점검</div>
                        <div className="text-[10px] text-gray-400">웹과 실시간 양방향 연동</div>
                      </button>
                    </div>

                    {/* Before & After Photo Report Card */}
                    <button
                      onClick={() => setActiveTab('report')}
                      className="w-full p-3.5 bg-[#1C1C1E] hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-white">Before & After 작업 보고서</div>
                          <div className="text-[10px] text-gray-400">사진 업로드 & 문제점/개선 설명</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* LOTO Notice */}
                    <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200">
                      <div className="flex items-center gap-1 font-bold mb-0.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>LOTO 알림:</span>
                      </div>
                      {translationService.translate(
                        'LOTO(잠금장치)가 발부된 설비는 임의 조작이 금지됩니다.',
                        selectedLang
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: TBM Canvas Signature */}
                {activeTab === 'tbm' && (
                  <div className="space-y-3 text-xs">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-emerald-400" />
                      작업 전 안전수칙 모바일 전자서명
                    </div>

                    <div className="p-3 bg-[#1C1C1E] rounded-2xl space-y-1.5 text-[11px] text-gray-300">
                      <div className="font-semibold text-white">
                        {langInfo.flag} {translationService.translateInstruction('고소 및 배관 용접 작업 안전수칙', selectedLang)}
                      </div>
                      <p className="text-emerald-300 font-medium">
                        1. {translationService.translateInstruction('안전모 턱끈 체결 및 안전대 2개소 걸이', selectedLang)}
                      </p>
                      <p className="text-emerald-300 font-medium">
                        2. {translationService.translateInstruction('용접 작업 전 소화기 배치 및 불티 비산방지포 설치', selectedLang)}
                      </p>
                      <div className="text-[10px] text-gray-400 pt-1 border-t border-white/10">
                        🇰🇷 한국어 원문: 고소 및 배관 용접 작업 (안전모·안전대 착용 및 소화기 배치 필수)
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-[11px] text-gray-400">
                        <span>터치로 아래에 서명하세요:</span>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-red-400 hover:underline"
                        >
                          다시 쓰기
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-400 overflow-hidden touch-none shadow-inner">
                        <canvas
                          ref={canvasRef}
                          width={310}
                          height={140}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-[140px] cursor-crosshair"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitSignature}
                      disabled={!hasSigned}
                      className={`btn-primary w-full justify-center text-xs py-2.5 rounded-xl ${
                        !hasSigned ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      전자서명 제출 (DB 영구 보관)
                    </button>
                  </div>
                )}

                {/* Tab: 안전교육 교안 & 서명 (Request #6) */}
                {activeTab === 'education' && (
                  <div className="space-y-3 text-xs">
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        <span>안전교육 교안 모바일 전자서명</span>
                      </div>
                      <span className="badge badge-green text-[9px]">법정의무</span>
                    </div>

                    <div className="space-y-2.5">
                      {safetyMaterials
                        .filter((m) => m.type === 'SAFETY_EDUCATION')
                        .map((mat) => {
                          const mySig = mat.signatures.find((s) => s.workerId === currentWorker.id);
                          const isSigned = !!mySig;
                          const isSelected = selectedMaterialId === mat.id;
                          const transCat = translationService.translateInstruction(mat.category, selectedLang);
                          const transTitle = translationService.translateInstruction(mat.title, selectedLang);
                          const trans = translationService.translateInstruction(mat.description, selectedLang);

                          return (
                            <div
                              key={mat.id}
                              className={`p-3 bg-[#1C1C1E] rounded-2xl border space-y-2 ${
                                isSigned ? 'border-emerald-500/30' : 'border-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div>
                                  <span className="badge badge-blue text-[9px] mb-1 inline-block">{transCat}</span>
                                  <h4 className="font-bold text-white text-xs">{transTitle}</h4>
                                  {selectedLang !== 'ko' && transTitle !== mat.title && (
                                    <div className="text-[9.5px] text-gray-400">🇰🇷 원문: {mat.title}</div>
                                  )}
                                  <span className="text-[10px] text-gray-400">📄 {mat.fileName} ({mat.fileSize})</span>
                                </div>
                                {isSigned ? (
                                  <span className="badge badge-green text-[9px] shrink-0">✅ 서명완료</span>
                                ) : (
                                  <span className="badge badge-amber text-[9px] shrink-0 animate-pulse">⏳ 미서명</span>
                                )}
                              </div>

                              <div className="p-2 bg-black/40 rounded-xl text-[11px] text-emerald-300">
                                <strong>모국어 요약:</strong> {trans}
                              </div>

                              {(mat.fileUrl || mat.pdfUrl) && (
                                <button
                                  type="button"
                                  onClick={() => setViewingEduMaterial(mat)}
                                  className="w-full py-1.5 px-2 bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-500/30 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                                  <span>첨부 교안 열람하기 (서명 전 필독)</span>
                                </button>
                              )}

                              {isSigned ? (
                                <div className="text-[10px] text-emerald-400 pt-1 border-t border-white/5 flex justify-between">
                                  <span>이수 서명: {mySig?.signedAt}</span>
                                  <span className="font-bold">보관 완료</span>
                                </div>
                              ) : isSelected ? (
                                <div className="pt-2 border-t border-white/10 space-y-2">
                                  <div className="p-2 bg-emerald-950/40 rounded-xl text-[10px] text-emerald-200">
                                    위 안전수칙을 준수할 것을 서약합니다. 아래 서명 패드에 서명해주세요.
                                  </div>

                                  <div className="bg-white rounded-xl border border-emerald-400 overflow-hidden touch-none">
                                    <canvas
                                      ref={eduCanvasRef}
                                      width={300}
                                      height={120}
                                      onMouseDown={startEduDrawing}
                                      onMouseMove={drawEdu}
                                      onMouseUp={stopEduDrawing}
                                      onTouchStart={startEduDrawing}
                                      onTouchMove={drawEdu}
                                      onTouchEnd={stopEduDrawing}
                                      className="w-full h-[120px] cursor-crosshair"
                                    />
                                  </div>

                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={clearEduCanvas}
                                      className="btn-secondary text-[11px] py-1.5 flex-1 justify-center rounded-lg"
                                    >
                                      다시쓰기
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMaterialId('')}
                                      className="btn-secondary text-[11px] py-1.5 flex-1 justify-center rounded-lg"
                                    >
                                      취소
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCompleteEduSignature(mat.id)}
                                      disabled={!hasEduSigned}
                                      className="btn-primary text-[11px] py-1.5 flex-1 justify-center bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg disabled:opacity-50"
                                    >
                                      서명완료
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMaterialId(mat.id);
                                    clearEduCanvas();
                                  }}
                                  className="btn-primary w-full justify-center text-[11px] py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex items-center gap-1"
                                >
                                  <FileSignature className="w-3.5 h-3.5" />
                                  <span>교안 서약 서명하기</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>

                    {/* 교안 첨부파일 열람 모달 */}
                    {viewingEduMaterial && (
                      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
                        <div className="bg-[#1C1C1E] border border-white/20 rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                          <div className="p-3 bg-black/50 border-b border-white/10 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <h4 className="text-xs font-bold text-white truncate">{viewingEduMaterial.title}</h4>
                              <p className="text-[10px] text-gray-400">{viewingEduMaterial.fileName}</p>
                            </div>
                            <button
                              onClick={() => setViewingEduMaterial(null)}
                              className="p-1 text-gray-400 hover:text-white rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/40">
                            {(() => {
                              const targetUrl = viewingEduMaterial.fileUrl || viewingEduMaterial.pdfUrl || '';
                              const isImage = targetUrl.startsWith('data:image') || viewingEduMaterial.fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                              if (isImage) {
                                return (
                                  <img
                                    src={targetUrl}
                                    alt={viewingEduMaterial.title}
                                    className="w-full rounded-xl object-contain max-h-[50vh] bg-black/20"
                                  />
                                );
                              }
                              return (
                                <iframe
                                  src={targetUrl}
                                  title={viewingEduMaterial.title}
                                  className="w-full h-[50vh] rounded-xl border border-white/10 bg-white"
                                />
                              );
                            })()}
                            <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-200">
                              <strong>모국어 요약:</strong> {translationService.translateInstruction(viewingEduMaterial.description, selectedLang)}
                            </div>
                          </div>
                          <div className="p-2.5 bg-black/50 border-t border-white/10 flex justify-end">
                            <button
                              onClick={() => setViewingEduMaterial(null)}
                              className="px-4 py-1.5 bg-[#0071E3] text-white rounded-xl text-xs font-bold"
                            >
                              확인 완료 및 닫기
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: PTW Request */}
                {activeTab === 'ptw' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-amber-400" />
                        모바일 안전작업허가서(PTW) 신청
                      </div>
                      <span className="badge badge-blue text-[9px] font-bold">16개국어 모국어 작성</span>
                    </div>

                    <div className="p-2 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[10.5px] text-blue-200">
                      🌐 <strong>모국어 작성 가능:</strong> 국적 언어로 작성하시면 관리자에게 한국어로 자동 번역되어 전달됩니다.
                    </div>

                    <form onSubmit={handleCreatePTWSubmit} className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-gray-400 block mb-0.5">
                          작업 명칭 (모국어 작성 가능) *
                        </label>
                        <input
                          type="text"
                          required
                          value={ptwForm.taskName}
                          onChange={(e) => setPtwForm({ ...ptwForm, taskName: e.target.value })}
                          placeholder="예: 지붕 고소 용접 작업 (모국어로 작성)"
                          className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-400 block mb-0.5">
                          작업 위치 (모국어 작성 가능) *
                        </label>
                        <input
                          type="text"
                          required
                          value={ptwForm.location}
                          onChange={(e) => setPtwForm({ ...ptwForm, location: e.target.value })}
                          placeholder="예: 제2공장 A동 (모국어로 작성)"
                          className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-400 block mb-0.5">위험 요인 (모국어 가능)</label>
                        <input
                          type="text"
                          value={ptwForm.hazardFactors}
                          onChange={(e) => setPtwForm({ ...ptwForm, hazardFactors: e.target.value })}
                          placeholder="예: 추락 위험, 화재 불티 (모국어로 작성)"
                          className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>

                      <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5 rounded-xl">
                        허가 신청서 전송
                      </button>
                    </form>

                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-400 font-bold block">
                          신청 이력 및 승인 상태:
                        </span>
                        <span className="text-[10px] text-blue-400 font-semibold">실시간 동기화</span>
                      </div>
                      {ptwList.map((p) => {
                        const isApproved = p.status === 'APPROVED';
                        const isRejected = p.status === 'REJECTED';
                        const transTask = /[가-힣]/.test(p.taskName)
                          ? translationService.translateInstruction(p.taskName, selectedLang)
                          : p.taskName;
                        const transLoc = /[가-힣]/.test(p.location)
                          ? translationService.translateInstruction(p.location, selectedLang)
                          : p.location;
                        const translatedRejection = p.rejectionReason
                          ? translationService.translateInstruction(p.rejectionReason, selectedLang)
                          : '';

                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 rounded-xl text-[11px] mb-1.5 space-y-1 border ${
                              isApproved
                                ? 'bg-emerald-950/30 border-emerald-500/30'
                                : isRejected
                                ? 'bg-rose-950/30 border-rose-500/30'
                                : 'bg-[#1C1C1E] border-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold text-white">{transTask}</div>
                                <div className="text-gray-400 text-[10px]">{transLoc} ({p.ptwNumber})</div>
                              </div>
                              <span
                                className={`badge ${
                                  isApproved
                                    ? 'badge-green'
                                    : isRejected
                                    ? 'badge-red'
                                    : 'badge-amber'
                                }`}
                              >
                                {isApproved ? '✅ 승인완료' : isRejected ? '❌ 반려' : '⏳ 심사대기'}
                              </span>
                            </div>
                            {isApproved && (
                              <div className="text-[9.5px] text-emerald-300">
                                승인자: {p.approvedBy || '관리자'} ({p.approvedAt ? new Date(p.approvedAt).toLocaleTimeString() : '승인완료'})
                              </div>
                            )}
                            {isRejected && p.rejectionReason && (
                              <div className="p-2 bg-rose-500/15 border border-rose-500/30 rounded-lg space-y-0.5 text-rose-200">
                                <div className="flex items-center justify-between text-[9px] font-bold text-rose-300">
                                  <span>관리자 반려 사유 (모국어 자동 번역):</span>
                                  <span className="badge badge-red text-[8px]">자동 번역</span>
                                </div>
                                <div className="font-medium text-white text-[10.5px]">{translatedRejection}</div>
                                <div className="text-[9px] text-rose-300/70 border-t border-rose-500/20 pt-0.5">
                                  한국어 원문: {p.rejectionReason}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab: Equipment Usage Request (Request #7) */}
                {activeTab === 'equipment_use' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-400" />
                        기기/장비 사용 승인 요청 (지게차, 고소작업대 등)
                      </div>
                      <span className="badge badge-blue text-[9px] font-bold">16개국어 모국어 작성</span>
                    </div>

                    <div className="p-2 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[10.5px] text-blue-200">
                      🌐 <strong>모국어 작성 가능:</strong> 작업 목적을 국적 언어로 작성하시면 관리자에게 한국어로 자동 번역되어 전달됩니다.
                    </div>

                    <form onSubmit={handleEquipmentUseSubmit} className="space-y-2.5 bg-[#1C1C1E] p-3 rounded-2xl border border-white/10">
                      <div>
                        <label className="text-[11px] text-gray-300 block mb-1">사용 대상 기기 *</label>
                        <select
                          value={equipmentUseForm.equipmentType}
                          onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, equipmentType: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-xs text-white"
                        >
                          {equipmentTypes.map((type) => {
                            const transType = translationService.translateInstruction(type, selectedLang);
                            return (
                              <option key={type} value={type} className="bg-gray-900 text-white">
                                {selectedLang !== 'ko' && transType !== type ? `${transType} (${type})` : type}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-300 block mb-1">
                          사용 목적 (모국어 작성 가능) *
                        </label>
                        <input
                          type="text"
                          required
                          value={equipmentUseForm.purpose}
                          onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, purpose: e.target.value })}
                          placeholder="예: A동 프레스 금형 부품 하역 (모국어로 작성)"
                          className="w-full bg-black/50 border border-white/15 rounded-xl p-2 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">사용 시작</label>
                          <input
                            type="text"
                            value={equipmentUseForm.startTime}
                            onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, startTime: e.target.value })}
                            className="w-full bg-black/50 border border-white/15 rounded-xl p-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">사용 종료</label>
                          <input
                            type="text"
                            value={equipmentUseForm.endTime}
                            onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, endTime: e.target.value })}
                            className="w-full bg-black/50 border border-white/15 rounded-xl p-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-300">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={equipmentUseForm.hasLicense}
                            onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, hasLicense: e.target.checked })}
                            className="rounded"
                          />
                          <span>면허/조종자격 확인</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={equipmentUseForm.preCheckCompleted}
                            onChange={(e) => setEquipmentUseForm({ ...equipmentUseForm, preCheckCompleted: e.target.checked })}
                            className="rounded"
                          />
                          <span>작업 전 사전점검 완료</span>
                        </label>
                      </div>

                      <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5 rounded-xl bg-[#0071E3]">
                        관리자에게 기기 사용 승인 요청
                      </button>
                    </form>

                    {/* Usage Request Histories */}
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-bold block">
                          기기 승인 내역:
                        </span>
                        <span className="text-[10px] text-blue-400 font-semibold">실시간 동기화</span>
                      </div>
                      {equipmentUsageLogs.map((log) => {
                        const isApproved = log.status === 'APPROVED';
                        const isRejected = log.status === 'REJECTED';
                        const transEqType = /[가-힣]/.test(log.equipmentType)
                          ? translationService.translateInstruction(log.equipmentType, selectedLang)
                          : log.equipmentType;
                        const transPurpose = /[가-힣]/.test(log.purpose)
                          ? translationService.translateInstruction(log.purpose, selectedLang)
                          : log.purpose;
                        const translatedReject = log.rejectReason
                          ? translationService.translateInstruction(log.rejectReason, selectedLang)
                          : '';

                        return (
                          <div
                            key={log.id}
                            className={`p-2.5 rounded-xl text-[11px] space-y-1 border ${
                              isApproved
                                ? 'bg-emerald-950/30 border-emerald-500/30'
                                : isRejected
                                ? 'bg-rose-950/30 border-rose-500/30'
                                : 'bg-[#1C1C1E] border-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>[{transEqType}]</span>
                                  <span className="text-gray-300 font-normal">{transPurpose}</span>
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {log.startTime} ~ {log.endTime}
                                </div>
                              </div>
                              <span
                                className={`badge ${
                                  isApproved
                                    ? 'badge-green'
                                    : isRejected
                                    ? 'badge-red'
                                    : 'badge-amber'
                                }`}
                              >
                                {isApproved ? '✅ 승인완료' : isRejected ? '❌ 반려' : '⏳ 승인대기'}
                              </span>
                            </div>
                            {isApproved && (
                              <div className="text-[9.5px] text-emerald-300">
                                승인자: {log.approvedBy || '관리자'} ({log.approvedAt ? new Date(log.approvedAt).toLocaleTimeString() : '승인완료'})
                              </div>
                            )}
                            {isRejected && log.rejectReason && (
                              <div className="p-2 bg-rose-500/15 border border-rose-500/30 rounded-lg space-y-0.5 text-rose-200">
                                <div className="flex items-center justify-between text-[9px] font-bold text-rose-300">
                                  <span>관리자 반려 사유 (모국어 자동 번역):</span>
                                  <span className="badge badge-red text-[8px]">자동 번역</span>
                                </div>
                                <div className="font-medium text-white text-[10.5px]">{translatedReject}</div>
                                <div className="text-[9px] text-rose-300/70 border-t border-rose-500/20 pt-0.5">
                                  한국어 원문: {log.rejectReason}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab: Smart Checklist Inspection (Request #6) */}
                {activeTab === 'inspect' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-purple-400" />
                        설비 일일 점검 일지 (모국어 안내)
                      </div>
                      <span className="badge badge-purple text-[9px] font-bold">16개국어 번역 연동</span>
                    </div>

                    <div className="p-2 bg-purple-950/40 border border-purple-500/30 rounded-xl text-[10.5px] text-purple-200">
                      🌐 <strong>모국어 안내:</strong> 점검 대상 설비 및 측정 기준치가 {langInfo.flag} {langInfo.nativeName} 모국어로 자동 번역되어 표시됩니다.
                    </div>

                    {/* Synced with Admin Target List */}
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1 font-semibold">
                        점검 대상 설비 선택 ({langInfo.flag} 모국어 번역)
                      </label>
                      <select
                        value={selectedInspectTarget}
                        onChange={(e) => setSelectedInspectTarget(e.target.value)}
                        className="w-full bg-[#1C1C1E] border border-white/15 rounded-xl p-2.5 text-xs text-white"
                      >
                        {inspectionTargets.map((target) => {
                          const trans = translationService.translateInspectionTarget(target, selectedLang);
                          return (
                            <option key={target.id} value={target.id} className="bg-gray-900 text-white">
                              {trans.name} ({trans.location})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <form onSubmit={handleInspectionSubmit} className="space-y-3 bg-[#1C1C1E] p-3.5 rounded-2xl border border-white/10">
                      <div>
                        <label className="text-[11px] text-gray-300 block mb-1">
                          {translationService.translateInstruction('가열 온도 (°C) - 기준치 130°C 초과 시 즉시 경보 발령', selectedLang)}
                        </label>
                        <input
                          type="number"
                          value={inspectData.temperature}
                          onChange={(e) =>
                            setInspectData({ ...inspectData, temperature: Number(e.target.value) })
                          }
                          className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono text-base font-bold text-amber-300"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-gray-300 block mb-1">
                          {translationService.translateInstruction('공급 압력 (bar)', selectedLang)}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={inspectData.pressure}
                          onChange={(e) =>
                            setInspectData({ ...inspectData, pressure: Number(e.target.value) })
                          }
                          className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white font-mono"
                        />
                      </div>

                      <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5 rounded-xl">
                        점검 완료 및 관리자 웹 전송
                      </button>
                    </form>
                  </div>
                )}

                {/* Tab: Before & After Report (Request #4: 자동기입, 사진올리기, 문제점/개선이후 설명) */}
                {activeTab === 'report' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-400" />
                        Before & After 사진 작업 완료 보고서
                      </div>
                      <span className="badge badge-green text-[9px] font-bold">16개국어 모국어 작성</span>
                    </div>

                    <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[10.5px] text-emerald-200">
                      🌐 <strong>모국어 작성 가능:</strong> 사진 설명 및 Before/After 문제점을 모국어로 작성하시면 관리자에게 한국어로 자동 번역되어 전달됩니다.
                    </div>

                    <form onSubmit={handleReportSubmit} className="space-y-2.5 bg-[#1C1C1E] p-3 rounded-2xl border border-white/10">
                      {/* Auto-filled fields */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="text-gray-400 block mb-0.5">작업명 (모국어 입력 가능)</label>
                          <input
                            type="text"
                            value={reportForm.taskName}
                            onChange={(e) => setReportForm({ ...reportForm, taskName: e.target.value })}
                            placeholder="예: 금형 수리 (모국어로 작성)"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-white text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 block mb-0.5">작업자 (자동 기입)</label>
                          <input
                            type="text"
                            readOnly
                            value={reportForm.workerName}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-emerald-300 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 block mb-0.5">작업일 (자동 기입)</label>
                          <input
                            type="text"
                            readOnly
                            value={reportForm.workDate}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-gray-300 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 block mb-0.5">작업 위치 (모국어 입력 가능)</label>
                          <input
                            type="text"
                            value={reportForm.location}
                            onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                            placeholder="예: 2공장 성형실 (모국어로 작성)"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-white text-xs"
                          />
                        </div>
                      </div>

                      {/* Before Photos & Problem Description (Request #4) */}
                      <div className="p-2.5 bg-red-950/20 rounded-xl border border-red-500/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-red-400 font-bold">
                          <span>BEFORE (작업 전 사진)</span>
                          <span className="text-[9px] text-gray-400">사진 등록 가능</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <img
                              src={reportForm.beforeImg1}
                              alt="Before 1"
                              className="h-16 w-full object-cover rounded-lg border border-red-500/40"
                            />
                            <label className="absolute bottom-1 right-1 p-1 bg-black/70 rounded text-[9px] cursor-pointer hover:bg-black">
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
                              className="h-16 w-full object-cover rounded-lg border border-red-500/40"
                            />
                            <label className="absolute bottom-1 right-1 p-1 bg-black/70 rounded text-[9px] cursor-pointer hover:bg-black">
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
                          <label className="text-[10.5px] text-red-300 font-medium block mb-0.5">
                            Before 문제점에 대한 설명 (모국어 작성 가능) *
                          </label>
                          <textarea
                            rows={2}
                            value={reportForm.beforeDescription}
                            onChange={(e) => setReportForm({ ...reportForm, beforeDescription: e.target.value })}
                            className="w-full bg-black/50 border border-red-500/30 rounded-lg p-1.5 text-white text-[11px]"
                            placeholder="작업 전 파손, 누설, 마모 등 문제점을 모국어로 기재하세요."
                          />
                        </div>
                      </div>

                      {/* After Photos & Improvement Description (Request #4) */}
                      <div className="p-2.5 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                          <span>AFTER (작업 후 사진)</span>
                          <span className="text-[9px] text-gray-400">사진 등록 가능</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <img
                              src={reportForm.afterImg1}
                              alt="After 1"
                              className="h-16 w-full object-cover rounded-lg border border-emerald-500/40"
                            />
                            <label className="absolute bottom-1 right-1 p-1 bg-black/70 rounded text-[9px] cursor-pointer hover:bg-black">
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
                              className="h-16 w-full object-cover rounded-lg border border-emerald-500/40"
                            />
                            <label className="absolute bottom-1 right-1 p-1 bg-black/70 rounded text-[9px] cursor-pointer hover:bg-black">
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
                          <label className="text-[10.5px] text-emerald-300 font-medium block mb-0.5">
                            After 개선이후 설명 (모국어 작성 가능) *
                          </label>
                          <textarea
                            rows={2}
                            value={reportForm.afterDescription}
                            onChange={(e) => setReportForm({ ...reportForm, afterDescription: e.target.value })}
                            className="w-full bg-black/50 border border-emerald-500/30 rounded-lg p-1.5 text-white text-[11px]"
                            placeholder="개선 완료 사항 및 안전 조치 내용을 모국어로 기재하세요."
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary w-full justify-center text-xs py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        작업완료 보고서 전송
                      </button>
                    </form>
                  </div>
                )}

                {/* Tab: QR Scanner Simulator */}
                {activeTab === 'qr' && (
                  <div className="space-y-3 text-xs">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-blue-400" />
                      스마트폰 QR 스캐너 시뮬레이션
                    </div>

                    <div className="p-3 bg-black/50 border border-dashed border-white/20 rounded-2xl text-center space-y-2">
                      <Camera className="w-8 h-8 text-blue-400 mx-auto" />
                      <p className="text-[11px] text-gray-400">
                        공장 설비 및 약품 용기의 QR 코드를 스캔하세요.
                      </p>
                      <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                        {equipmentList.map((eq) => (
                          <button
                            key={eq.id}
                            onClick={() => setScannedEquipment(eq)}
                            className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/30 text-[10px] px-2 py-1 rounded-lg"
                          >
                            [{eq.type}] {eq.name.slice(0, 10)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {scannedEquipment && (
                      <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">
                            {translationService.translateInstruction(scannedEquipment.name, selectedLang)}
                          </span>
                          <span className="badge badge-amber">{scannedEquipment.type}</span>
                        </div>

                        <div className="p-2.5 bg-black/40 rounded-xl text-[11px] text-amber-200 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>{langInfo.flag} 모국어 작업자 주의사항:</span>
                          </div>
                          <p className="text-white font-medium leading-relaxed">
                            {translationService.translateInstruction(scannedEquipment.cautionNotes, selectedLang)}
                          </p>
                          <div className="text-[10px] text-gray-400">🇰🇷 한국어 원문: {scannedEquipment.cautionNotes}</div>
                        </div>

                        <div className="p-2.5 bg-black/40 rounded-xl text-[11px] text-blue-200 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                            <span>
                              {langInfo.flag} {scannedEquipment.type === 'MSDS' ? '모국어 응급조치 요령:' : '모국어 LOTO 및 비상조치:'}
                            </span>
                          </div>
                          <p className="text-white font-medium leading-relaxed">
                            {translationService.translateInstruction(scannedEquipment.emergencyProcedures, selectedLang)}
                          </p>
                          <div className="text-[10px] text-gray-400">🇰🇷 한국어 원문: {scannedEquipment.emergencyProcedures}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Mobile Tab Bar */}
          {isLoggedIn && (
            <div className="h-14 bg-[#1C1C1E] border-t border-white/10 flex items-center justify-around px-2 text-gray-400">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-0.5 ${
                  activeTab === 'home' ? 'text-blue-400 font-bold' : 'hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px]">홈</span>
              </button>
              <button
                onClick={() => setActiveTab('tbm')}
                className={`flex flex-col items-center gap-0.5 ${
                  activeTab === 'tbm' ? 'text-blue-400 font-bold' : 'hover:text-white'
                }`}
              >
                <FileSignature className="w-4 h-4" />
                <span className="text-[10px]">TBM서명</span>
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`flex flex-col items-center gap-0.5 ${
                  activeTab === 'education' ? 'text-emerald-400 font-bold' : 'hover:text-white'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px]">교안서명</span>
              </button>
              <button
                onClick={() => setActiveTab('equipment_use')}
                className={`flex flex-col items-center gap-0.5 ${
                  activeTab === 'equipment_use' ? 'text-blue-400 font-bold' : 'hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className="text-[10px]">기기신청</span>
              </button>
              <button
                onClick={() => setActiveTab('inspect')}
                className={`flex flex-col items-center gap-0.5 ${
                  activeTab === 'inspect' ? 'text-blue-400 font-bold' : 'hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-[10px]">설비점검</span>
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex flex-col items-center gap-0.5 ${
                  activeTab === 'report' ? 'text-blue-400 font-bold' : 'hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="text-[10px]">사진보고</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
