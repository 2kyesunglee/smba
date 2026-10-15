'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { MultiLanguageTranslationService, SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';
import {
  Smartphone,
  X,
  ShieldAlert,
  AlertTriangle,
  FileSignature,
  FileCheck2,
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
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  // Current worker & language
  const currentWorker = workers.find((w) => w.id === activeWorkerId) || workers[0];
  const [selectedLang, setSelectedLang] = useState<string>(
    currentWorker.nationality.toLowerCase() === 'vn'
      ? 'vi'
      : currentWorker.nationality.toLowerCase() === 'mn'
      ? 'mn'
      : 'vi'
  );

  const [activeTab, setActiveTab] = useState<'home' | 'tbm' | 'ptw' | 'qr' | 'inspect' | 'report'>('home');

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // PTW Request State
  const [ptwForm, setPtwForm] = useState({
    taskName: '스크러버 배관 플랜지 조임 및 고소 점검',
    location: 'A동 화학탱크 상부 배관',
    hazardFactors: '추락 위험, 가스 누출 가능성',
    safetyMeasures: '안전대 2개소 체결, 가스측정기 휴대, 소화기 배치',
  });

  // Inspection Form State
  const [inspectData, setInspectData] = useState({
    temperature: 132, // intentionally triggers abnormal if above 130
    pressure: 2.5,
    steam_leak: '정상',
  });

  // Before/After Form State
  const [reportForm, setReportForm] = useState({
    taskName: '보일러실 배관 보온재 교체 및 청소',
    location: 'B동 보일러실',
    beforeImg: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
    afterImg: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    description: '노후 보온재 제거 후 난연성 글라스울 재시공 완료함.',
  });

  // Scanned QR result
  const [scannedEquipment, setScannedEquipment] = useState<any | null>(null);

  if (!isOpen) return null;

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
    const isAbnormal = inspectData.temperature > 130;
    const notes = isAbnormal ? `온도 기준치 초과 (${inspectData.temperature}°C > 130°C)` : '정상';
    submitInspection('eq-1', 'A동 렌더링 쿠커 #1', inspectData, isAbnormal, notes);
    alert(
      isAbnormal
        ? `⚠️ [주의] 온도가 기준치(130°C)를 초과하여 관리자 웹에 경고가 즉시 전송되었습니다.`
        : '설비 점검 데이터가 정상 등록되었습니다.'
    );
    setActiveTab('home');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWorkReport(
      reportForm.taskName,
      reportForm.location,
      reportForm.beforeImg,
      reportForm.afterImg,
      reportForm.description
    );
    alert('Before & After 작업 완료 보고서가 관리자 갤러리로 전송되었습니다.');
    setActiveTab('home');
  };

  return (
    <div className="modal-overlay">
      <div className="relative flex flex-col items-center max-w-sm w-full mx-auto">
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-black/50 rounded-full border border-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Worker & Language Top Selector Bar */}
        <div className="w-full bg-[#1F2937] p-2.5 rounded-t-2xl border border-white/10 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">근로자:</span>
            <select
              value={activeWorkerId}
              onChange={(e) => setActiveWorker(e.target.value)}
              className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-xs text-white"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.nationality})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-xs text-white"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Phone Mockup Body */}
        <div className="w-full h-[680px] bg-[#0A0E17] border-4 border-gray-700 rounded-b-3xl shadow-2xl overflow-hidden flex flex-col justify-between relative text-white">
          {/* Mobile Top Status Bar */}
          <div className="h-6 bg-black px-4 flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>09:41</span>
            <div className="w-14 h-3 bg-gray-800 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Floating SOS Button (PRD: 상시 노출 비상버튼) */}
          <button
            onClick={handleTriggerSOS}
            className="absolute bottom-16 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-sm shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center border-2 border-white/40 active:scale-90 transition-transform beacon-pulse"
            title="비상 상황 시 즉시 누르세요"
          >
            <Radio className="w-4 h-4 animate-ping" />
            <span className="text-[10px] tracking-tighter">SOS</span>
          </button>

          {/* Mobile App Header */}
          <div className="bg-[#111827] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xs font-bold leading-tight">SafeGuard Mobile</div>
                <div className="text-[10px] text-gray-400">
                  {currentWorker.name} ({currentWorker.visaType})
                </div>
              </div>
            </div>

            <span className="badge badge-green text-[10px]">계정 연동됨</span>
          </div>

          {/* Main App Content Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Tab: Home */}
            {activeTab === 'home' && (
              <div className="space-y-3">
                {/* Safety Warning Card */}
                <div className="p-3 bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold">
                    <span>
                      {translationService.getLanguageInfo(selectedLang).flag} 오늘의 현장 안전수칙
                    </span>
                    <span className="badge badge-amber text-[9px]">필독</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-semibold">
                    {translationService.translate('작업 전 안전점검을 반드시 실시하세요.', selectedLang)}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {translationService.translate('보호구(안전모, 안전화, 보안경) 착용 필수', selectedLang)}
                  </p>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('tbm')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-colors"
                  >
                    <FileSignature className="w-5 h-5 text-emerald-400" />
                    <div className="font-bold text-white">TBM 전자서명</div>
                    <div className="text-[10px] text-gray-400">작업 전 서명 이수</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('ptw')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-colors"
                  >
                    <FileCheck2 className="w-5 h-5 text-amber-400" />
                    <div className="font-bold text-white">작업허가서(PTW)</div>
                    <div className="text-[10px] text-gray-400">고소/화기 작업 신청</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('qr')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-colors"
                  >
                    <QrCode className="w-5 h-5 text-blue-400" />
                    <div className="font-bold text-white">QR LOTO/MSDS</div>
                    <div className="text-[10px] text-gray-400">카메라 스캔 확인</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('inspect')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-colors"
                  >
                    <ClipboardList className="w-5 h-5 text-purple-400" />
                    <div className="font-bold text-white">설비 일일 점검</div>
                    <div className="text-[10px] text-gray-400">온도/압력 모국어 입력</div>
                  </button>
                </div>

                {/* Before & After Photo Report Card */}
                <button
                  onClick={() => setActiveTab('report')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <div className="font-bold text-white">Before & After 작업 보고</div>
                      <div className="text-[10px] text-gray-400">작업 전/후 사진 필수 업로드</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>

                {/* LOTO Notice */}
                <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded-xl text-[11px] text-amber-200">
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

                <div className="p-3 bg-white/5 rounded-xl space-y-1 text-[11px] text-gray-300">
                  <div className="font-semibold text-white">작업명: 고소 및 배관 용접 작업</div>
                  <p>1. 안전모 및 안전그네 착용을 확인했습니다.</p>
                  <p>2. 소화기 2기 배치를 확인했습니다.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px] text-gray-400">
                    <span>터치 또는 마우스로 아래에 서명하세요:</span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-red-400 hover:underline"
                    >
                      다시 쓰기
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-400 overflow-hidden touch-none shadow-inner">
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
                  className={`btn-primary w-full justify-center text-xs ${
                    !hasSigned ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  전자서명 제출 (DB 영구 보관)
                </button>
              </div>
            )}

            {/* Tab: PTW Request */}
            {activeTab === 'ptw' && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  모바일 안전작업허가서(PTW) 신청
                </div>

                <form onSubmit={handleCreatePTWSubmit} className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-0.5">작업 명칭</label>
                    <input
                      type="text"
                      value={ptwForm.taskName}
                      onChange={(e) => setPtwForm({ ...ptwForm, taskName: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 block mb-0.5">작업 위치</label>
                    <input
                      type="text"
                      value={ptwForm.location}
                      onChange={(e) => setPtwForm({ ...ptwForm, location: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 block mb-0.5">위험 요인</label>
                    <input
                      type="text"
                      value={ptwForm.hazardFactors}
                      onChange={(e) => setPtwForm({ ...ptwForm, hazardFactors: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-xs">
                    허가 신청서 전송
                  </button>
                </form>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[11px] text-gray-400 font-bold block mb-1">
                    신청 이력 및 승인 상태:
                  </span>
                  {ptwList.map((p) => (
                    <div key={p.id} className="p-2 bg-white/5 rounded-lg text-[11px] mb-1.5 flex justify-between">
                      <div>
                        <div className="font-bold text-white">{p.taskName}</div>
                        <div className="text-gray-400">{p.location}</div>
                      </div>
                      <span className={`badge ${p.status === 'APPROVED' ? 'badge-green' : 'badge-amber'}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: QR Scanner Simulator */}
            {activeTab === 'qr' && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  스마트폰 QR 스캐너 시뮬레이션
                </div>

                <div className="p-3 bg-black/50 border border-dashed border-white/20 rounded-xl text-center space-y-2">
                  <Camera className="w-8 h-8 text-blue-400 mx-auto" />
                  <p className="text-[11px] text-gray-400">
                    공장 설비 및 약품 용기의 QR 코드를 스캔하세요.
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                    {equipmentList.map((eq) => (
                      <button
                        key={eq.id}
                        onClick={() => setScannedEquipment(eq)}
                        className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/30 text-[10px] px-2 py-1 rounded"
                      >
                        [{eq.type}] {eq.name.slice(0, 10)}...
                      </button>
                    ))}
                  </div>
                </div>

                {scannedEquipment && (
                  <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{scannedEquipment.name}</span>
                      <span className="badge badge-amber">{scannedEquipment.type}</span>
                    </div>

                    <div className="p-2 bg-black/40 rounded text-[11px] text-amber-200">
                      <strong>주의사항:</strong> {scannedEquipment.cautionNotes}
                    </div>

                    <div className="p-2 bg-black/40 rounded text-[11px] text-blue-200">
                      <strong>
                        {scannedEquipment.type === 'MSDS' ? '모국어 응급조치:' : 'LOTO 해제 절차:'}
                      </strong>
                      <p className="mt-0.5">{scannedEquipment.emergencyProcedures}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Smart Checklist Inspection */}
            {activeTab === 'inspect' && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                  설비 점검 일지 입력 (모국어 안내)
                </div>

                <div className="text-[11px] text-gray-300">
                  대상 설비: <strong>A동 렌더링 쿠커 #1</strong> (정상 기준 온도: 130°C 이하)
                </div>

                <form onSubmit={handleInspectionSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">
                      내부 가열 온도 (°C) - 130도 초과 시 자동 경고
                    </label>
                    <input
                      type="number"
                      value={inspectData.temperature}
                      onChange={(e) =>
                        setInspectData({ ...inspectData, temperature: Number(e.target.value) })
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-base font-bold text-amber-300"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">
                      증기 공급 압력 (bar)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inspectData.pressure}
                      onChange={(e) =>
                        setInspectData({ ...inspectData, pressure: Number(e.target.value) })
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-xs">
                    점검 완료 및 전송
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Before & After Report */}
            {activeTab === 'report' && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Before & After 사진 작업 보고
                </div>

                <form onSubmit={handleReportSubmit} className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-0.5">작업명</label>
                    <input
                      type="text"
                      value={reportForm.taskName}
                      onChange={(e) => setReportForm({ ...reportForm, taskName: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10 text-center">
                      <div className="text-[10px] text-red-400 font-bold mb-1">BEFORE 사진</div>
                      <img
                        src={reportForm.beforeImg}
                        alt="Before"
                        className="h-16 w-full object-cover rounded"
                      />
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10 text-center">
                      <div className="text-[10px] text-emerald-400 font-bold mb-1">AFTER 사진</div>
                      <img
                        src={reportForm.afterImg}
                        alt="After"
                        className="h-16 w-full object-cover rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-0.5">조치 내용</label>
                    <textarea
                      rows={2}
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-xs bg-emerald-600 hover:bg-emerald-500">
                    <Upload className="w-3.5 h-3.5" />
                    사진 보고서 관리자 전송
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Mobile Tab Bar */}
          <div className="h-14 bg-[#111827] border-t border-white/10 flex items-center justify-around px-2 text-gray-400">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'home' ? 'text-blue-400' : 'hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px]">홈</span>
            </button>
            <button
              onClick={() => setActiveTab('tbm')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'tbm' ? 'text-blue-400' : 'hover:text-white'
              }`}
            >
              <FileSignature className="w-4 h-4" />
              <span className="text-[10px]">TBM서명</span>
            </button>
            <button
              onClick={() => setActiveTab('ptw')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'ptw' ? 'text-blue-400' : 'hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span className="text-[10px]">작업허가</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'qr' ? 'text-blue-400' : 'hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[10px]">QR스캔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
