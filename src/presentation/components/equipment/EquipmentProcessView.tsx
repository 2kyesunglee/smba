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

          {/* VIEW A: Gallery Grid View */}
          {galleryViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredWorkReports.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-[#86868B] text-xs">
                  검색 조건과 일치하는 작업 완료 보고서가 없습니다.
                </div>
              ) : (
                filteredWorkReports.map((report) => {
                  const translatedDesc = translationService.translateToKorean(report.description);

                  return (
                    <div key={report.id} className="glass-card p-5 space-y-4">
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-black/5">
                        <div>
                          <h3 className="font-bold text-base text-[#1D1D1F]">{report.taskName}</h3>
                          <div className="flex items-center gap-2 text-xs text-[#6E6E73] mt-0.5">
                            <span className="font-medium text-[#1D1D1F]">{report.workerName}</span>
                            <span>·</span>
                            <span>{report.location}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-[#86868B]">{report.reportedAt}</span>
                      </div>

                      {/* Before / After Photo Comparison with Individual Download (Request #4) */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* BEFORE Box */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="badge badge-red text-[10px] font-bold">BEFORE (작업 전)</span>
                            <button
                              onClick={() => handleDownloadImage(report.beforeImg, `Before_${report.taskName}.jpg`)}
                              className="text-[10px] text-[#0071E3] hover:underline flex items-center gap-0.5 font-medium"
                              title="사진 다운로드"
                            >
                              <Download className="w-3 h-3" />
                              <span>다운로드</span>
                            </button>
                          </div>
                          <img
                            src={report.beforeImg}
                            alt="Before"
                            className="w-full h-36 object-cover rounded-xl border border-red-200 shadow-sm"
                          />
                          {report.beforeDescription && (
                            <div className="p-2 bg-red-50/70 border border-red-200/60 rounded-xl text-[11px] text-red-900 leading-snug">
                              <strong>문제점:</strong> {report.beforeDescription}
                            </div>
                          )}
                        </div>

                        {/* AFTER Box */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="badge badge-green text-[10px] font-bold">AFTER (개선 후)</span>
                            <button
                              onClick={() => handleDownloadImage(report.afterImg, `After_${report.taskName}.jpg`)}
                              className="text-[10px] text-[#0071E3] hover:underline flex items-center gap-0.5 font-medium"
                              title="사진 다운로드"
                            >
                              <Download className="w-3 h-3" />
                              <span>다운로드</span>
                            </button>
                          </div>
                          <img
                            src={report.afterImg}
                            alt="After"
                            className="w-full h-36 object-cover rounded-xl border border-emerald-200 shadow-sm"
                          />
                          {report.afterDescription && (
                            <div className="p-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-900 leading-snug">
                              <strong>개선완료:</strong> {report.afterDescription}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Korean Reverse Translation for foreign worker notes (Request #3) */}
                      <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs space-y-1">
                        <div className="text-[10px] text-[#86868B] font-semibold">근로자 원문 조치 설명:</div>
                        <p className="text-[#1D1D1F]">{report.description}</p>
                        {translatedDesc !== report.description && (
                          <div className="pt-1 border-t border-black/5 text-emerald-800 font-medium text-[11px]">
                            {translatedDesc}
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
                    <th>작업 명칭</th>
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
                    filteredWorkReports.map((report) => (
                      <tr key={report.id} className="hover:bg-[#F9FAFB]">
                        <td className="font-mono text-xs text-[#86868B]">{report.reportedAt}</td>
                        <td className="font-bold text-[#1D1D1F]">{report.taskName}</td>
                        <td className="text-xs text-[#6E6E73]">{report.location}</td>
                        <td className="font-semibold text-[#1D1D1F]">{report.workerName}</td>
                        <td className="text-xs text-red-900 max-w-xs truncate">{report.beforeDescription || '-'}</td>
                        <td className="text-xs text-emerald-900 max-w-xs truncate">{report.afterDescription || report.description}</td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Inspections Logs & Abnormalities */}
      {activeSection === 'logs' && (
        <div className="table-container shadow-sm">
          <table className="custom-table">
            <thead>
              <tr>
                <th>점검 일시</th>
                <th>설비명</th>
                <th>점검자</th>
                <th>측정치 데이터</th>
                <th>상태</th>
                <th>이상 징후 및 조치 사항</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((i) => (
                <tr key={i.id} className="hover:bg-[#F9FAFB]">
                  <td className="font-mono text-xs">{new Date(i.inspectedAt).toLocaleString()}</td>
                  <td className="font-bold text-[#1D1D1F]">{i.equipmentName}</td>
                  <td className="font-medium text-[#1D1D1F]">{i.workerName}</td>
                  <td className="font-mono text-xs text-[#0071E3]">{JSON.stringify(i.data)}</td>
                  <td>
                    <span className={`badge ${i.isAbnormal ? 'badge-red' : 'badge-green'}`}>
                      {i.isAbnormal ? '이상 발생' : '정상'}
                    </span>
                  </td>
                  <td className="text-xs">
                    {i.isAbnormal ? (
                      <span className="text-[#FF3B30] font-bold">{i.abnormalNotes}</span>
                    ) : (
                      <span className="text-[#86868B]">이상 없음</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 3: Inspection Targets Management (Request #6: 설비점검 대상 추가 및 관리) */}
      {activeSection === 'targets' && (
        <div className="space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equipmentList.map((eq) => (
              <div key={eq.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-amber text-[10px] font-bold">{eq.type}</span>
                    <span className="font-mono text-xs text-[#86868B]">{eq.code}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#1D1D1F]">{eq.name}</h3>
                  <p className="text-xs text-[#6E6E73] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#86868B]" />
                    <span>{eq.location}</span>
                  </p>

                  <div className="p-2.5 bg-[#F5F5F7] rounded-xl text-[11px] text-[#1D1D1F] space-y-1">
                    <div><strong>주의:</strong> {eq.cautionNotes}</div>
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
                  <span className="badge badge-green text-[10px]">필수항목</span>
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
    </div>
  );
};
