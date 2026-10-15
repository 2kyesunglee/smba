'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
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
} from 'lucide-react';

export const ComplianceExportView: React.FC = () => {
  const { workers, ptwList, inspections, signatures, documents } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState('2026-10');
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  // Trigger Real CSV/Excel Download
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
                `${idx + 1},${p.workDate},"${p.workerName}",외국인,"${p.taskName}","${p.hazardFactors}","${p.safetyMeasures}",서명완료,"${p.approvedBy || '관리자'}"`
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
        filename = `[외국인근로자]_인사기록_및_체류만료_현황_${selectedPeriod}.csv`;
        content =
          '성명,한국어명,외국인등록번호,국적,비자형태,계약시작일,계약만료일,특수검진일,앱연동상태\n' +
          workers
            .map(
              (w) =>
                `"${w.name}","${w.koreanName || ''}","${w.alienRegNumber || ''}","${w.nationality}","${w.visaType}","${w.contractStartDate}","${w.contractEndDate}","${w.specialHealthCheckDate || ''}","${w.status}"`
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
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            컴플라이언스 & 노동부·공단 제출 서류화 센터
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            중대재해처벌법 및 노동부 실사용 표준 양식(Excel/PDF) 원클릭 추출 및 출입국 연장 서류 게시판
          </p>
        </div>
      </div>

      {/* Compliance One-Click Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 space-y-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="badge badge-green">안전보건공단 표준 서식</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">안전보건관리 종합대장</h3>
            <p className="text-xs text-gray-400 mt-1">
              PTW 허가서, TBM 서명 데이터, 작업 전 안전수칙 일람표 통합 추출
            </p>
          </div>
          <button
            onClick={() => handleExportComplianceReport('SAFETY_LEDGER')}
            disabled={isExporting}
            className="btn-primary w-full justify-center text-xs bg-emerald-600 hover:bg-emerald-500"
          >
            <Download className="w-4 h-4" />
            원클릭 엑셀(CSV) 다운로드
          </button>
        </div>

        <div className="glass-card p-5 space-y-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="badge badge-blue">고용노동부 실사 대비</span>
            <FileCheck2 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">설비 점검 및 LOTO 일지</h3>
            <p className="text-xs text-gray-400 mt-1">
              설비별 온도·압력 측정 로그, 이상 수치 발생 및 조치 내역 일체
            </p>
          </div>
          <button
            onClick={() => handleExportComplianceReport('INSPECTION_LOG')}
            disabled={isExporting}
            className="btn-primary w-full justify-center text-xs"
          >
            <Download className="w-4 h-4" />
            원클릭 점검일지 다운로드
          </button>
        </div>

        <div className="glass-card p-5 space-y-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="badge badge-purple">법무부 출입국 외국인청</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">외국인 인력 고용 현황표</h3>
            <p className="text-xs text-gray-400 mt-1">
              16개국 비자(E-9/E-7) 만료 일정, 근로계약서, 특수건강검진 이력
            </p>
          </div>
          <button
            onClick={() => handleExportComplianceReport('WORKER_HR')}
            disabled={isExporting}
            className="btn-secondary w-full justify-center text-xs text-purple-300 border-purple-500/30 hover:bg-purple-900/30"
          >
            <Download className="w-4 h-4" />
            원클릭 HR 명부 다운로드
          </button>
        </div>
      </div>

      {/* Official Immigration & Health Forms Download Center */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              출입국/체류연장 및 특수건강검진 표준 서식 자료실
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              관리자 및 외국인 근로자가 모바일 앱에서 즉시 열람 및 내려받을 수 있는 공식 문서입니다.
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{doc.title}</span>
                    <span className="badge badge-purple text-[10px]">{doc.category}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    파일명: {doc.fileName} · 용량: {doc.fileSize} · 누적 다운로드: {doc.downloadCount}회
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`[서식 다운로드] "${doc.fileName}" 파일 다운로드가 시작되었습니다.`);
                }}
                className="btn-secondary text-xs py-1.5 px-3 self-end sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                문서 다운로드
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
