'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { DocumentItem } from '@/infrastructure/storage/LocalStateStore';
import {
  FileSpreadsheet,
  Download,
  FileCheck2,
  FileText,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  Building2,
  Plus,
  Upload,
  X,
  Trash2,
  Check,
} from 'lucide-react';

export const ComplianceExportView: React.FC = () => {
  const { workers, ptwList, inspections, documents, addDocument, deleteDocument } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState('2026-10');
  const [isExporting, setIsExporting] = useState(false);

  // Request #9: Document Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    title: '',
    category: 'COMPLIANCE' as 'VISA' | 'HEALTH' | 'COMPLIANCE' | 'MANUAL',
    fileName: '신규문서.pdf',
    fileSize: '1.5 MB',
  });

  // Handle Real CSV/Excel Download
  const handleExportComplianceReport = (reportType: string) => {
    setIsExporting(true);

    setTimeout(() => {
      let content = '';
      let filename = '';

      if (reportType === 'SAFETY_LEDGER') {
        filename = `[안전보건공단_제출용]_안전보건관리종합대장_${selectedPeriod}.csv`;
        content =
          '일련번호,일자,근로자명,국적,작업종류,위험요인,안전대책,전자서명여부,승인자\n' +
          ptwList
            .map(
              (p, idx) =>
                `${idx + 1},${p.workDate},"${p.workerName}","${p.workerName}","${p.taskName}","${p.hazardFactors}","${p.safetyMeasures}",서명완료,"${p.approvedBy || '관리자'}"`
            )
            .join('\n');
      } else if (reportType === 'INSPECTION_LOG') {
        filename = `[노동부_실사대비]_설비안전점검일지_${selectedPeriod}.csv`;
        content =
          '점검일시,설비명,점검자,측정치,이상유무,조치사항\n' +
          inspections
            .map(
              (i) =>
                `"${new Date(i.inspectedAt).toLocaleString()}","${i.equipmentName || '설비'}","${i.workerName}","${JSON.stringify(i.data).replace(/"/g, '""')}","${i.isAbnormal ? '이상발생' : '정상'}","${i.abnormalNotes || '이상없음'}"`
            )
            .join('\n');
      } else {
        filename = `[근로자]_인사기록_및_체류만료_현황_${selectedPeriod}.csv`;
        content =
          '성명,한국어명,주민번호,국적,혈액형,재입국여부,비자형태,계약시작일,계약만료일,특수검진일,앱연동상태\n' +
          workers
            .map(
              (w) =>
                `"${w.name}","${w.koreanName || ''}","${w.alienRegNumber || ''}","${w.nationality}","${w.bloodType || 'A'}","${w.reEntryAllowed ? '해당' : '미해당'}","${w.visaType}","${w.contractStartDate}","${w.contractEndDate}","${w.specialHealthCheckDate || ''}","${w.status}"`
            )
            .join('\n');
      }

      // BOM for Korean Excel Support
      const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
    }, 500);
  };

  // Handle File Pick (Request #9)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setNewDocForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: `${sizeMB} MB`,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  // Submit New Document Upload (Request #9)
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.title || !newDocForm.fileName) {
      alert('문서 제목과 파일을 확인해주세요.');
      return;
    }

    const doc: DocumentItem = {
      id: 'doc-' + Date.now(),
      title: newDocForm.title,
      category: newDocForm.category,
      fileName: newDocForm.fileName,
      fileSize: newDocForm.fileSize,
      downloadCount: 0,
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    addDocument(doc);
    setIsUploadModalOpen(false);
    setNewDocForm({
      title: '',
      category: 'COMPLIANCE',
      fileName: '신규문서.pdf',
      fileSize: '1.5 MB',
    });

    alert(`[문서 업로드 완료] "${doc.title}" 파일이 자료실에 성공적으로 등록되었습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            컴플라이언스 & 노동부·공단 제출 서류화 센터
          </h2>
          <p className="text-xs text-[#86868B] mt-1 pl-12">
            중대재해처벌법 및 노동부 실사 표준 서식 원클릭 추출 및 출입국·보건·법정 문서 업로드/관리
          </p>
        </div>

        {/* Request #9: 문서 업로드 버튼 */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>+ 신규 법정 문서 업로드</span>
        </button>
      </div>

      {/* Compliance One-Click Export Cards (Apple Style Clean Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 space-y-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="badge badge-green">안전보건공단 표준 서식</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#1D1D1F] text-base">안전보건관리 종합대장</h3>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              PTW 허가서, TBM 서명 데이터, 작업 전 안전수칙 일람표 통합 추출
            </p>
          </div>
          <button
            onClick={() => handleExportComplianceReport('SAFETY_LEDGER')}
            disabled={isExporting}
            className="btn-primary w-full justify-center text-xs bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Download className="w-4 h-4" />
            원클릭 엑셀(CSV) 다운로드
          </button>
        </div>

        <div className="glass-card p-6 space-y-4 border-l-4 border-l-[#0071E3]">
          <div className="flex items-center justify-between">
            <span className="badge badge-blue">고용노동부 실사 대비</span>
            <FileCheck2 className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div>
            <h3 className="font-bold text-[#1D1D1F] text-base">설비 점검 및 LOTO 일지</h3>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              설비별 온도·압력 측정 로그, 이상 수치 발생 및 조치 내역 일체
            </p>
          </div>
          <button
            onClick={() => handleExportComplianceReport('INSPECTION_LOG')}
            disabled={isExporting}
            className="btn-primary w-full justify-center text-xs shadow-sm"
          >
            <Download className="w-4 h-4" />
            원클릭 점검일지 다운로드
          </button>
        </div>

        <div className="glass-card p-6 space-y-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="badge badge-purple">법무부 출입국 외국인청</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#1D1D1F] text-base">근로자 인력 고용 현황표</h3>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              17개국 비자(E-9/E-7) 만료 일정, 근로계약서, 특수건강검진 이력
            </p>
          </div>
          <button
            onClick={() => handleExportComplianceReport('WORKER_HR')}
            disabled={isExporting}
            className="btn-secondary w-full justify-center text-xs text-purple-700 border-purple-200 hover:bg-purple-50 shadow-sm"
          >
            <Download className="w-4 h-4" />
            원클릭 HR 명부 다운로드
          </button>
        </div>
      </div>

      {/* Official Immigration & Health Forms Download/Upload Center */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 gap-3">
          <div>
            <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0071E3]" />
              출입국·체류연장 및 안전보건 서식 자료실 (관리자 업로드 & 다운로드)
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              관리자가 직접 새 문서를 업로드하여 보관하고, 필요 시 언제든 즉시 다운로드받을 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>문서 업로드</span>
          </button>
        </div>

        <div className="divide-y divide-black/5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAFB] px-3 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-50 text-[#0071E3] rounded-xl mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1D1D1F]">{doc.title}</span>
                    <span className="badge badge-purple text-[10px] font-semibold">{doc.category}</span>
                  </div>
                  <div className="text-xs text-[#86868B] mt-1">
                    파일명: <span className="font-medium text-[#515154]">{doc.fileName}</span> · 용량: {doc.fileSize} · 등록일: {doc.uploadedAt} · 누적 다운로드: {doc.downloadCount}회
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    alert(`[서식 다운로드] "${doc.fileName}" 파일 다운로드가 시작되었습니다.`);
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>다운로드</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`"${doc.title}" 문서를 삭제하시겠습니까?`)) {
                      deleteDocument(doc.id);
                    }
                  }}
                  className="p-1.5 text-[#FF3B30] hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Upload Document Modal (Request #9: 30% 커진 크기 max-w-[884px]) */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#0071E3]" />
                  신규 법정 및 컴플라이언스 문서 업로드
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  출입국 신청서, 특수건강검진 사후관리, 안전 매뉴얼 등 관리자 문서를 등록합니다.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">
                  문서 명칭 (제목) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026년 하반기 외국인 근로자 체류기간 연장허가 표준 서식"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-3 text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1D1D1F] block mb-1">
                  문서 분류 카테고리 *
                </label>
                <select
                  value={newDocForm.category}
                  onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value as any })}
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl p-3 text-xs text-[#1D1D1F]"
                >
                  <option value="VISA">출입국 / 비자 체류연장 (VISA)</option>
                  <option value="HEALTH">보건 / 특수건강검진 (HEALTH)</option>
                  <option value="COMPLIANCE">노동부 / 법정의무 컴플라이언스 (COMPLIANCE)</option>
                  <option value="MANUAL">현장 안전보건 지침 및 매뉴얼 (MANUAL)</option>
                </select>
              </div>

              {/* Real File Upload Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1D1D1F] block">
                  업로드할 파일 선택 (PDF, HWP, XLSX 등) *
                </label>
                <div className="p-4 bg-[#F5F5F7] border border-dashed border-gray-300 rounded-xl text-center space-y-2">
                  <input
                    type="file"
                    id="doc-file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="doc-file-upload"
                    className="btn-secondary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-[#0071E3]" />
                    <span>내 컴퓨터에서 파일 찾기</span>
                  </label>
                  <div className="text-xs text-[#515154] font-medium pt-1">
                    선택된 파일: <strong className="text-[#0071E3]">{newDocForm.fileName}</strong> ({newDocForm.fileSize})
                  </div>
                </div>
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
                  문서 자료실 업로드 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
