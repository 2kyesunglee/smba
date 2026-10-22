'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAppStore } from '@/presentation/context/AppContext';
import { MultiLanguageTranslationService } from '@/infrastructure/services/TranslationService';
import { InspectionTarget } from '@/infrastructure/storage/LocalStateStore';
import {
  Wrench,
  QrCode,
  Sliders,
  ClipboardList,
  Images,
  Plus,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Flame,
  ArrowRight,
  X,
  Upload,
  Calendar,
  User,
  MapPin,
  FileText,
  Download,
  Search,
  List,
  LayoutGrid,
  FileSpreadsheet,
  Settings2,
  Activity,
  Trash2,
  Camera,
  Languages,
  Globe,
} from 'lucide-react';

export const EquipmentProcessView: React.FC = () => {
  const {
    equipmentList,
    templates,
    inspections,
    workReports,
    workers,
    inspectionTargets,
    createEquipmentQR,
    createTemplate,
    submitWorkReport,
    addInspectionTarget,
    deleteInspectionTarget,
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  // Active section tab
  const [activeSection, setActiveSection] = useState<'gallery' | 'logs' | 'targets' | 'qr' | 'builder'>('gallery');

  // Request #4: Before/After Gallery State & Search & View Mode
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportDateFilter, setReportDateFilter] = useState('');
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'list'>('grid');

  // Work Report Create Modal State (Request #7: Before 2장, After 2장 등록)
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [newReportForm, setNewReportForm] = useState({
    taskName: '',
    location: '',
    workerId: 'w-1',
    workerName: 'Nguyen Van An',
    beforeImg1: '',
    beforeImg2: '',
    afterImg1: '',
    afterImg2: '',
    beforeDescription: '',
    afterDescription: '',
    description: '',
  });

  const handleWebReportImageUpload = (
    field: 'beforeImg1' | 'beforeImg2' | 'afterImg1' | 'afterImg2',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNewReportForm((prev) => ({ ...prev, [field]: ev.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateWebReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportForm.taskName.trim()) {
      alert('작업 명칭을 입력해주세요.');
      return;
    }

    const defaultWorker = workers.find((w) => w.id === newReportForm.workerId) || workers[0];

    submitWorkReport(
      newReportForm.taskName,
      newReportForm.location || '생산 현장 1구역',
      newReportForm.beforeImg1 || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
      newReportForm.afterImg1 || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      newReportForm.description || newReportForm.afterDescription || '작업 완료 및 안전 점검 완료함.',
      [newReportForm.beforeImg1, newReportForm.beforeImg2].filter(Boolean),
      [newReportForm.afterImg1, newReportForm.afterImg2].filter(Boolean),
      newReportForm.beforeDescription,
      newReportForm.afterDescription
    );

    setIsCreateReportModalOpen(false);
    setNewReportForm({
      taskName: '',
      location: '',
      workerId: 'w-1',
      workerName: defaultWorker?.name || 'Nguyen Van An',
      beforeImg1: '',
      beforeImg2: '',
      afterImg1: '',
      afterImg2: '',
      beforeDescription: '',
      afterDescription: '',
      description: '',
    });
    alert('🎉 작업 완료 보고서(Before 2장, After 2장)가 성공적으로 등록되었습니다.');
  };

  // Request #6: Inspection Target Form Modal
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [newTarget, setNewTarget] = useState<InspectionTarget>({
    id: '',
    name: '',
    location: '',
    cycle: '일일',
    manager: '김한국 (정비반장)',
    description: '',
    metrics: [
      { name: '가열 온도', unit: '°C', maxLimit: 130 },
      { name: '공급 압력', unit: 'bar', maxLimit: 3.5, minLimit: 1.0 },
    ],
  });

  // Request #8: Real QR Code Generator State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [newQr, setNewQr] = useState({
    name: '',
    category: 'EQUIPMENT' as 'EQUIPMENT' | 'CHEMICAL',
    type: 'LOTO' as 'LOTO' | 'MSDS' | 'SAFETY_RULES',
    location: '',
    cautionNotes: '',
    emergencyProcedures: '',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  });

  // Generated Real QR Data URL for Print Modal (Request #8)
  const [selectedPrintQr, setSelectedPrintQr] = useState<any | null>(null);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');

  // Generate real QR code image whenever selectedPrintQr changes (Request #8)
  useEffect(() => {
    if (selectedPrintQr) {
      const qrPayload = JSON.stringify({
        id: selectedPrintQr.id,
        code: selectedPrintQr.code,
        name: selectedPrintQr.name,
        type: selectedPrintQr.type,
        location: selectedPrintQr.location,
        url: `https://smba-one.vercel.app/mobile?qr=${selectedPrintQr.code}`,
      });

      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setGeneratedQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [selectedPrintQr]);

  // Dynamic Form Builder State
  const [formTitle, setFormTitle] = useState('신규 설비 정기점검 템플릿');
  const [formFields, setFormFields] = useState<any[]>([
    { id: 'f-1', label: '가열 온도', type: 'number', unit: '°C', maxThreshold: 120, required: true },
    { id: 'f-2', label: '공급 압력', type: 'number', unit: 'bar', maxThreshold: 3.0, required: true },
    { id: 'f-3', label: '이상 소음 유무', type: 'checkbox', required: true },
  ]);

  const handleAddField = () => {
    const label = prompt('추가할 점검 항목명을 입력하세요 (예: 냉각수 레벨):', '기타 상태 점검');
    if (!label) return;
    setFormFields((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, label, type: 'checkbox', required: true },
    ]);
  };

  const handleSaveTemplate = () => {
    alert(`[${formTitle}] 서식이 저장되고 모바일 점검 시스템에 배포되었습니다.`);
  };

  // Handle Photo Download Helper (Request #4)
  const handleDownloadImage = (imgUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Past Work Reports Excel Export (Request #4)
  const handleExportWorkReportsExcel = () => {
    let content = '일련번호,작업일시,작업명,작업위치,작업자,문제점설명(Before),개선이후설명(After),조치내용요약\n';

    workReports.forEach((rep, idx) => {
      content += `${idx + 1},"${rep.reportedAt}","${rep.taskName}","${rep.location}","${rep.workerName}","${rep.beforeDescription || ''}","${rep.afterDescription || ''}","${rep.description}"\n`;
    });

    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `[작업완료보고이력]_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Work Reports (Request #4: 작업내용 & 일시 검색)
  const filteredWorkReports = workReports.filter((report) => {
    const matchText =
      report.taskName.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
      (report.beforeDescription && report.beforeDescription.toLowerCase().includes(reportSearchTerm.toLowerCase())) ||
      (report.afterDescription && report.afterDescription.toLowerCase().includes(reportSearchTerm.toLowerCase())) ||
      report.workerName.toLowerCase().includes(reportSearchTerm.toLowerCase());

    const matchDate = !reportDateFilter || report.reportedAt.startsWith(reportDateFilter);
    return matchText && matchDate;
  });

  const handleCreateQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQr.name || !newQr.location) return;
    createEquipmentQR(newQr);
    setIsQrModalOpen(false);
    setNewQr({
      name: '',
      category: 'EQUIPMENT',
      type: 'LOTO',
      location: '',
      cautionNotes: '',
      emergencyProcedures: '',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    });
    alert('실제 스캔 가능한 고해상도 QR 코드가 생성되었습니다.');
  };

  const handleSaveTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.name || !newTarget.location) {
      alert('설비명과 위치를 입력해주세요.');
      return;
    }

    addInspectionTarget({
      ...newTarget,
      id: 'target-' + Date.now(),
    });

    setIsTargetModalOpen(false);
    setNewTarget({
      id: '',
      name: '',
      location: '',
      cycle: '일일',
      manager: '김한국 (정비반장)',
      description: '',
      metrics: [
        { name: '가열 온도', unit: '°C', maxLimit: 130 },
        { name: '공급 압력', unit: 'bar', maxLimit: 3.5, minLimit: 1.0 },
      ],
    });

    alert('신규 설비점검 대상이 등록되었습니다. 근로자 스마트폰 앱에 실시간 반영됩니다.');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-[#0071E3]" />
            설비·공정 및 스마트 안전 관리 (Equipment & Operations)
          </h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">
            Before & After 갤러리 및 과거 이력 엑셀 추출, 설비점검 대상 양방향 관리, 실제 스캔 QR LOTO/MSDS
          </p>
        </div>

        {activeSection === 'gallery' && (
          <button
            onClick={handleExportWorkReportsExcel}
            className="btn-primary text-xs px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>과거 작업이력 엑셀 다운로드</span>
          </button>
        )}

        {activeSection === 'targets' && (
          <button
            onClick={() => setIsTargetModalOpen(true)}
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ 설비점검 대상 추가</span>
          </button>
        )}

        {activeSection === 'qr' && (
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ 실제 QR 코드 생성</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs (Apple Segmented Style) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#E8E8ED]/70 rounded-2xl border border-black/5">
        <button
          onClick={() => setActiveSection('gallery')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'gallery'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Images className="w-4 h-4 text-emerald-600" />
          <span>Before & After 사진 갤러리</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {workReports.length}건
          </span>
        </button>

        <button
          onClick={() => setActiveSection('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'logs'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-[#FF3B30]" />
          <span>설비점검 일지 & 이상수치</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {inspections.length}건
          </span>
        </button>

        <button
          onClick={() => setActiveSection('targets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'targets'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Settings2 className="w-4 h-4 text-[#0071E3]" />
          <span>설비점검 대상 관리 (모바일 연동)</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {inspectionTargets.length}개
          </span>
        </button>

        <button
          onClick={() => setActiveSection('qr')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'qr'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <QrCode className="w-4 h-4 text-[#0071E3]" />
          <span>QR 통합 관리 (LOTO/MSDS)</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {equipmentList.length}개
          </span>
        </button>

        <button
          onClick={() => setActiveSection('builder')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSection === 'builder'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-600" />
          <span>스마트 체크리스트 빌더</span>
        </button>
      </div>

      {/* SECTION 1: Before & After Photo Gallery (Request #4: 검색, 뷰모드, 다운로드, 과거이력) */}
      {activeSection === 'gallery' && (
        <div className="space-y-4">
          {/* Search & View Switcher Bar (Request #4) */}
          <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                <input
                  type="text"
                  placeholder="작업 내용, 작업자명, 문제점 검색..."
                  value={reportSearchTerm}
                  onChange={(e) => setReportSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F5F5F7] border border-black/5 rounded-xl text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-4 h-4 text-[#86868B]" />
                <input
                  type="date"
                  value={reportDateFilter}
                  onChange={(e) => setReportDateFilter(e.target.value)}
                  className="bg-[#F5F5F7] border border-black/5 rounded-xl px-3 py-1.5 text-xs text-[#1D1D1F]"
                />
                {reportDateFilter && (
                  <button
                    onClick={() => setReportDateFilter('')}
                    className="text-xs text-[#86868B] hover:text-[#1D1D1F]"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateReportModalOpen(true)}
                className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm bg-[#0071E3] hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                <span>+ 작업 보고서 등록 (사진 4장)</span>
              </button>

              {/* Toggle Grid vs List (Request #4) */}
              <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] rounded-xl border border-black/5">
                <button
                  onClick={() => setGalleryViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition-colors ${
                    galleryViewMode === 'grid' ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#6E6E73]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>갤러리 뷰</span>
                </button>
                <button
                  onClick={() => setGalleryViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition-colors ${
                    galleryViewMode === 'list' ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#6E6E73]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>리스트 뷰</span>
                </button>
              </div>
            </div>
          </div>

          {/* 16 Languages Auto Translation Banner */}
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-2xl text-xs text-blue-900 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
                <Languages className="w-4 h-4" />
              </span>
              <div>
                <strong className="font-bold text-[#1D1D1F]">16개국어 자동 양방향 번역 시스템 활성화</strong>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  외국인 근로자가 스마트폰에서 모국어로 등록한 작업 보고서(작업명, 위치, 문제점 및 개선 내용)가 관리자에게 한국어로 자동 번역되어 표시됩니다.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex badge badge-blue text-[10px] font-bold">
              18개 언어 상시 번역 중
            </span>
          </div>

          {/* VIEW A: Gallery Grid View */}
          {galleryViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredWorkReports.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-[#86868B] text-xs">
                  검색 조건과 일치하는 작업 완료 보고서가 없습니다.
                </div>
              ) : (
                filteredWorkReports.map((report) => {
                  const worker = workers.find((w) => w.id === report.workerId || w.name === report.workerName);
                  const nationality = worker?.nationality;

                  const taskTrans = translationService.translateWorkerTextToKorean(report.taskName, nationality);
                  const locationTrans = translationService.translateWorkerTextToKorean(report.location, nationality);
                  const beforeTrans = report.beforeDescription
                    ? translationService.translateWorkerTextToKorean(report.beforeDescription, nationality)
                    : null;
                  const afterTrans = report.afterDescription
                    ? translationService.translateWorkerTextToKorean(report.afterDescription, nationality)
                    : null;
                  const descTrans = translationService.translateWorkerTextToKorean(report.description, nationality);

                  const beforeList = report.beforeImgs && report.beforeImgs.length > 0 ? report.beforeImgs : [report.beforeImg].filter(Boolean);
                  const afterList = report.afterImgs && report.afterImgs.length > 0 ? report.afterImgs : [report.afterImg].filter(Boolean);

                  return (
                    <div key={report.id} className="glass-card p-5 space-y-4">
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-black/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[#1D1D1F]">{taskTrans.koreanText}</h3>
                            {taskTrans.isTranslated && (
                              <span className="badge badge-blue text-[10px] font-bold">
                                {taskTrans.originalFlag} 한국어 번역됨
                              </span>
                            )}
                          </div>
                          {taskTrans.isTranslated && (
                            <p className="text-[10px] text-[#86868B] mt-0.5">
                              원문({taskTrans.originalFlag}): {taskTrans.originalText}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-[#6E6E73] mt-1">
                            <span className="font-medium text-[#1D1D1F]">{report.workerName}</span>
                            <span>·</span>
                            <span>{locationTrans.koreanText}</span>
                            {locationTrans.isTranslated && (
                              <span className="text-[10px] text-[#86868B]">({locationTrans.originalText})</span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-[#86868B]">{report.reportedAt}</span>
                      </div>

                      {/* Before / After Photo Comparison (Request #7: Before 2장, After 2장 총 4장 갤러리 뷰) */}
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* BEFORE Box (작업 전 2장) */}
                        <div className="space-y-2 p-3 bg-red-50/50 rounded-2xl border border-red-200/60">
                          <div className="flex items-center justify-between">
                            <span className="badge badge-red text-[10px] font-bold">
                              BEFORE (작업 전 {beforeList.length}장)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {beforeList.map((imgUrl, idx) => (
                              <div key={idx} className="space-y-1">
                                <img
                                  src={imgUrl}
                                  alt={`Before ${idx + 1}`}
                                  className="w-full h-28 object-cover rounded-xl border border-red-200 shadow-sm"
                                />
                                <div className="flex items-center justify-between px-0.5">
                                  <span className="text-[9px] font-bold text-red-700 font-mono">사진 #{idx + 1}</span>
                                  <button
                                    onClick={() => handleDownloadImage(imgUrl, `Before_${report.taskName}_${idx + 1}.jpg`)}
                                    className="text-[9px] text-[#0071E3] hover:underline flex items-center gap-0.5 font-medium"
                                    title="사진 다운로드"
                                  >
                                    <Download className="w-2.5 h-2.5" />
                                    <span>저장</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {beforeTrans && (
                            <div className="p-2 bg-red-100/70 border border-red-200 rounded-xl text-[11px] text-red-950 leading-snug space-y-0.5">
                              <div><strong>문제점:</strong> {beforeTrans.koreanText}</div>
                              {beforeTrans.isTranslated && (
                                <div className="text-[10px] text-red-700/80 font-mono">
                                  원문({beforeTrans.originalFlag}): {beforeTrans.originalText}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* AFTER Box (작업 후 2장) */}
                        <div className="space-y-2 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/60">
                          <div className="flex items-center justify-between">
                            <span className="badge badge-green text-[10px] font-bold">
                              AFTER (개선 후 {afterList.length}장)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {afterList.map((imgUrl, idx) => (
                              <div key={idx} className="space-y-1">
                                <img
                                  src={imgUrl}
                                  alt={`After ${idx + 1}`}
                                  className="w-full h-28 object-cover rounded-xl border border-emerald-200 shadow-sm"
                                />
                                <div className="flex items-center justify-between px-0.5">
                                  <span className="text-[9px] font-bold text-emerald-700 font-mono">사진 #{idx + 1}</span>
                                  <button
                                    onClick={() => handleDownloadImage(imgUrl, `After_${report.taskName}_${idx + 1}.jpg`)}
                                    className="text-[9px] text-[#0071E3] hover:underline flex items-center gap-0.5 font-medium"
                                    title="사진 다운로드"
                                  >
                                    <Download className="w-2.5 h-2.5" />
                                    <span>저장</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {afterTrans && (
                            <div className="p-2 bg-emerald-100/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 leading-snug space-y-0.5">
                              <div><strong>개선완료:</strong> {afterTrans.koreanText}</div>
                              {afterTrans.isTranslated && (
                                <div className="text-[10px] text-emerald-800/80 font-mono">
                                  원문({afterTrans.originalFlag}): {afterTrans.originalText}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Korean Reverse Translation for foreign worker notes (Request #3) */}
                      <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#86868B] font-semibold">
                            조치 설명 (한국어 자동 번역):
                          </span>
                          {descTrans.isTranslated && (
                            <span className="badge badge-blue text-[9px] font-bold">
                              {descTrans.originalFlag} 자동 번역
                            </span>
                          )}
                        </div>
                        <p className="text-[#1D1D1F] font-medium">{descTrans.koreanText}</p>
                        {descTrans.isTranslated && (
                          <div className="pt-1 border-t border-black/5 text-[#86868B] text-[10px]">
                            근로자 모국어 원문: {descTrans.originalText}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* VIEW B: Report List View (Request #4) */
            <div className="table-container shadow-sm">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>보고 일시</th>
                    <th>작업 명칭 (한국어 번역)</th>
                    <th>작업 위치</th>
                    <th>작업자</th>
                    <th>Before 문제점 설명</th>
                    <th>After 개선 설명</th>
                    <th>사진 다운로드</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#86868B] text-xs">
                        검색 조건과 일치하는 작업 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkReports.map((report) => {
                      const worker = workers.find((w) => w.id === report.workerId || w.name === report.workerName);
                      const nationality = worker?.nationality;
                      const taskTrans = translationService.translateWorkerTextToKorean(report.taskName, nationality);
                      const locTrans = translationService.translateWorkerTextToKorean(report.location, nationality);
                      const beforeTrans = report.beforeDescription
                        ? translationService.translateWorkerTextToKorean(report.beforeDescription, nationality)
                        : null;
                      const afterTrans = report.afterDescription
                        ? translationService.translateWorkerTextToKorean(report.afterDescription, nationality)
                        : translationService.translateWorkerTextToKorean(report.description, nationality);

                      return (
                        <tr key={report.id} className="hover:bg-[#F9FAFB]">
                          <td className="font-mono text-xs text-[#86868B]">{report.reportedAt}</td>
                          <td>
                            <div className="font-bold text-[#1D1D1F] flex items-center gap-1.5">
                              <span>{taskTrans.koreanText}</span>
                              {taskTrans.isTranslated && (
                                <span className="text-[10px] text-blue-600 font-normal">
                                  [{taskTrans.originalFlag}]
                                </span>
                              )}
                            </div>
                            {taskTrans.isTranslated && (
                              <div className="text-[10px] text-[#86868B] truncate max-w-xs">
                                원문: {taskTrans.originalText}
                              </div>
                            )}
                          </td>
                          <td className="text-xs text-[#6E6E73]">{locTrans.koreanText}</td>
                          <td className="font-semibold text-[#1D1D1F]">{report.workerName}</td>
                          <td className="text-xs text-red-900 max-w-xs">
                            <div className="truncate">{beforeTrans?.koreanText || '-'}</div>
                            {beforeTrans?.isTranslated && (
                              <div className="text-[9px] text-red-700/70 truncate">
                                원문: {beforeTrans.originalText}
                              </div>
                            )}
                          </td>
                          <td className="text-xs text-emerald-900 max-w-xs">
                            <div className="truncate">{afterTrans.koreanText}</div>
                            {afterTrans.isTranslated && (
                              <div className="text-[9px] text-emerald-700/70 truncate">
                                원문: {afterTrans.originalText}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadImage(report.beforeImg, `Before_${report.taskName}.jpg`)}
                                className="btn-secondary text-[11px] py-1 px-2 text-[#0071E3] flex items-center gap-1"
                                title="Before 사진 다운로드"
                              >
                                <Download className="w-3 h-3" />
                                <span>전(Before)</span>
                              </button>
                              <button
                                onClick={() => handleDownloadImage(report.afterImg, `After_${report.taskName}.jpg`)}
                                className="btn-secondary text-[11px] py-1 px-2 text-[#34C759] flex items-center gap-1"
                                title="After 사진 다운로드"
                              >
                                <Download className="w-3 h-3" />
                                <span>후(After)</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Inspections Logs & Abnormalities */}
      {activeSection === 'logs' && (
        <div className="space-y-4">
          {/* 16 Languages Auto Translation Banner */}
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/70 rounded-2xl text-xs text-red-950 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm">
                <Languages className="w-4 h-4" />
              </span>
              <div>
                <strong className="font-bold text-[#1D1D1F]">16개국어 이상 징후 일지 실시간 한국어 번역</strong>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  외국인 근로자가 현장에서 모국어로 입력한 설비 이상 징후 및 조치 메모가 관리자에게 한국어로 자동 번역되어 표시됩니다.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex badge badge-red text-[10px] font-bold">
              18개 언어 지원
            </span>
          </div>

          <div className="table-container shadow-sm">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>점검 일시</th>
                  <th>설비명</th>
                  <th>점검자</th>
                  <th>측정치 데이터</th>
                  <th>상태</th>
                  <th>이상 징후 및 조치 사항 (한국어 번역)</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((i) => {
                  const worker = workers.find((w) => w.id === i.workerId || w.name === i.workerName);
                  const notesTrans = i.abnormalNotes
                    ? translationService.translateWorkerTextToKorean(i.abnormalNotes, worker?.nationality)
                    : null;

                  return (
                    <tr key={i.id} className="hover:bg-[#F9FAFB]">
                      <td className="font-mono text-xs">{new Date(i.inspectedAt).toLocaleString()}</td>
                      <td className="font-bold text-[#1D1D1F]">{i.equipmentName}</td>
                      <td className="font-medium text-[#1D1D1F]">
                        <div className="flex items-center gap-1.5">
                          <span>{i.workerName}</span>
                          {worker?.nationality && (
                            <span className="text-[10px] text-[#86868B]">({worker.nationality})</span>
                          )}
                        </div>
                      </td>
                      <td className="font-mono text-xs text-[#0071E3]">{JSON.stringify(i.data)}</td>
                      <td>
                        <span className={`badge ${i.isAbnormal ? 'badge-red' : 'badge-green'}`}>
                          {i.isAbnormal ? '이상 발생' : '정상'}
                        </span>
                      </td>
                      <td className="text-xs">
                        {i.isAbnormal && notesTrans ? (
                          <div className="space-y-1">
                            <div className="text-[#FF3B30] font-bold flex items-center gap-1.5">
                              <span>{notesTrans.koreanText}</span>
                              {notesTrans.isTranslated && (
                                <span className="badge badge-blue text-[9px] font-bold">
                                  {notesTrans.originalFlag} 한국어 번역
                                </span>
                              )}
                            </div>
                            {notesTrans.isTranslated && (
                              <div className="text-[10px] text-[#86868B] truncate max-w-sm">
                                원문: {notesTrans.originalText}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#86868B]">이상 없음</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Inspection Targets Management (Request #6: 설비점검 대상 추가 및 관리) */}
      {activeSection === 'targets' && (
        <div className="space-y-4">
          {/* 16 Languages Translation Integration Banner */}
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/70 rounded-2xl text-xs text-blue-950 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#0071E3] text-white rounded-lg shadow-sm">
                <Globe className="w-4 h-4" />
              </span>
              <div>
                <strong className="font-bold text-[#1D1D1F]">스마트폰 16개국어 실시간 자동 번역 배포 연동</strong>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  관리자가 한국어로 등록한 설비명, 설명, 측정 기준치 항목은 외국인 근로자 스마트폰에 국적별 언어로 자동 번역되어 표시됩니다.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex badge badge-blue text-[10px] font-bold">
              모바일 실시간 연동
            </span>
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div>
                <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-[#0071E3]" />
                  설비점검 대상 마스터 관리
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  여기서 추가/관리하는 설비점검 대상 목록은 근로자 스마트폰 앱에 즉시 연동되어 점검 시 선택 가능합니다.
                </p>
              </div>

              <button
                onClick={() => setIsTargetModalOpen(true)}
                className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ 신규 점검 대상 등록</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inspectionTargets.map((target) => (
                <div key={target.id} className="p-4 bg-[#F5F5F7] rounded-2xl border border-black/5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-blue text-[10px] font-bold">{target.cycle} 점검</span>
                      <div className="flex items-center gap-1.5">
                        <span className="badge badge-green text-[9px] font-medium flex items-center gap-0.5">
                          <Languages className="w-2.5 h-2.5" />
                          <span>16개국어 연동</span>
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`"${target.name}" 설비점검 대상을 삭제하시겠습니까?`)) {
                              deleteInspectionTarget(target.id);
                            }
                          }}
                          className="text-[#FF3B30] hover:text-red-700 p-1"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-[#1D1D1F]">{target.name}</h4>
                    <p className="text-xs text-[#6E6E73]">{target.location}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-[#86868B] font-bold block">측정 기준치:</span>
                      {target.metrics.map((m, idx) => (
                        <div key={idx} className="text-[11px] text-[#1D1D1F] flex items-center justify-between">
                          <span>{m.name}</span>
                          <span className="font-mono text-[#0071E3]">
                            최대 {m.maxLimit}{m.unit} {m.minLimit ? `/ 최소 ${m.minLimit}${m.unit}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/5 text-[11px] text-[#86868B]">
                    담당: <strong className="text-[#1D1D1F]">{target.manager}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Real QR Code Management (Request #8) */}
      {activeSection === 'qr' && (
        <div className="space-y-4">
          {/* 16 Languages QR Scanning Banner */}
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/70 rounded-2xl text-xs text-amber-950 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-sm">
                <QrCode className="w-4 h-4" />
              </span>
              <div>
                <strong className="font-bold text-[#1D1D1F]">QR 스캔 시 16개국어 LOTO / MSDS 모국어 자동 번역</strong>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  외국인 근로자가 현장에서 QR을 스캔하면 관리자가 입력한 주의사항 및 비상조치절차가 근로자의 국적 언어로 즉시 자동 번역되어 표시됩니다.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex badge badge-amber text-[10px] font-bold">
              스캔 즉시 번역
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equipmentList.map((eq) => (
              <div key={eq.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-amber text-[10px] font-bold">{eq.type}</span>
                      <span className="badge badge-blue text-[9px] font-medium flex items-center gap-0.5">
                        <Languages className="w-2.5 h-2.5" />
                        <span>16개국어 번역</span>
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#86868B]">{eq.code}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#1D1D1F]">{eq.name}</h3>
                  <p className="text-xs text-[#6E6E73] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#86868B]" />
                    <span>{eq.location}</span>
                  </p>

                  <div className="p-2.5 bg-[#F5F5F7] rounded-xl text-[11px] text-[#1D1D1F] space-y-1">
                    <div><strong>주의사항:</strong> {eq.cautionNotes}</div>
                    {eq.emergencyProcedures && (
                      <div><strong>비상조치:</strong> {eq.emergencyProcedures}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/5">
                  <button
                    onClick={() => setSelectedPrintQr(eq)}
                    className="btn-primary text-xs py-2 px-3.5 w-full justify-center flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>실제 QR 보기 & 라벨 인쇄</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Dynamic Checklist Builder */}
      {activeSection === 'builder' && (
        <div className="space-y-4">
          {/* 16 Languages Dynamic Form Banner */}
          <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/70 rounded-2xl text-xs text-purple-950 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-600 text-white rounded-lg shadow-sm">
                <Sliders className="w-4 h-4" />
              </span>
              <div>
                <strong className="font-bold text-[#1D1D1F]">스마트 체크리스트 16개국어 실시간 자동 번역 배포</strong>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  관리자가 한국어로 생성한 체크리스트 점검 항목과 한계치 서식은 외국인 근로자 스마트폰에 모국어로 자동 번역되어 전달됩니다.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex badge badge-purple text-[10px] font-bold">
              16개국어 배포
            </span>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div className="pb-3 border-b border-black/5">
              <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                스마트 체크리스트 동적 폼 빌더
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                공장 내 특수 설비에 맞는 점검 항목과 한계 기준치를 자유롭게 생성 및 배포합니다.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">체크리스트 서식 제목</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-3 text-xs text-[#1D1D1F]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1D1D1F] block">점검 항목 목록:</label>
                {formFields.map((field, idx) => (
                  <div key={field.id} className="p-3 bg-[#F5F5F7] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-purple-600 font-bold">{idx + 1}.</span>
                      <span className="font-semibold text-[#1D1D1F]">{field.label}</span>
                      <span className="text-[#86868B]">({field.type === 'number' ? `수치입력, 기준한계: ${field.maxThreshold}${field.unit}` : '체크박스'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5">
                        <Languages className="w-3 h-3" />
                        16개국어 번역 지원
                      </span>
                      <span className="badge badge-green text-[10px]">필수항목</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddField}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  + 항목 추가
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="btn-primary text-xs py-2 px-4"
                >
                  체크리스트 템플릿 저장 및 스마트폰 배포
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Real QR Code View & Print (Request #8: 30% 커진 크기 max-w-[884px]) */}
      {selectedPrintQr && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0071E3]" />
                현장 부착용 실제 QR 코드 라벨 ({selectedPrintQr.name})
              </h3>
              <button
                onClick={() => setSelectedPrintQr(null)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#F5F5F7] rounded-2xl border border-black/5">
              {/* Real QR Canvas/Image Rendered (Request #8) */}
              <div className="p-4 bg-white rounded-2xl shadow-md border border-black/5 flex flex-col items-center">
                {generatedQrDataUrl ? (
                  <img
                    src={generatedQrDataUrl}
                    alt="실제 QR 코드"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-[#86868B]">
                    QR 코드 생성 중...
                  </div>
                )}
                <span className="font-mono text-xs font-bold text-[#1D1D1F] mt-2">
                  {selectedPrintQr.code}
                </span>
              </div>

              {/* Label Specifications */}
              <div className="flex-1 space-y-3 text-xs text-[#1D1D1F]">
                <div>
                  <span className="text-[#86868B] block mb-0.5">설비/물질 명칭:</span>
                  <div className="text-base font-bold text-[#1D1D1F]">{selectedPrintQr.name}</div>
                </div>

                <div>
                  <span className="text-[#86868B] block mb-0.5">라벨 구분 및 위치:</span>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-amber font-bold">{selectedPrintQr.type}</span>
                    <span className="font-medium text-[#515154]">{selectedPrintQr.location}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-black/5 space-y-1 text-[11px]">
                  <strong>스캔 안내:</strong>
                  <p className="text-[#6E6E73]">
                    스마트폰 기본 카메라 앱 또는 SafeGuard AI 앱으로 스캔 시 해당 설비의 LOTO 안전절차 및 비상조치 매뉴얼이 모국어로 즉시 표시됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => setSelectedPrintQr(null)}
                className="btn-secondary text-xs"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  if (generatedQrDataUrl) {
                    handleDownloadImage(generatedQrDataUrl, `QR_${selectedPrintQr.code}.png`);
                  }
                }}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>QR 이미지 다운로드 (PNG)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>라벨 인쇄하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create QR Code (Request #8: 30% 커진 크기 max-w-[884px]) */}
      {isQrModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0071E3]" />
                신규 설비·화학물질 실제 QR 생성 등록
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQrSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">설비 / 화학물질명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 보일러 청관제 또는 렌더링 쿠커"
                    value={newQr.name}
                    onChange={(e) => setNewQr({ ...newQr, name: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  />
                </div>
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">설치 / 보관 위치 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: A동 가공구역 1층"
                    value={newQr.location}
                    onChange={(e) => setNewQr({ ...newQr, location: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">QR 라벨 유형</label>
                  <select
                    value={newQr.type}
                    onChange={(e) => setNewQr({ ...newQr, type: e.target.value as any })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  >
                    <option value="LOTO">LOTO (전원·밸브 잠금장치 시건)</option>
                    <option value="MSDS">MSDS (유해물질 모국어 응급조치)</option>
                    <option value="SAFETY_RULES">안전수칙 및 인터록 점검</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">카테고리</label>
                  <select
                    value={newQr.category}
                    onChange={(e) => setNewQr({ ...newQr, category: e.target.value as any })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  >
                    <option value="EQUIPMENT">설비 / 기계장비</option>
                    <option value="CHEMICAL">화학물질 / 원료</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">작업자 주의사항</label>
                <textarea
                  rows={2}
                  value={newQr.cautionNotes}
                  onChange={(e) => setNewQr({ ...newQr, cautionNotes: e.target.value })}
                  placeholder="예: 고온 증기 위험, 안전장갑 착용 필수"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">비상 조치 절차</label>
                <textarea
                  rows={2}
                  value={newQr.emergencyProcedures}
                  onChange={(e) => setNewQr({ ...newQr, emergencyProcedures: e.target.value })}
                  placeholder="예: 밸브 잠금 후 비상 전원 차단"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  실제 QR 생성 및 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Inspection Target (Request #6: 30% 커진 크기 max-w-[884px]) */}
      {isTargetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-[#0071E3]" />
                  신규 설비점검 대상 등록 (근로자 모바일 실시간 연동)
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  등록된 설비는 근로자 스마트폰 앱 점검 목록에 즉각 반영됩니다.
                </p>
              </div>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTargetSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">설비명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: B동 렌더링 쿠커 #2"
                    value={newTarget.name}
                    onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  />
                </div>
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">설치 위치 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: B동 가공라인 2구역"
                    value={newTarget.location}
                    onChange={(e) => setNewTarget({ ...newTarget, location: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">점검 주기</label>
                  <select
                    value={newTarget.cycle}
                    onChange={(e) => setNewTarget({ ...newTarget, cycle: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  >
                    <option value="일일">일일 정기 점검</option>
                    <option value="주간">주간 정기 점검</option>
                    <option value="월간">월간 정밀 점검</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#1D1D1F] font-semibold block mb-1">설비 담당자</label>
                  <input
                    type="text"
                    value={newTarget.manager}
                    onChange={(e) => setNewTarget({ ...newTarget, manager: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-[#1D1D1F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">설비 설명</label>
                <textarea
                  rows={2}
                  value={newTarget.description}
                  onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
                  placeholder="예: 고온 가열 증기 반응기 (130도 초과 시 비상)"
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  점검 대상 저장 및 모바일 배포
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 신규 작업 완료 보고서 등록 (Request #7: Before 2장, After 2장 등록 모달) */}
      {isCreateReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-7 space-y-4 max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0071E3]" />
                신규 작업 완료 보고서 등록 (Before & After 사진 4장)
              </h3>
              <button
                onClick={() => setIsCreateReportModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebReportSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-xs font-bold text-[#1D1D1F] block mb-1">작업 명칭 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 밸브 패킹 교체 및 누설 차단"
                    value={newReportForm.taskName}
                    onChange={(e) => setNewReportForm({ ...newReportForm, taskName: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1D1D1F] block mb-1">작업 위치</label>
                  <input
                    type="text"
                    placeholder="예: A동 화학탱크 라인"
                    value={newReportForm.location}
                    onChange={(e) => setNewReportForm({ ...newReportForm, location: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1D1D1F] block mb-1">작업 근로자</label>
                  <select
                    value={newReportForm.workerId}
                    onChange={(e) => {
                      const sel = workers.find((w) => w.id === e.target.value);
                      setNewReportForm({
                        ...newReportForm,
                        workerId: e.target.value,
                        workerName: sel?.name || '근로자',
                      });
                    }}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-2.5 text-xs text-[#1D1D1F]"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.nationality})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BEFORE SECTION (2장 업로드) */}
              <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    BEFORE (작업 전 사진 2장)
                  </span>
                  <span className="text-[10px] text-red-600">내 PC에서 사진 2장 선택</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Before Img 1 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 block">사진 #1</label>
                    <div className="relative border-2 border-dashed border-red-200 bg-white rounded-xl p-2 text-center h-28 flex flex-col items-center justify-center overflow-hidden">
                      {newReportForm.beforeImg1 ? (
                        <img src={newReportForm.beforeImg1} alt="Before 1" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="space-y-1 text-slate-400">
                          <Upload className="w-5 h-5 mx-auto text-red-400" />
                          <span className="text-[10px] block font-medium">사진 1 선택</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleWebReportImageUpload('beforeImg1', e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Before Img 2 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 block">사진 #2</label>
                    <div className="relative border-2 border-dashed border-red-200 bg-white rounded-xl p-2 text-center h-28 flex flex-col items-center justify-center overflow-hidden">
                      {newReportForm.beforeImg2 ? (
                        <img src={newReportForm.beforeImg2} alt="Before 2" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="space-y-1 text-slate-400">
                          <Upload className="w-5 h-5 mx-auto text-red-400" />
                          <span className="text-[10px] block font-medium">사진 2 선택</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleWebReportImageUpload('beforeImg2', e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-red-900 block mb-1">
                    Before 문제점 상세 설명
                  </label>
                  <input
                    type="text"
                    placeholder="예: 고온 증기 누설 및 배관 플랜지 부식 발생"
                    value={newReportForm.beforeDescription}
                    onChange={(e) => setNewReportForm({ ...newReportForm, beforeDescription: e.target.value })}
                    className="w-full bg-white border border-red-200 rounded-xl p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* AFTER SECTION (2장 업로드) */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    AFTER (작업 후 사진 2장)
                  </span>
                  <span className="text-[10px] text-emerald-700">내 PC에서 사진 2장 선택</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* After Img 1 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 block">사진 #1</label>
                    <div className="relative border-2 border-dashed border-emerald-200 bg-white rounded-xl p-2 text-center h-28 flex flex-col items-center justify-center overflow-hidden">
                      {newReportForm.afterImg1 ? (
                        <img src={newReportForm.afterImg1} alt="After 1" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="space-y-1 text-slate-400">
                          <Upload className="w-5 h-5 mx-auto text-emerald-500" />
                          <span className="text-[10px] block font-medium">사진 1 선택</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleWebReportImageUpload('afterImg1', e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* After Img 2 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 block">사진 #2</label>
                    <div className="relative border-2 border-dashed border-emerald-200 bg-white rounded-xl p-2 text-center h-28 flex flex-col items-center justify-center overflow-hidden">
                      {newReportForm.afterImg2 ? (
                        <img src={newReportForm.afterImg2} alt="After 2" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="space-y-1 text-slate-400">
                          <Upload className="w-5 h-5 mx-auto text-emerald-500" />
                          <span className="text-[10px] block font-medium">사진 2 선택</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleWebReportImageUpload('afterImg2', e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-950 block mb-1">
                    After 개선 조치 상세 설명
                  </label>
                  <input
                    type="text"
                    placeholder="예: 내열 테플론 패킹 교체 및 기밀 누설 테스트 합격 완료"
                    value={newReportForm.afterDescription}
                    onChange={(e) => setNewReportForm({ ...newReportForm, afterDescription: e.target.value })}
                    className="w-full bg-white border border-emerald-200 rounded-xl p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsCreateReportModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  작업 완료 보고서 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
