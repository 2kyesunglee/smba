'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { MultiLanguageTranslationService, SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';
import { SafetyMaterial, PushHistoryItem } from '@/infrastructure/storage/LocalStateStore';
import {
  ShieldAlert,
  Send,
  FileSignature,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Smartphone,
  Languages,
  Clock,
  Radio,
  Plus,
  Trash2,
  FileText,
  Upload,
  Pencil,
  X,
  Users,
  Check,
  Download,
} from 'lucide-react';

export const SafetyHealthView: React.FC = () => {
  const {
    workers,
    ptwList,
    sosList,
    safetyMaterials,
    pushHistories,
    approvePTW,
    rejectPTW,
    resolveSOS,
    addSafetyMaterial,
    deleteSafetyMaterial,
    signSafetyMaterial,
    addPushHistory,
    updatePushHistory,
    deletePushHistory,
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  // Tab State: Safety Education is now first (left-most)
  const [activeSection, setActiveSection] = useState<'education' | 'tbm' | 'instruction' | 'ptw' | 'sos'>('education');

  // Push Instruction State
  const [instructionText, setInstructionText] = useState('오늘 스크러버 배관 용접 작업 주의');
  const [targetWorkerId, setTargetWorkerId] = useState('ALL');
  const [previewLanguage, setPreviewLanguage] = useState('vi');
  const [pushSentMessage, setPushSentMessage] = useState<string | null>(null);

  // Push History Edit Modal State
  const [editingPush, setEditingPush] = useState<PushHistoryItem | null>(null);

  // PTW Reject Modal State
  const [rejectingPtwId, setRejectingPtwId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Material Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [materialUploadType, setMaterialUploadType] = useState<'SAFETY_EDUCATION' | 'TBM'>('SAFETY_EDUCATION');
  const [newMaterialForm, setNewMaterialForm] = useState({
    title: '',
    category: '정기안전교육',
    fileName: '안전보건교육교안.pdf',
    fileSize: '3.4 MB',
    description: '',
    targetDepartment: '전 생산라인 및 정비팀',
  });

  // Reading & Signing Modal State
  const [readingMaterial, setReadingMaterial] = useState<SafetyMaterial | null>(null);
  const [signingWorkerId, setSigningWorkerId] = useState<string>(workers[0]?.id || 'w-1');
  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Signatures View Modal
  const [viewingSignaturesMaterial, setViewingSignaturesMaterial] = useState<SafetyMaterial | null>(null);

  // Handle Push Send
  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructionText) return;

    const targetDesc =
      targetWorkerId === 'ALL'
        ? '전체 현장 근로자 (17개국 25명 동시 발송)'
        : workers.find((w) => w.id === targetWorkerId)
        ? `${workers.find((w) => w.id === targetWorkerId)?.name} (${workers.find((w) => w.id === targetWorkerId)?.nationality})`
        : '지정 근로자';

    const newPushItem: PushHistoryItem = {
      id: 'push-' + Date.now(),
      sentAt: new Date().toLocaleString(),
      target: targetDesc,
      targetWorkerId,
      instructionText,
      status: 'DELIVERED',
    };

    addPushHistory(newPushItem);
    setPushSentMessage(`[푸시 발송 성공] "${instructionText}" 내용이 하단 발송 이력에 기록되고 16개국 모국어로 푸시 전송되었습니다.`);
    setTimeout(() => setPushSentMessage(null), 5000);
  };

  // Handle Push History Edit Submit
  const handleSaveEditPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPush) return;
    updatePushHistory(editingPush.id, editingPush);
    setEditingPush(null);
    alert('푸시 알림 이력이 성공적으로 수정되었습니다.');
  };

  // Handle PTW Reject
  const handleConfirmReject = () => {
    if (rejectingPtwId && rejectReason) {
      rejectPTW(rejectingPtwId, rejectReason);
      setRejectingPtwId(null);
      setRejectReason('');
    }
  };

  // Handle PDF Material Upload
  const handleMaterialUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialForm.title) {
      alert('교안 제목을 입력해주세요.');
      return;
    }

    const item: SafetyMaterial = {
      id: 'mat-' + Date.now(),
      type: materialUploadType,
      title: newMaterialForm.title,
      category: newMaterialForm.category,
      fileName: newMaterialForm.fileName,
      fileSize: newMaterialForm.fileSize,
      description: newMaterialForm.description || '산업안전보건법 기준 현장 작업자 필수 이수 교안',
      targetDepartment: newMaterialForm.targetDepartment,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: '김공장장 (안전총괄)',
      signatures: [],
    };

    addSafetyMaterial(item);
    setIsUploadModalOpen(false);
    setNewMaterialForm({
      title: '',
      category: materialUploadType === 'SAFETY_EDUCATION' ? '정기안전교육' : '위험공정 TBM',
      fileName: '안전보건교육교안.pdf',
      fileSize: '3.4 MB',
      description: '',
      targetDepartment: '전 생산라인 및 정비팀',
    });
    alert(`[PDF 교안 등록 완료] ${item.title} 파일이 성공적으로 등록되었습니다.`);
  };

  // Canvas Handlers for Worker Signature
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

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Complete Signature Submission
  const handleCompleteMaterialSignature = () => {
    if (!readingMaterial) return;
    const w = workers.find((item) => item.id === signingWorkerId) || workers[0];
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : undefined;

    signSafetyMaterial(readingMaterial.id, {
      id: 'sig-' + Date.now(),
      workerId: w.id,
      workerName: w.name,
      nationality: w.nationality,
      signedAt: new Date().toLocaleString(),
      signatureDataUrl: dataUrl,
    });

    alert(`[열람 및 서명 완료] ${w.name} 근로자의 서명이 안전 교안에 등록되었습니다.`);
    setReadingMaterial(null);
    setHasSigned(false);
  };

  const translatedPreview = translationService.translateInstruction(instructionText, previewLanguage);

  const educationMaterials = safetyMaterials.filter((m) => m.type === 'SAFETY_EDUCATION');
  const tbmMaterials = safetyMaterials.filter((m) => m.type === 'TBM');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-amber-500" />
            현장 안전 및 보건 관리 (Safety & Health)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            안전교육 PDF 교안 관리 및 서명, 작업 전 TBM 전자서명 아카이브, 17개국 다국어 업무 지시 및 PTW 심사
          </p>
        </div>

        {/* Quick action buttons depending on active tab */}
        {(activeSection === 'education' || activeSection === 'tbm') && (
          <button
            onClick={() => {
              setMaterialUploadType(activeSection === 'education' ? 'SAFETY_EDUCATION' : 'TBM');
              setIsUploadModalOpen(true);
            }}
            className="btn-primary shadow-lg shadow-blue-500/20 text-xs px-4 py-2.5 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{activeSection === 'education' ? '신규 안전교육 PDF 교안 등록' : '신규 TBM PDF 교안 등록'}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs (Enlarged and Re-ordered: Education first, TBM second, Push third, PTW fourth, SOS fifth) */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
        {/* Tab 1: 안전교육 교안 & 서명 (Left-most) */}
        <button
          onClick={() => setActiveSection('education')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeSection === 'education'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>안전교육 교안 & 서명</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeSection === 'education' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {educationMaterials.length}건
          </span>
        </button>

        {/* Tab 2: TBM & 서명 */}
        <button
          onClick={() => setActiveSection('tbm')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeSection === 'tbm'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          <span>TBM & 서명</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeSection === 'tbm' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {tbmMaterials.length}건
          </span>
        </button>

        {/* Tab 3: 다국어 업무지시 및 푸시 알림 */}
        <button
          onClick={() => setActiveSection('instruction')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeSection === 'instruction'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>다국어 업무지시 및 푸시 알림</span>
        </button>

        {/* Tab 4: 안전작업허가서(PTW) 심사 */}
        <button
          onClick={() => setActiveSection('ptw')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeSection === 'ptw'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>안전작업허가서(PTW) 심사</span>
          {ptwList.filter((p) => p.status === 'REQUESTED').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
              {ptwList.filter((p) => p.status === 'REQUESTED').length}건
            </span>
          )}
        </button>

        {/* Tab 5: SOS 비상호출 이력 */}
        <button
          onClick={() => setActiveSection('sos')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeSection === 'sos'
              ? 'bg-red-600 text-white shadow-md shadow-red-500/20 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>SOS 비상호출 이력</span>
          {sosList.filter((s) => s.status === 'TRIGGERED').length > 0 && (
            <span className="bg-yellow-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-extrabold animate-pulse">
              긴급 {sosList.filter((s) => s.status === 'TRIGGERED').length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          Tab 1: 안전교육 교안 & 서명 (PDF 업로드/삭제 및 열람/서명 아카이브)
          ========================================================================= */}
      {activeSection === 'education' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  관리자 안전교육 PDF 교안 등록 및 근로자 서명 보관 관리
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  관리자는 안전보건교육 자료를 PDF 파일로 업로드/삭제할 수 있으며, 근로자가 열람 후 서명한 기록이 실시간 아카이빙됩니다.
                </p>
              </div>
              <span className="badge badge-blue">산업안전보건법 제29조 교육 증빙</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {educationMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-purple">{mat.category}</span>
                      <span className="text-xs text-slate-400 font-medium">등록일: {mat.uploadedAt}</span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 leading-snug">{mat.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{mat.description}</p>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>{mat.fileName}</span>
                        <span className="text-slate-400 font-normal">({mat.fileSize})</span>
                      </div>
                      <span className="text-blue-600 text-xs font-semibold">PDF 원본</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">대상 공정: <strong className="text-slate-800">{mat.targetDepartment}</strong></span>
                      <span className="badge badge-green font-bold">
                        서명 완료: {mat.signatures.length}명
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingSignaturesMaterial(mat)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>서명자 명부 ({mat.signatures.length})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReadingMaterial(mat);
                          clearCanvas();
                        }}
                        className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>교안 열람 및 서명</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`"${mat.title}" 교안을 삭제하시겠습니까?`)) {
                            deleteSafetyMaterial(mat.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="교안 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Tab 2: TBM & 서명 (작업 전 안전점검 PDF 업로드/삭제 및 서명 보관)
          ========================================================================= */}
      {activeSection === 'tbm' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-emerald-600" />
                  작업 전 안전점검(TBM) PDF 교안 및 전자서명 아카이브
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  관리자가 공정별 TBM 위험성평가 교육자료를 PDF로 업로드/삭제하고, 작업자가 작업 착수 전 숙지 후 서명한 증빙을 영구 보관합니다.
                </p>
              </div>
              <span className="badge badge-green">중대재해처벌법 TBM 표준 이수 대장</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tbmMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-amber">{mat.category}</span>
                      <span className="text-xs text-slate-400 font-medium">TBM 일자: {mat.uploadedAt}</span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 leading-snug">{mat.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{mat.description}</p>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>{mat.fileName}</span>
                        <span className="text-slate-400 font-normal">({mat.fileSize})</span>
                      </div>
                      <span className="text-emerald-700 text-xs font-semibold">TBM PDF</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">대상 공정: <strong className="text-slate-800">{mat.targetDepartment}</strong></span>
                      <span className="badge badge-green font-bold">
                        서명 확인: {mat.signatures.length}명
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingSignaturesMaterial(mat)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>서명자 명부 ({mat.signatures.length})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReadingMaterial(mat);
                          clearCanvas();
                        }}
                        className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>TBM 열람 및 서명</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`"${mat.title}" TBM 교안을 삭제하시겠습니까?`)) {
                            deleteSafetyMaterial(mat.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="TBM 교안 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Tab 3: 다국어 업무 지시 및 푸시 알림 + 하단 발송 이력 관리 (Item #10)
          ========================================================================= */}
      {activeSection === 'instruction' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Push Sending Form */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">한국어 작업 지시 작성 및 즉시 푸시 발송</h3>
              </div>

              <form onSubmit={handleSendPush} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    수신 대상 근로자 선택
                  </label>
                  <select
                    value={targetWorkerId}
                    onChange={(e) => setTargetWorkerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="ALL">전체 현장 근로자 (17개국 25명 동시 발송)</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.koreanName || w.nationality}) - {w.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    지시 사항 입력 (한국어)
                  </label>
                  <textarea
                    rows={4}
                    value={instructionText}
                    onChange={(e) => setInstructionText(e.target.value)}
                    placeholder="예: 오늘 스크러버 배관 용접 작업 주의, 화재 감시자 1인 상주 필수"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
                  🌐 관리자가 한국어로 입력하면 번역 엔진이 각 근로자의 인사기록카드 국적에 맞추어 16개국 모국어로 즉시 변환하여 스마트폰 앱에 푸시 전송합니다.
                </div>

                <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5">
                  <Send className="w-4 h-4" />
                  다국어 푸시 알림 즉시 발송
                </button>

                {pushSentMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{pushSentMessage}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Right: Real-time Translation Preview Box */}
            <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-base">근로자 앱 수신 화면 실시간 프리뷰</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">언어:</span>
                    <select
                      value={previewLanguage}
                      onChange={(e) => setPreviewLanguage(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                    >
                      {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'ko').map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name} ({l.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Smartphone Mockup */}
                <div className="mt-4 mx-auto max-w-sm bg-slate-900 border-4 border-slate-700 rounded-3xl p-4 shadow-xl text-white">
                  <div className="w-20 h-3 bg-slate-700 rounded-full mx-auto mb-3"></div>

                  <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 shadow-md space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-blue-400 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        SafeGuard PUSH ALERT
                      </span>
                      <span>방금 전</span>
                    </div>

                    <div className="font-bold text-white text-xs">
                      {translationService.getLanguageInfo(previewLanguage).flag}{' '}
                      {translationService.getLanguageInfo(previewLanguage).nativeName} 번역 알림
                    </div>

                    <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs text-blue-200 leading-relaxed font-sans">
                      {translatedPreview}
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                      원문 (한국어): {instructionText}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-400 font-medium">
                * 근로자 모바일 뷰어 시뮬레이터에서도 동일한 번역 콘텐츠를 확인할 수 있습니다.
              </div>
            </div>
          </div>

          {/* Bottom: 푸시 알림 발송 이력 관리 (Item #10 - 리스트, 수정, 삭제) */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  푸시 알림 발송 이력 관리 (수정 및 삭제 가능)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  발송된 다국어 푸시 알림 내역을 조회하고, 내용을 수정하거나 삭제할 수 있습니다.
                </p>
              </div>
              <span className="badge badge-blue">누적 {pushHistories.length}건 발송됨</span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>발송 일시</th>
                    <th>수신 대상</th>
                    <th>지시사항 내용 (한국어 원문)</th>
                    <th>상태</th>
                    <th className="text-right">관리 작업</th>
                  </tr>
                </thead>
                <tbody>
                  {pushHistories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                        발송된 푸시 알림 이력이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pushHistories.map((h) => (
                      <tr key={h.id}>
                        <td className="font-mono text-xs text-slate-600 whitespace-nowrap">{h.sentAt}</td>
                        <td className="text-xs font-semibold text-slate-800">{h.target}</td>
                        <td className="text-xs text-slate-700 max-w-md">
                          <p className="line-clamp-2">{h.instructionText}</p>
                        </td>
                        <td>
                          <span className="badge badge-green text-[10px]">
                            <Check className="w-3 h-3" /> 발송 완료
                          </span>
                        </td>
                        <td className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingPush({ ...h })}
                              className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600" />
                              <span>수정</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('이 푸시 알림 이력을 삭제하시겠습니까?')) {
                                  deletePushHistory(h.id);
                                }
                              }}
                              className="btn-secondary text-xs py-1 px-2.5 text-red-600 hover:border-red-300 hover:bg-red-50 flex items-center gap-1 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>삭제</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Tab 4: 안전작업허가서(PTW) 심사
          ========================================================================= */}
      {activeSection === 'ptw' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-500" />
                  모바일 안전작업허가서(PTW) 심사 및 승인 관리
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  근로자가 작업 착수 전 모바일 앱에서 안전수칙 확인 및 서명 요청한 건을 관리자가 심사하여 승인/반려합니다.
                </p>
              </div>
              <span className="badge badge-amber font-mono font-bold">
                승인 대기: {ptwList.filter((p) => p.status === 'REQUESTED').length}건
              </span>
            </div>

            <div className="space-y-4">
              {ptwList.map((ptw) => (
                <div
                  key={ptw.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ptw.status === 'REQUESTED'
                      ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                      : ptw.status === 'APPROVED'
                      ? 'bg-white border-slate-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        {ptw.ptwNumber}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base">{ptw.taskName}</h4>
                    </div>

                    <div>
                      {ptw.status === 'REQUESTED' && (
                        <span className="badge badge-amber animate-pulse font-bold">승인 심사 대기</span>
                      )}
                      {ptw.status === 'APPROVED' && (
                        <span className="badge badge-green font-bold">작업 허가 발급완료</span>
                      )}
                      {ptw.status === 'REJECTED' && (
                        <span className="badge badge-red font-bold">작업 불허 (반려)</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 font-semibold block mb-1">작업자 및 위치</span>
                      <div className="font-bold text-slate-900">{ptw.workerName}</div>
                      <div className="text-slate-600">{ptw.location}</div>
                    </div>

                    <div className="p-3 bg-red-50/60 rounded-lg border border-red-200">
                      <span className="text-red-700 font-semibold block mb-1">위험 요인 (Hazard)</span>
                      <div className="text-red-900 font-medium">{ptw.hazardFactors}</div>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                      <span className="text-emerald-700 font-semibold block mb-1">안전 대책 (Safety Measures)</span>
                      <div className="text-emerald-900 font-medium">{ptw.safetyMeasures}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500 font-medium">
                    <div>
                      근로자 모바일 서명일시: {new Date(ptw.workerSignedAt || '').toLocaleString()}
                      {ptw.approvedBy && (
                        <span className="ml-3 text-emerald-700 font-bold">
                          승인자: {ptw.approvedBy} ({new Date(ptw.approvedAt || '').toLocaleTimeString()})
                        </span>
                      )}
                    </div>

                    {ptw.status === 'REQUESTED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRejectingPtwId(ptw.id);
                            setRejectReason('현장 환기장치 미비로 인한 보완 후 재요청');
                          }}
                          className="btn-danger text-xs py-1.5 px-3"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          반려 처리
                        </button>
                        <button
                          onClick={() => approvePTW(ptw.id)}
                          className="btn-primary text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          최종 작업허가 승인
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Tab 5: SOS 비상 호출 이력
          ========================================================================= */}
      {activeSection === 'sos' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-600" />
                  SOS 비상 호출 수신 및 현장 조치 이력
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  앱 상시 SOS 버튼 클릭 시 관리자 웹 대시보드 경보음 및 위치 정보가 전송됩니다.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sosList.map((sos) => (
                <div
                  key={sos.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    sos.status === 'TRIGGERED'
                      ? 'bg-red-50 border-red-300 shadow-md shadow-red-500/10'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          sos.status === 'TRIGGERED' ? 'badge-red animate-pulse' : 'badge-green'
                        }`}
                      >
                        {sos.status === 'TRIGGERED' ? '긴급 상황 진행 중' : '조치 완료'}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">{sos.workerName}</span>
                      <span className="font-mono text-xs text-slate-500">({sos.phoneNumber})</span>
                    </div>
                    <div className="text-xs text-red-700 font-bold">
                      발생 구역: {sos.location}
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{sos.message}</p>
                    <div className="text-[11px] text-slate-400">
                      호출 시각: {new Date(sos.triggeredAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${sos.phoneNumber}`}
                      className="btn-secondary text-xs"
                    >
                      근로자 전화 통화
                    </a>
                    {sos.status === 'TRIGGERED' ? (
                      <button
                        onClick={() => resolveSOS(sos.id)}
                        className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        상황 확인 및 조치 완료
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold">조치 종결됨</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Modal: PDF Upload Modal (for Safety Education or TBM)
          ========================================================================= */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                {materialUploadType === 'SAFETY_EDUCATION'
                  ? '신규 안전교육 PDF 교안 등록'
                  : '신규 TBM(작업전안전점검) PDF 교안 등록'}
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaterialUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  교안 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    materialUploadType === 'SAFETY_EDUCATION'
                      ? '예: 2026 하반기 유해화학물질 취급 안전교육'
                      : '예: A동 고소 용접작업 전 TBM 교안'
                  }
                  value={newMaterialForm.title}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    교육/작업 분류
                  </label>
                  <input
                    type="text"
                    value={newMaterialForm.category}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    대상 공정/부서
                  </label>
                  <input
                    type="text"
                    value={newMaterialForm.targetDepartment}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, targetDepartment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  PDF 교안 파일 첨부 (PDF 업로드 지원) *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <FileText className="w-8 h-8 text-red-500 mx-auto mb-1.5" />
                  <div className="font-semibold text-slate-800">
                    {newMaterialForm.fileName} ({newMaterialForm.fileSize})
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    클릭하여 다른 PDF 교안 파일 선택 (최대 50MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  교안 내용 요약 및 서명 지침
                </label>
                <textarea
                  rows={2}
                  value={newMaterialForm.description}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, description: e.target.value })}
                  placeholder="작업자가 반드시 숙지해야 할 핵심 안전 수칙 요약"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  PDF 교안 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          Modal: PDF Reading & Digital Signature Modal (Worker Reads PDF and Signs)
          ========================================================================= */}
      {readingMaterial && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {readingMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setReadingMaterial(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated PDF Viewer Document */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 max-h-72 overflow-y-auto shadow-inner text-xs text-slate-800 leading-relaxed font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                <span>📄 [PDF 문서 뷰어] {readingMaterial.fileName}</span>
                <span>공식 안전지침서 (산업안전보건공단 표준)</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900">
                  【필수 준수 안전수칙 및 위험 예방 절차】
                </h4>
                <p>1. 모든 근로자는 작업 전 안전모 턱끈을 조이고 적격 보호구를 착용해야 합니다.</p>
                <p>2. 화기 및 배관 작업 시 작업 반경 5m 이내 소화설비 배치 및 환기 조치를 확인합니다.</p>
                <p>3. 이상 징후 또는 가스 누출 의심 시 즉시 작업을 중단하고 관리자에게 보고 후 대피합니다.</p>
                <p>4. 본 교안을 충분히 숙지하였으며, 위 안전수칙을 철저히 이행할 것을 서약합니다.</p>
              </div>

              <div className="text-[11px] text-blue-600 font-semibold text-center">
                위 교안의 내용을 모두 확인하였으며, 아래에 본인 성명 서명을 진행합니다.
              </div>
            </div>

            {/* Signature Area */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">서명 대상 근로자:</span>
                  <select
                    value={signingWorkerId}
                    onChange={(e) => setSigningWorkerId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-bold"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.koreanName || w.nationality})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">마우스 또는 터치 서명:</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-red-500 hover:underline text-xs font-semibold"
                  >
                    서명 지우기
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 overflow-hidden touch-none shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={580}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[130px] cursor-crosshair"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReadingMaterial(null)}
                className="btn-secondary text-xs"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleCompleteMaterialSignature}
                disabled={!hasSigned}
                className={`btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 ${
                  !hasSigned ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                교안 열람 및 전자서명 확인 제출
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Modal: Signatures View Modal (List of who signed this material)
          ========================================================================= */}
      {viewingSignaturesMaterial && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  교안 서명 확인 완료자 명부
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{viewingSignaturesMaterial.title}</p>
              </div>
              <button
                onClick={() => setViewingSignaturesMaterial(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {viewingSignaturesMaterial.signatures.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  아직 서명 완료된 근로자가 없습니다.
                </div>
              ) : (
                viewingSignaturesMaterial.signatures.map((sig) => (
                  <div key={sig.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <span>{sig.workerName}</span>
                        <span className="badge badge-purple text-[10px]">{sig.nationality}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        서명 일시: {sig.signedAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sig.signatureDataUrl ? (
                        <img
                          src={sig.signatureDataUrl}
                          alt="서명"
                          className="h-9 bg-slate-50 rounded border border-slate-200 px-2"
                        />
                      ) : (
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-mono font-bold rounded border border-emerald-200">
                          VERIFIED ✍️
                        </div>
                      )}
                      <span className="badge badge-green text-[10px]">확인 완료</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                총 {viewingSignaturesMaterial.signatures.length}명 서명 완료 보관 중
              </span>
              <button
                onClick={() => setViewingSignaturesMaterial(null)}
                className="btn-secondary text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Modal: Push History Edit Modal (Item #10)
          ========================================================================= */}
      {editingPush && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                푸시 알림 발송 이력 수정
              </h3>
              <button
                onClick={() => setEditingPush(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPush} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  발송 일시
                </label>
                <input
                  type="text"
                  value={editingPush.sentAt}
                  onChange={(e) => setEditingPush({ ...editingPush, sentAt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  수신 대상
                </label>
                <input
                  type="text"
                  value={editingPush.target}
                  onChange={(e) => setEditingPush({ ...editingPush, target: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  지시 사항 내용
                </label>
                <textarea
                  rows={3}
                  value={editingPush.instructionText}
                  onChange={(e) => setEditingPush({ ...editingPush, instructionText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPush(null)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  수정 사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject PTW Reason Modal */}
      {rejectingPtwId && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base text-red-600">
              안전작업허가서(PTW) 반려 사유 입력
            </h3>
            <p className="text-xs text-slate-600">
              작업자에게 전달될 반려 사유와 안전 보완 조치를 입력해주세요.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingPtwId(null)}
                className="btn-secondary text-xs"
              >
                취소
              </button>
              <button
                onClick={handleConfirmReject}
                className="btn-danger text-xs"
              >
                반려 처리 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

