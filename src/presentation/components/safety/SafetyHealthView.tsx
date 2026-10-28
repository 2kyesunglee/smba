'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { MultiLanguageTranslationService, SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';
import { SafetyMaterial, PushHistoryItem, LocalStateStore } from '@/infrastructure/storage/LocalStateStore';
import { compressImageFile } from '@/infrastructure/utils/imageCompressor';
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
  Truck,
  UserCheck,
  UserX,
  Bell,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';

export const SafetyHealthView: React.FC = () => {
  const {
    workers,
    ptwList,
    sosList,
    safetyMaterials,
    pushHistories,
    equipmentUsageLogs,
    equipmentTypes,
    approvePTW,
    rejectPTW,
    resolveSOS,
    addSafetyMaterial,
    deleteSafetyMaterial,
    signSafetyMaterial,
    addPushHistory,
    updatePushHistory,
    deletePushHistory,
    approveEquipmentUsage,
    rejectEquipmentUsage,
    addEquipmentType,
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  // Tab State: safety sections
  const [activeSection, setActiveSection] = useState<'education' | 'tbm' | 'equipment_logs' | 'instruction' | 'ptw' | 'sos'>('education');

  // Push Instruction State (Request #3: 자유로운 버튼 형태 수신자 선택)
  const [instructionText, setInstructionText] = useState('오늘 스크러버 배관 용접 작업 주의. 안전그네 및 소화기 배치 필수.');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(['ALL']);
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
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newMaterialForm, setNewMaterialForm] = useState({
    title: '',
    category: '정기안전교육',
    fileName: '',
    fileSize: '',
    description: '',
    targetDepartment: '전 생산라인 및 정비팀',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr =
        file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : (file.size / 1024).toFixed(0) + ' KB';

      const defaultTitle = file.name.replace(/\.[^/.]+$/, '');
      setNewMaterialForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: sizeStr,
        title: prev.title ? prev.title : defaultTitle,
      }));

      // 이미지 파일인 경우 클라이언트 압축 적용하여 localStorage 용량 초과 방지
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImageFile(file, 1000, 0.7);
          setUploadedFileUrl(compressed);
          return;
        } catch {
          // fallback
        }
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedFileUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reading & Signing Modal State
  const [readingMaterial, setReadingMaterial] = useState<SafetyMaterial | null>(null);
  const [signingWorkerId, setSigningWorkerId] = useState<string>(workers[0]?.id || 'w-1');
  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Signatures View Modal (Request #5: 서명자리스트 / 미서명자리스트 & 엑셀다운로드)
  const [viewingSignaturesMaterial, setViewingSignaturesMaterial] = useState<SafetyMaterial | null>(null);
  const [signatureModalTab, setSignatureModalTab] = useState<'signed' | 'unsigned'>('signed');

  // Equipment Usage Logs Filter & Tab (Request #7)
  const [selectedEquipmentTypeFilter, setSelectedEquipmentTypeFilter] = useState<string>('ALL');
  const [isAddEquipmentTypeModalOpen, setIsAddEquipmentTypeModalOpen] = useState(false);
  const [newEquipmentTypeName, setNewEquipmentTypeName] = useState('');

  // Receiver Button Selection Toggle (Request #3)
  const toggleSelectWorker = (workerId: string) => {
    if (workerId === 'ALL') {
      setSelectedWorkerIds(['ALL']);
      return;
    }

    let next = selectedWorkerIds.filter((id) => id !== 'ALL');
    if (next.includes(workerId)) {
      next = next.filter((id) => id !== workerId);
      if (next.length === 0) next = ['ALL'];
    } else {
      next.push(workerId);
    }
    setSelectedWorkerIds(next);
  };

  // Handle Push Send
  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructionText) return;

    const isAll = selectedWorkerIds.includes('ALL');
    const targetDesc = isAll
      ? '전체 현장 근로자 (17개국 25명 동시 발송)'
      : workers
          .filter((w) => selectedWorkerIds.includes(w.id))
          .map((w) => `${w.name}(${w.nationality})`)
          .join(', ');

    const newPushItem: PushHistoryItem = {
      id: 'push-' + Date.now(),
      sentAt: new Date().toLocaleString(),
      target: targetDesc,
      targetWorkerId: isAll ? 'ALL' : selectedWorkerIds.join(','),
      instructionText,
      status: 'DELIVERED',
    };

    addPushHistory(newPushItem);
    setPushSentMessage(`[작업지시 발송 성공] 선택된 대상(${targetDesc})에게 모국어로 자동 번역되어 실시간 전송되었습니다.`);
    setTimeout(() => setPushSentMessage(null), 5000);
  };

  // Handle Material Upload
  const handleMaterialUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialForm.title) {
      alert('교안 제목을 입력해주세요.');
      return;
    }

    const finalFileName = newMaterialForm.fileName || '안전교육교안_자료.pdf';
    const finalFileSize = newMaterialForm.fileSize || '3.5 MB';

    const item: SafetyMaterial = {
      id: 'mat-' + Date.now(),
      type: materialUploadType,
      title: newMaterialForm.title,
      category: newMaterialForm.category,
      fileName: finalFileName,
      fileSize: finalFileSize,
      pdfUrl: uploadedFileUrl || undefined,
      description: newMaterialForm.description || '산업안전보건법 기준 현장 작업자 필수 이수 교안 (안전 수칙 및 보호구 착용법)',
      targetDepartment: newMaterialForm.targetDepartment,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: '김공장장 (안전총괄)',
      signatures: [],
    };

    addSafetyMaterial(item);
    LocalStateStore.getInstance().syncToServer();
    setIsUploadModalOpen(false);
    setUploadedFileUrl(null);
    setNewMaterialForm({
      title: '',
      category: materialUploadType === 'SAFETY_EDUCATION' ? '정기안전교육' : '위험공정 TBM',
      fileName: '',
      fileSize: '',
      description: '',
      targetDepartment: '전 생산라인 및 정비팀',
    });
    alert(`[PC 파일 교안 등록 완료]\n\n제목: ${item.title}\n파일명: ${item.fileName} (${item.fileSize})\n관리자 및 근로자 스마트폰으로 즉시 배포되었습니다.`);
  };

  // Add Equipment Tab (Request #7)
  const handleAddEquipmentTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipmentTypeName.trim()) return;
    addEquipmentType(newEquipmentTypeName.trim());
    setSelectedEquipmentTypeFilter(newEquipmentTypeName.trim());
    setIsAddEquipmentTypeModalOpen(false);
    setNewEquipmentTypeName('');
    alert(`[신규 탭 생성 완료] "${newEquipmentTypeName.trim()}" 기기 사용 일지 탭이 생성되었습니다.`);
  };

  // Export Signatures to Excel/CSV (Request #5)
  const handleExportSignaturesExcel = (material: SafetyMaterial) => {
    const signedList = material.signatures;
    const unsignedList = workers.filter(
      (w) => w.status === 'ACTIVE' && !material.signatures.some((s) => s.workerId === w.id)
    );

    let content = '구분,교안제목,성명,국적,서명상태,서명일시,전자서명데이터유무\n';

    signedList.forEach((s) => {
      content += `"${material.type}","${material.title}","${s.workerName}","${s.nationality}",서명완료,"${s.signedAt}","${s.signatureDataUrl ? '이미지서명보관' : '서명완료'}"\n`;
    });

    unsignedList.forEach((u) => {
      content += `"${material.type}","${material.title}","${u.name}","${u.nationality}",미서명(대기),"-","미서명"\n`;
    });

    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `[서명이수명부]_${material.title.slice(0, 15)}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

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

    alert(`[서명 등록 완료] ${w.name} 근로자의 서명이 안전 교안에 등록되었습니다.`);
    setReadingMaterial(null);
    setHasSigned(false);
  };

  const translatedPreview = translationService.translateInstruction(instructionText, previewLanguage);
  const educationMaterials = safetyMaterials.filter((m) => m.type === 'SAFETY_EDUCATION');
  const tbmMaterials = safetyMaterials.filter((m) => m.type === 'TBM');

  // Filtered Equipment Usage Logs
  const filteredEquipmentLogs = equipmentUsageLogs.filter((log) => {
    if (selectedEquipmentTypeFilter === 'ALL') return true;
    return log.equipmentType === selectedEquipmentTypeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-[#0071E3]" />
            현장 안전 및 보건 관리 (Safety & Health)
          </h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">
            안전교육 및 TBM 교안 서명 현황, 지게차·고소작업대 기기사용일지, 17개국 다국어 작업지시 및 PTW 심사
          </p>
        </div>

        {(activeSection === 'education' || activeSection === 'tbm') && (
          <button
            onClick={() => {
              setMaterialUploadType(activeSection === 'education' ? 'SAFETY_EDUCATION' : 'TBM');
              setIsUploadModalOpen(true);
            }}
            className="btn-primary shadow-sm text-xs px-4 py-2.5 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{activeSection === 'education' ? '안전교육 교안 등록' : 'TBM 교안 등록'}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs (Apple Segmented Bar) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#E8E8ED]/70 rounded-2xl border border-black/5">
        <button
          onClick={() => setActiveSection('education')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'education'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#0071E3]" />
          <span>안전교육 교안 & 서명</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {educationMaterials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('tbm')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'tbm'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <FileSignature className="w-4 h-4 text-[#34C759]" />
          <span>TBM & 서명</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {tbmMaterials.length}
          </span>
        </button>

        {/* Request #7: 기기 사용 일지 탭 */}
        <button
          onClick={() => setActiveSection('equipment_logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'equipment_logs'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Truck className="w-4 h-4 text-[#AF52DE]" />
          <span>기기 사용 일지 (지게차/크레인 등)</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {equipmentUsageLogs.length}건
          </span>
        </button>

        <button
          onClick={() => setActiveSection('instruction')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'instruction'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Send className="w-4 h-4 text-[#0071E3]" />
          <span>16개국어 작업지시 발송</span>
        </button>

        <button
          onClick={() => setActiveSection('ptw')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'ptw'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-[#FF9500]" />
          <span>PTW 작업허가 심사</span>
          {ptwList.filter((p) => p.status === 'REQUESTED').length > 0 && (
            <span className="bg-[#FF9500] text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold">
              {ptwList.filter((p) => p.status === 'REQUESTED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('sos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'sos'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Radio className="w-4 h-4 text-[#FF3B30]" />
          <span>SOS 비상 관제</span>
        </button>
      </div>

      {/* SECTION 1 & 2: Safety Education & TBM Materials */}
      {(activeSection === 'education' || activeSection === 'tbm') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeSection === 'education' ? educationMaterials : tbmMaterials).map((mat) => {
              const signedCount = mat.signatures.length;
              const totalActiveWorkers = workers.filter((w) => w.status === 'ACTIVE').length;
              const unsignedCount = Math.max(0, totalActiveWorkers - signedCount);

              return (
                <div key={mat.id} className="glass-card p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-blue text-[11px] font-semibold">{mat.category}</span>
                      <span className="text-[11px] text-[#86868B] font-mono">{mat.uploadedAt}</span>
                    </div>

                    <h3 className="font-bold text-base text-[#1D1D1F] leading-snug">{mat.title}</h3>
                    <p className="text-xs text-[#6E6E73] leading-relaxed">{mat.description}</p>

                    <div className="p-3 bg-[#F5F5F7] rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0071E3]" />
                        <span className="font-medium text-[#1D1D1F]">{mat.fileName}</span>
                        <span className="text-[#86868B] text-[11px]">({mat.fileSize})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-green text-[11px]">서명: {signedCount}명</span>
                        {unsignedCount > 0 && (
                          <span className="badge badge-amber text-[11px]">미서명: {unsignedCount}명</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Request #5: 서명자/미서명자 리스트 확인 & 엑셀 다운로드) */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/5 gap-2">
                    <button
                      onClick={() => handleExportSignaturesExcel(mat)}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                      title="서명 내역 엑셀 다운로드"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>서명 명부 엑셀</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setViewingSignaturesMaterial(mat);
                          setSignatureModalTab('signed');
                        }}
                        className="btn-secondary text-xs py-2 px-3"
                      >
                        <Users className="w-3.5 h-3.5 text-[#6E6E73]" />
                        <span>서명/미서명 현황 ({signedCount}/{totalActiveWorkers})</span>
                      </button>

                      <button
                        onClick={() => {
                          setReadingMaterial(mat);
                          setSigningWorkerId(workers[0]?.id || 'w-1');
                        }}
                        className="btn-primary text-xs py-2 px-3.5"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>열람 및 전자서명</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: Equipment Usage Logs (Request #7: 지게차, 고소작업대, 스카이, 크레인 + 동적 탭) */}
      {activeSection === 'equipment_logs' && (
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div>
                <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#0071E3]" />
                  중장비 및 특수 기기 사용 일지 관리
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  근로자 스마트폰 신청 내역을 관리자가 심사 승인하고, 기기별 사용 기록을 영구 보관합니다.
                </p>
              </div>

              <button
                onClick={() => setIsAddEquipmentTypeModalOpen(true)}
                className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-none"
              >
                <Plus className="w-4 h-4 text-[#0071E3]" />
                <span>+ 신규 기기 탭 추가</span>
              </button>
            </div>

            {/* Equipment Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setSelectedEquipmentTypeFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedEquipmentTypeFilter === 'ALL'
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                전체 기기 ({equipmentUsageLogs.length})
              </button>

              {equipmentTypes.map((type) => {
                const count = equipmentUsageLogs.filter((l) => l.equipmentType === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedEquipmentTypeFilter(type)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      selectedEquipmentTypeFilter === type
                        ? 'bg-[#0071E3] text-white shadow-sm'
                        : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <span>{type}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment Usage Table */}
          <div className="table-container shadow-sm">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>기기 종류</th>
                  <th>기기 번호</th>
                  <th>신청 근로자</th>
                  <th>사용 목적 (한국어 자동 번역)</th>
                  <th>사용 예정 시간</th>
                  <th>작업 장소</th>
                  <th>면허·사전점검</th>
                  <th>승인 상태</th>
                  <th className="text-right">관리 심사</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipmentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-[#86868B] text-xs">
                      등록된 기기 사용 일지가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredEquipmentLogs.map((log) => {
                    const worker = workers.find((w) => w.id === log.workerId);
                    const workerNat = worker?.nationality || 'VN';
                    const purposeTrans = translationService.translateWorkerTextToKorean(log.purpose, workerNat);
                    const locationTrans = translationService.translateWorkerTextToKorean(log.location || '공장 구역', workerNat);

                    return (
                      <tr key={log.id} className="hover:bg-[#F9FAFB]">
                        <td>
                          <span className="badge badge-blue font-bold text-xs">{log.equipmentType}</span>
                        </td>
                        <td className="font-mono text-xs text-[#1D1D1F]">{log.equipmentNumber || '-'}</td>
                        <td className="font-semibold text-[#1D1D1F]">
                          <div>{log.workerName}</div>
                          {worker && (
                            <span className="text-[10px] text-[#86868B]">
                              {translationService.getLanguageInfo(translationService.detectLanguageByNationality(worker.nationality)).flag} {worker.nationality}
                            </span>
                          )}
                        </td>
                        <td className="max-w-xs text-[#1D1D1F]">
                          <div className="font-medium text-xs text-[#1D1D1F] leading-snug">
                            {purposeTrans.koreanText}
                          </div>
                          {purposeTrans.isTranslated && (
                            <div className="text-[10px] text-[#86868B] mt-0.5 flex items-center gap-1">
                              <span className="badge badge-gray text-[9px] px-1 py-0">{purposeTrans.sourceLangInfo.flag} 원문</span>
                              <span className="truncate italic">"{purposeTrans.originalText}"</span>
                            </div>
                          )}
                        </td>
                        <td className="font-mono text-xs text-[#1D1D1F]">{log.startTime} ~ {log.endTime}</td>
                        <td className="text-xs text-[#6E6E73]">
                          <div>{locationTrans.koreanText}</div>
                          {locationTrans.isTranslated && (
                            <div className="text-[9.5px] text-[#86868B] italic">({locationTrans.originalText})</div>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {log.hasLicense && <span className="badge badge-green text-[10px]">면허확인</span>}
                            {log.preCheckCompleted && <span className="badge badge-blue text-[10px]">점검완료</span>}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              log.status === 'APPROVED'
                                ? 'badge-green'
                                : log.status === 'REJECTED'
                                ? 'badge-red'
                                : 'badge-amber'
                            }`}
                          >
                            {log.status === 'APPROVED' ? '승인완료' : log.status === 'REJECTED' ? '반려됨' : '승인대기'}
                          </span>
                        </td>
                        <td className="text-right">
                          {log.status === 'REQUESTED' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  approveEquipmentUsage(log.id, '김공장장 (안전관리자)');
                                  alert(`[승인 완료] ${log.workerName} 근로자의 ${log.equipmentType} 사용이 승인되었습니다. 근로자 스마트폰에 [승인완료]로 실시간 반영됩니다.`);
                                }}
                                className="btn-primary text-xs py-1 px-2.5 bg-[#34C759] hover:bg-[#2FB34F]"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('반려 사유를 한국어로 입력하세요 (근로자 모국어로 자동 번역 전송됩니다):');
                                  if (reason) {
                                    rejectEquipmentUsage(log.id, reason, '김공장장 (안전관리자)');
                                  }
                                }}
                                className="btn-secondary text-xs py-1 px-2.5 text-[#FF3B30]"
                              >
                                반려
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#86868B] font-mono">
                              {log.approvedBy || '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: 16개국어 작업지시 발송 (Request #3: 자유로운 버튼 형태 수신자 선택) */}
      {activeSection === 'instruction' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass-card p-6 space-y-5">
            <div className="pb-3 border-b border-black/5">
              <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0071E3]" />
                작업지시서 수신 대상 근로자 선택 및 모국어 동시 발송
              </h3>
              <p className="text-xs text-[#86868B] mt-1">
                아래 버튼들을 클릭하여 수신 대상 근로자를 자유롭게 선택하세요. 한국어로 작성하면 각 근로자의 모국어로 자동 번역되어 전달됩니다.
              </p>
            </div>

            {/* Request #3: 수신대상 근로자 선택을 자유롭게 할 수 있는 버튼(토글 칩) 형태 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1D1D1F] block">
                수신 대상 근로자 선택 (버튼 클릭 토글) *
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-[#F5F5F7] rounded-2xl border border-black/5">
                {/* All workers button */}
                <button
                  type="button"
                  onClick={() => toggleSelectWorker('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedWorkerIds.includes('ALL')
                      ? 'bg-[#0071E3] text-white shadow-sm scale-[1.02]'
                      : 'bg-white text-[#6E6E73] hover:text-[#1D1D1F] border border-black/5'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>전체 현장 근로자 (17개국 25명 동시 발송)</span>
                  {selectedWorkerIds.includes('ALL') && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>

                {/* Individual Worker Buttons */}
                {workers.map((w) => {
                  const isSelected = selectedWorkerIds.includes(w.id);
                  const country = SUPPORTED_LANGUAGES.find((l) => l.code === w.nationality.toLowerCase());
                  const flag = country ? country.flag : '🌐';

                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleSelectWorker(w.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected && !selectedWorkerIds.includes('ALL')
                          ? 'bg-[#0071E3] text-white shadow-sm scale-[1.02]'
                          : 'bg-white text-[#515154] hover:text-[#1D1D1F] border border-black/5'
                      }`}
                    >
                      <span>{flag}</span>
                      <span>{w.name}</span>
                      <span className="text-[10px] opacity-80">({w.koreanName || w.nationality})</span>
                      {isSelected && !selectedWorkerIds.includes('ALL') && (
                        <Check className="w-3.5 h-3.5 ml-0.5 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-[#86868B]">
                선택된 대상: <strong className="text-[#0071E3]">
                  {selectedWorkerIds.includes('ALL')
                    ? '전체 현장 근로자 동시 발송'
                    : `${selectedWorkerIds.length}명 선택됨`}
                </strong>
              </div>
            </div>

            {/* Instruction Text Input */}
            <form onSubmit={handleSendPush} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">
                  작업 지시 및 안전 공지 내용 (한국어 원문) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  placeholder="예: 오늘 스크러버 배관 용접 작업 주의. 안전그네 및 소화기 2기 배치 필수."
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-3 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] transition-colors"
                />
              </div>

              {pushSentMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{pushSentMessage}</span>
                </div>
              )}

              <button type="submit" className="btn-primary w-full justify-center text-xs py-3 font-bold">
                <Send className="w-4 h-4" />
                선택 대상 근로자 모국어 실시간 발송
              </button>
            </form>
          </div>

          {/* Right Preview Card */}
          <div className="glass-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="font-bold text-xs text-[#1D1D1F]">모국어 번역 실시간 미리보기</span>
                <select
                  value={previewLanguage}
                  onChange={(e) => setPreviewLanguage(e.target.value)}
                  className="bg-[#F5F5F7] border border-black/5 rounded-lg px-2.5 py-1 text-xs text-[#1D1D1F]"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-[#F5F5F7] rounded-xl space-y-2 text-xs">
                <div className="text-[11px] text-[#86868B] font-semibold">
                  {translationService.getLanguageInfo(previewLanguage).flag}{' '}
                  {translationService.getLanguageInfo(previewLanguage).name} (모국어):
                </div>
                <div className="font-bold text-[#1D1D1F] leading-relaxed">
                  {translatedPreview}
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-blue-900 leading-relaxed">
              💡 근로자가 스마트폰에서 수신된 지시를 확인하고 서약하면 대시보드에 실시간 완료 표시됩니다.
            </div>
          </div>

          {/* Bottom Push History Table */}
          <div className="glass-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#1D1D1F]">
                📋 최근 작업지시서 발송 및 근로자 수신/서약 이력 ({pushHistories.length}건)
              </span>
              <span className="text-xs text-[#0071E3] font-semibold">실시간 동기화</span>
            </div>
            <div className="table-container shadow-sm">
              <table className="custom-table text-xs">
                <thead>
                  <tr>
                    <th>발송 일시</th>
                    <th>수신 대상</th>
                    <th>작업지시 내용 (한국어)</th>
                    <th>수신/서약 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {pushHistories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-[#86868B]">
                        발송된 작업지시가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pushHistories.map((push) => (
                      <tr key={push.id} className="hover:bg-[#F9FAFB]">
                        <td className="text-xs font-mono text-[#86868B]">{push.sentAt}</td>
                        <td className="font-bold text-[#1D1D1F]">{push.target}</td>
                        <td className="text-[#1D1D1F]">{push.instructionText}</td>
                        <td>
                          <span
                            className={`badge ${
                              push.status === 'CONFIRMED'
                                ? 'badge-green'
                                : 'badge-amber'
                            }`}
                          >
                            {push.status === 'CONFIRMED' ? '✅ 근로자 서약완료' : '전송완료 (확인대기)'}
                          </span>
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

      {/* SECTION 5: PTW Request List */}
      {activeSection === 'ptw' && (
        <div className="table-container shadow-sm">
          <table className="custom-table">
            <thead>
              <tr>
                <th>허가서 번호</th>
                <th>신청 근로자</th>
                <th>작업 명칭 (한국어 자동 번역)</th>
                <th>작업 위치</th>
                <th>위험 요인 (한국어 번역)</th>
                <th>안전 대책 (한국어 번역)</th>
                <th>상태</th>
                <th className="text-right">심사 액션</th>
              </tr>
            </thead>
            <tbody>
              {ptwList.map((ptw) => {
                const worker = workers.find((w) => w.id === ptw.workerId);
                const workerNat = worker?.nationality || 'VN';
                const taskNameTrans = translationService.translateWorkerTextToKorean(ptw.taskName, workerNat);
                const locationTrans = translationService.translateWorkerTextToKorean(ptw.location, workerNat);
                const hazardTrans = translationService.translateWorkerTextToKorean(ptw.hazardFactors, workerNat);
                const safetyTrans = translationService.translateWorkerTextToKorean(ptw.safetyMeasures, workerNat);

                return (
                  <tr key={ptw.id} className="hover:bg-[#F9FAFB]">
                    <td className="font-mono text-xs font-semibold text-[#1D1D1F]">{ptw.ptwNumber}</td>
                    <td className="font-medium text-[#1D1D1F]">
                      <div>{ptw.workerName}</div>
                      {worker && (
                        <span className="text-[10px] text-[#86868B]">
                          {translationService.getLanguageInfo(translationService.detectLanguageByNationality(worker.nationality)).flag} {worker.nationality}
                        </span>
                      )}
                    </td>
                    <td className="font-bold text-[#1D1D1F]">
                      <div>{taskNameTrans.koreanText}</div>
                      {taskNameTrans.isTranslated && (
                        <div className="text-[10px] text-[#86868B] font-normal italic">
                          원문: "{taskNameTrans.originalText}"
                        </div>
                      )}
                    </td>
                    <td className="text-xs text-[#6E6E73]">{locationTrans.koreanText}</td>
                    <td className="text-xs text-[#FF3B30]">
                      <div>{hazardTrans.koreanText}</div>
                      {hazardTrans.isTranslated && (
                        <div className="text-[9.5px] text-[#86868B] italic">({hazardTrans.originalText})</div>
                      )}
                    </td>
                    <td className="text-xs text-[#6E6E73]">
                      <div>{safetyTrans.koreanText}</div>
                      {safetyTrans.isTranslated && (
                        <div className="text-[9.5px] text-[#86868B] italic">({safetyTrans.originalText})</div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ptw.status === 'APPROVED'
                            ? 'badge-green'
                            : ptw.status === 'REJECTED'
                            ? 'badge-red'
                            : 'badge-amber'
                        }`}
                      >
                        {ptw.status === 'APPROVED' ? '승인완료' : ptw.status === 'REJECTED' ? '반려됨' : '승인대기'}
                      </span>
                    </td>
                    <td className="text-right">
                      {ptw.status === 'REQUESTED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              approvePTW(ptw.id);
                              alert(`[PTW 승인 완료] ${ptw.taskName} 허가서가 승인되었습니다. 근로자 스마트폰에 [승인완료]로 실시간 반영됩니다.`);
                            }}
                            className="btn-primary text-xs py-1 px-3 bg-[#34C759] hover:bg-[#2FB34F]"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('반려 사유를 한국어로 입력하세요 (근로자 모국어로 자동 번역 전송됩니다):');
                              if (reason) rejectPTW(ptw.id, reason);
                            }}
                            className="btn-secondary text-xs py-1 px-3 text-[#FF3B30]"
                          >
                            반려
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#86868B] font-mono">
                          {ptw.approvedBy || '관리자 승인완료'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 6: SOS Alert 관제 */}
      {activeSection === 'sos' && (
        <div className="table-container shadow-sm">
          <table className="custom-table">
            <thead>
              <tr>
                <th>발생 일시</th>
                <th>근로자 성명</th>
                <th>연락처</th>
                <th>GPS 발생 위치</th>
                <th>긴급 지원 메시지</th>
                <th>상태</th>
                <th className="text-right">조치</th>
              </tr>
            </thead>
            <tbody>
              {sosList.map((sos) => (
                <tr key={sos.id} className="hover:bg-[#F9FAFB]">
                  <td className="font-mono text-xs">{sos.triggeredAt}</td>
                  <td className="font-bold text-[#FF3B30]">{sos.workerName}</td>
                  <td className="font-mono text-xs">{sos.phoneNumber}</td>
                  <td className="font-semibold text-[#1D1D1F]">{sos.location}</td>
                  <td className="text-xs text-[#515154]">{sos.message}</td>
                  <td>
                    <span className={`badge ${sos.status === 'TRIGGERED' ? 'badge-red' : 'badge-green'}`}>
                      {sos.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {sos.status === 'TRIGGERED' && (
                      <button
                        onClick={() => {
                          resolveSOS(sos.id);
                          alert('SOS 긴급 상황이 해제되었습니다.');
                        }}
                        className="btn-primary text-xs py-1 px-3 bg-[#34C759] hover:bg-[#2FB34F]"
                      >
                        상황 해제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Signatures & Unsigned Workers Status (Request #5: 30% 커진 크기 max-w-[884px]) */}
      {viewingSignaturesMaterial && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0071E3]" />
                  [{viewingSignaturesMaterial.type === 'SAFETY_EDUCATION' ? '안전교육' : 'TBM'}] 서명자 및 미서명자 현황
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  {viewingSignaturesMaterial.title}
                </p>
              </div>
              <button
                onClick={() => setViewingSignaturesMaterial(null)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Stat & Segmented Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-[#F5F5F7] rounded-xl border border-black/5">
                <button
                  onClick={() => setSignatureModalTab('signed')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    signatureModalTab === 'signed'
                      ? 'bg-white text-[#1D1D1F] shadow-sm'
                      : 'text-[#6E6E73]'
                  }`}
                >
                  서명 완료 근로자 ({viewingSignaturesMaterial.signatures.length}명)
                </button>
                <button
                  onClick={() => setSignatureModalTab('unsigned')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    signatureModalTab === 'unsigned'
                      ? 'bg-white text-[#FF3B30] shadow-sm'
                      : 'text-[#6E6E73]'
                  }`}
                >
                  미서명(서명 미완료) 근로자 ({
                    workers.filter(
                      (w) =>
                        w.status === 'ACTIVE' &&
                        !viewingSignaturesMaterial.signatures.some((s) => s.workerId === w.id)
                    ).length
                  }명)
                </button>
              </div>

              {/* Request #5: 엑셀 형태 다운로드 */}
              <button
                onClick={() => handleExportSignaturesExcel(viewingSignaturesMaterial)}
                className="btn-primary text-xs py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>서명 내역 엑셀 다운로드 (CSV)</span>
              </button>
            </div>

            {/* TAB CONTENT: Signed list vs Unsigned list */}
            {signatureModalTab === 'signed' ? (
              <div className="table-container max-h-72 overflow-y-auto">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>순번</th>
                      <th>근로자 성명</th>
                      <th>국적</th>
                      <th>서명 완료 일시</th>
                      <th>전자 서명 확인</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingSignaturesMaterial.signatures.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-xs text-[#86868B]">
                          아직 서명 완료한 근로자가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      viewingSignaturesMaterial.signatures.map((sig, idx) => (
                        <tr key={sig.id} className="hover:bg-[#F9FAFB]">
                          <td className="font-mono text-xs">{idx + 1}</td>
                          <td className="font-bold text-[#1D1D1F]">{sig.workerName}</td>
                          <td>
                            <span className="badge badge-blue text-[10px]">{sig.nationality}</span>
                          </td>
                          <td className="font-mono text-xs text-[#6E6E73]">{sig.signedAt}</td>
                          <td>
                            {sig.signatureDataUrl ? (
                              <img
                                src={sig.signatureDataUrl}
                                alt="서명 이미지"
                                className="h-7 border border-black/10 rounded bg-white px-2 object-contain"
                              />
                            ) : (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 전자서명 완료
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-container max-h-72 overflow-y-auto">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>순번</th>
                      <th>근로자 성명</th>
                      <th>국적</th>
                      <th>스마트폰 번호</th>
                      <th>비자 형태</th>
                      <th className="text-right">독촉 액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers
                      .filter(
                        (w) =>
                          w.status === 'ACTIVE' &&
                          !viewingSignaturesMaterial.signatures.some((s) => s.workerId === w.id)
                      )
                      .map((w, idx) => (
                        <tr key={w.id} className="hover:bg-[#F9FAFB]">
                          <td className="font-mono text-xs">{idx + 1}</td>
                          <td className="font-bold text-[#1D1D1F]">{w.name}</td>
                          <td>
                            <span className="badge badge-amber text-[10px]">{w.nationality}</span>
                          </td>
                          <td className="font-mono text-xs">{w.phoneNumber}</td>
                          <td className="text-xs text-[#6E6E73]">{w.visaType}</td>
                          <td className="text-right">
                            <button
                              onClick={() => {
                                alert(`[서명 독촉 푸시 발송] ${w.name} 근로자 스마트폰으로 모국어 서명 독촉 알림이 전송되었습니다.`);
                              }}
                              className="btn-secondary text-xs py-1 px-2.5 text-[#0071E3] flex items-center gap-1 inline-flex"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>서명 독촉 푸시</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-black/5">
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

      {/* MODAL 2: Reading & Signature Pad (30% 커진 크기 max-w-[884px]) */}
      {readingMaterial && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-[#0071E3]" />
                  교안 열람 및 안전 서약 전자서명
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">{readingMaterial.title}</p>
              </div>
              <button
                onClick={() => setReadingMaterial(null)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-2 text-xs text-[#1D1D1F] leading-relaxed">
              <span className="font-bold block text-sm">안전수칙 주요 이수 내용:</span>
              <p>1. 모든 작업자는 안전모 턱끈 체결 및 안전화 착용을 철저히 확인합니다.</p>
              <p>2. 유해 화학물질 취급 시 내화학 장갑, 방독마스크, 보안경을 착용합니다.</p>
              <p>3. 위험 설비 점검 전 반드시 메인 전원을 차단하고 LOTO(잠금장치)를 시건합니다.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-[#1D1D1F]">서명 대상 근로자 선택:</label>
                  <select
                    value={signingWorkerId}
                    onChange={(e) => setSigningWorkerId(e.target.value)}
                    className="bg-[#F5F5F7] border border-black/5 rounded-lg px-3 py-1.5 text-xs text-[#1D1D1F]"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.nationality})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-[#FF3B30] hover:underline"
                >
                  서명 다시 쓰기
                </button>
              </div>

              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair touch-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => setReadingMaterial(null)}
                className="btn-secondary text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCompleteMaterialSignature}
                disabled={!hasSigned}
                className="btn-primary text-xs disabled:opacity-50"
              >
                서명 완료 및 보관
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Equipment Usage Tab (Request #7: 동적 탭 생성) */}
      {isAddEquipmentTypeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0071E3]" />
                신규 기기 사용 일지 탭 생성
              </h3>
              <button
                onClick={() => setIsAddEquipmentTypeModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipmentTypeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">
                  생성할 기기/장비 명칭 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 굴착기, 호이스트, 덤프트럭 등"
                  value={newEquipmentTypeName}
                  onChange={(e) => setNewEquipmentTypeName(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-3 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900 leading-relaxed">
                💡 탭이 생성되면 안전보건관리 메뉴 상단에 기기별 일지 탭이 추가되며, 근로자 스마트폰에서도 해당 기기를 선택하여 사용 승인 요청을 할 수 있습니다.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsAddEquipmentTypeModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  기기 사용일지 탭 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Upload Material Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#0071E3]" />
                {materialUploadType === 'SAFETY_EDUCATION' ? '신규 안전교육 PDF 교안 등록' : '신규 TBM PDF 교안 등록'}
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaterialUploadSubmit} className="space-y-4">
              {/* PC File Upload Dropzone */}
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1.5">
                  내 PC에서 교안 파일 올리기 *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.hwp,.hwpx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-400/60 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 rounded-2xl p-5 text-center cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1D1D1F]">
                      {newMaterialForm.fileName ? (
                        <span className="text-[#0071E3] font-bold">
                          선택된 파일: {newMaterialForm.fileName} ({newMaterialForm.fileSize})
                        </span>
                      ) : (
                        <span>클릭하여 내 PC의 교안 파일 선택 (또는 파일 끌어다 놓기)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#86868B] mt-0.5">
                      지원 형식: PDF, HWP, DOCX, PPTX, JPG, PNG (최대 50MB)
                    </p>
                  </div>

                  {newMaterialForm.fileName && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>파일 로드 완료 (등록 준비됨)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">교안 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026년 하반기 유해화학물질 취급 안전 특별교육"
                  value={newMaterialForm.title}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, title: e.target.value })}
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-3 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">교육 구분</label>
                  <input
                    type="text"
                    value={newMaterialForm.category}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, category: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">대상 부서/라인</label>
                  <input
                    type="text"
                    value={newMaterialForm.targetDepartment}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, targetDepartment: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">교안 상세 설명 및 주요 수칙</label>
                <textarea
                  rows={2}
                  placeholder="교육의 주요 위험 요인과 필수 안전 수칙을 입력하세요. (근로자 모국어로 자동 번역 제공)"
                  value={newMaterialForm.description}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, description: e.target.value })}
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  내 PC 교안 등록 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
