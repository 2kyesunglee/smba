'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
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
} from 'lucide-react';

export const EquipmentProcessView: React.FC = () => {
  const {
    equipmentList,
    templates,
    inspections,
    workReports,
    workers,
    createEquipmentQR,
    createTemplate,
    submitWorkReport,
  } = useAppStore();

  // Active section tab
  const [activeSection, setActiveSection] = useState<'qr' | 'builder' | 'logs' | 'gallery'>('qr');

  // QR Generator Form State
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

  // Selected QR for Label Print
  const [selectedPrintQr, setSelectedPrintQr] = useState<any | null>(null);

  // Dynamic Form Builder State
  const [formTitle, setFormTitle] = useState('신규 설비 정기점검 템플릿');
  const [formFields, setFormFields] = useState<any[]>([
    { id: 'f-1', label: '가열 온도', type: 'number', unit: '°C', maxThreshold: 120, required: true },
    { id: 'f-2', label: '공급 압력', type: 'number', unit: 'bar', maxThreshold: 3.0, required: true },
    { id: 'f-3', label: '이상 소음 유무', type: 'checkbox', required: true },
  ]);

  // Before & After Report Modal State (2 Before + 2 After photos)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    taskName: '보일러실 배관 보온재 교체 및 청소',
    location: 'B동 보일러실 2구역',
    workerId: workers[0]?.id || 'w-1',
    workerName: workers[0]?.name || '작업자',
    beforeImg1: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
    beforeImg2: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    afterImg1: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    afterImg2: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: '노후된 보온재 완전 철거 후 난연성 글라스울 재시공 및 밸브 누설 방지 조치 완료함.',
  });

  const handleAddField = () => {
    setFormFields([
      ...formFields,
      {
        id: 'f-' + Date.now(),
        label: '신규 점검 항목',
        type: 'number',
        unit: '값',
        maxThreshold: 100,
        required: true,
      },
    ]);
  };

  const handleSaveTemplate = () => {
    createTemplate({
      title: formTitle,
      type: 'CHECKLIST',
      description: '동적 폼 빌더로 생성된 설비 체크리스트',
      content: { fields: formFields },
    });
    alert('체크리스트 템플릿이 성공적으로 등록되었습니다. 근로자 모바일 앱에 즉시 배포됩니다.');
  };

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
  };

  const handleCreateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selWorker = workers.find((w) => w.id === newReport.workerId);
    const workerName = selWorker ? selWorker.name : newReport.workerName;

    const beforeImgs = [newReport.beforeImg1, newReport.beforeImg2].filter(Boolean);
    const afterImgs = [newReport.afterImg1, newReport.afterImg2].filter(Boolean);

    submitWorkReport(
      newReport.taskName,
      newReport.location,
      newReport.beforeImg1,
      newReport.afterImg1,
      newReport.description,
      beforeImgs,
      afterImgs
    );

    setIsReportModalOpen(false);
    alert('작업 전 2장, 작업 후 2장 사진이 포함된 완료 보고서가 성공적으로 등록되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </span>
            설비 및 공정 안전 관리 (Process & Equipment)
          </h2>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            QR 코드 LOTO/MSDS 관리, 스마트 체크리스트 폼 빌더, 점검 일지 및 Before & After 4분할 사진 갤러리
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSection === 'gallery' ? (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              신규 작업보고서 등록 (사진 4장)
            </button>
          ) : (
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              신규 QR 생성 등록
            </button>
          )}
        </div>
      </div>

      {/* Requirement 11: Prominent Large High-Visibility Navigation Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Tab 1: QR 통합 관리 (LOTO/MSDS) */}
          <button
            onClick={() => setActiveSection('qr')}
            className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 ${
              activeSection === 'qr'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR 통합 관리 (LOTO/MSDS)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeSection === 'qr' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {equipmentList.length}
            </span>
          </button>

          {/* Tab 2: 스마트 체크리스트 풀 빌더 */}
          <button
            onClick={() => setActiveSection('builder')}
            className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 ${
              activeSection === 'builder'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>스마트 체크리스트 풀 빌더</span>
          </button>

          {/* Tab 3: 설비 점검일지 & 이상수치 */}
          <button
            onClick={() => setActiveSection('logs')}
            className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 ${
              activeSection === 'logs'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-600'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>설비 점검일지 & 이상수치</span>
            {inspections.filter((i) => i.isAbnormal).length > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                경고 {inspections.filter((i) => i.isAbnormal).length}
              </span>
            )}
          </button>

          {/* Tab 4: Before & After 사진갤러리 */}
          <button
            onClick={() => setActiveSection('gallery')}
            className={`py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 ${
              activeSection === 'gallery'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <Images className="w-4 h-4" />
            <span>Before & After 사진갤러리</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeSection === 'gallery' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {workReports.length}
            </span>
          </button>
        </div>
      </div>

      {/* Section 1: QR 통합 관리 (LOTO & MSDS) */}
      {activeSection === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipmentList.map((eq) => (
            <div
              key={eq.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md ${
                eq.isLotoLocked ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="badge badge-blue text-[11px] font-mono">{eq.code}</span>
                  <span
                    className={`badge ${
                      eq.type === 'LOTO'
                        ? 'badge-amber'
                        : eq.type === 'MSDS'
                        ? 'badge-red'
                        : 'badge-purple'
                    }`}
                  >
                    {eq.type === 'LOTO' && <Lock className="w-3 h-3 inline mr-1" />}
                    {eq.type}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-slate-900 text-base">{eq.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {eq.location}
                  </p>
                </div>

                {eq.imageUrl && (
                  <div className="my-3 h-36 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                    <img
                      src={eq.imageUrl}
                      alt={eq.name}
                      className="w-full h-full object-cover"
                    />
                    {eq.isLotoLocked && (
                      <div className="absolute inset-0 bg-amber-950/70 backdrop-blur-[2px] flex items-center justify-center gap-2 text-amber-200 font-extrabold text-xs">
                        <Lock className="w-4 h-4 text-amber-300" />
                        LOTO 잠금 시건 상태
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <span className="text-slate-500 block font-semibold mb-0.5">안전 주의사항:</span>
                    <p className="text-slate-800 line-clamp-2 leading-relaxed">{eq.cautionNotes}</p>
                  </div>

                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                    <span className="text-blue-700 block font-semibold mb-0.5">
                      {eq.type === 'MSDS' ? '응급 조치 요령:' : 'LOTO 해제 절차:'}
                    </span>
                    <p className="text-blue-900 line-clamp-2 leading-relaxed">{eq.emergencyProcedures}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {eq.activeWorkerName ? `작업자: ${eq.activeWorkerName}` : '가동 준비 완료'}
                </span>
                <button
                  onClick={() => setSelectedPrintQr(eq)}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  QR 라벨 인쇄
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: 스마트 체크리스트 폼 빌더 */}
      {activeSection === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                설비 점검 항목 동적 구성 (Form Builder)
              </h3>
              <button onClick={handleAddField} className="btn-secondary text-xs flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                항목 추가
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                점검표 템플릿 명칭
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-600 block">점검 항목 리스트:</span>
              {formFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-center"
                >
                  <div className="sm:col-span-2">
                    <label className="text-slate-500 text-[10px] block mb-1 font-semibold">항목명</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const copy = [...formFields];
                        copy[idx].label = e.target.value;
                        setFormFields(copy);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 text-[10px] block mb-1 font-semibold">입력 타입</label>
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const copy = [...formFields];
                        copy[idx].type = e.target.value;
                        setFormFields(copy);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                    >
                      <option value="number">숫자 (수치 측정)</option>
                      <option value="checkbox">체크박스 (정상/이상)</option>
                      <option value="text">텍스트 (상태 기술)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 text-[10px] block mb-1 font-semibold">
                      기준 상한선 (임계 초과 경고)
                    </label>
                    <input
                      type="number"
                      value={field.maxThreshold || ''}
                      placeholder="예: 130"
                      onChange={(e) => {
                        const copy = [...formFields];
                        copy[idx].maxThreshold = Number(e.target.value);
                        setFormFields(copy);
                      }}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-amber-700 font-mono font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button onClick={handleSaveTemplate} className="btn-primary text-xs">
                체크리스트 템플릿 저장 및 배포
              </button>
            </div>
          </div>

          {/* Builder Explanatory Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              스마트 체크리스트 작동 원리
            </h4>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-800">1. 센서 기준치 자동 연동</p>
                <p className="mt-0.5 text-slate-500">
                  관리자가 설정한 기준 상한선은 근로자 앱의 실시간 감시 센서로 작동하여 즉각적인 알림을 트리거합니다.
                </p>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <p className="font-semibold text-rose-800">2. 실시간 비상 경고 통보</p>
                <p className="mt-0.5 text-rose-600">
                  근로자가 앱에서 입력한 값이 기준값(예: 130°C)을 초과할 경우 즉각 관리자 웹 대시보드 및 푸시 경고가 발령됩니다.
                </p>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <p className="font-semibold text-blue-800">3. 공단 실사 표준 엑셀 변환</p>
                <p className="mt-0.5 text-blue-600">
                  모든 점검 데이터는 노동부 및 안전보건공단 실사 기준에 맞추어 한국어 표준 엑셀 서식으로 자동 저장 및 출력됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: 점검 일지 & 이상 수치 모니터링 */}
      {activeSection === 'logs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-rose-600" />
                설비 점검 일지 및 이상 수치 실시간 모니터링
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                근로자가 앱에서 모국어로 입력한 로그가 한국어 표준 데이터로 변환되어 저장됩니다.
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>점검 일시</th>
                  <th>설비명</th>
                  <th>점검자</th>
                  <th>측정 데이터 (JSON)</th>
                  <th>이상 유무 판정</th>
                  <th>조치 비고</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((insp) => (
                  <tr
                    key={insp.id}
                    className={insp.isAbnormal ? 'bg-red-50/70 font-semibold' : ''}
                  >
                    <td className="font-mono text-xs text-slate-600">
                      {new Date(insp.inspectedAt).toLocaleString()}
                    </td>
                    <td className="font-bold text-slate-900 text-xs">{insp.equipmentName || '지정 설비'}</td>
                    <td className="text-xs text-slate-700">{insp.workerName}</td>
                    <td className="font-mono text-xs text-blue-700">
                      {JSON.stringify(insp.data)}
                    </td>
                    <td>
                      {insp.isAbnormal ? (
                        <span className="badge badge-red inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 기준치 초과 (이상)
                        </span>
                      ) : (
                        <span className="badge badge-green">정상 가동</span>
                      )}
                    </td>
                    <td className="text-xs text-rose-700 font-semibold">
                      {insp.abnormalNotes || '특이사항 없음 (정상)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: Requirement 12 - Before & After 갤러리 (Before 2장 + After 2장) */}
      {activeSection === 'gallery' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Images className="w-5 h-5 text-emerald-600" />
                작업 완료 보고서 (Before & After 사진 갤러리 뷰)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                각 작업마다 <strong className="text-red-600">작업 전 2장</strong>과 <strong className="text-emerald-600">작업 후 2장</strong> 총 4장의 사진을 비교 검수하고 관리합니다.
              </p>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              신규 작업 완료 보고서 등록
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {workReports.map((rep) => {
              // Extract 2 Before and 2 After photos with fallback
              const beforeList =
                rep.beforeImgs && rep.beforeImgs.length > 0
                  ? rep.beforeImgs
                  : [rep.beforeImg, rep.beforeImg].filter(Boolean);
              const afterList =
                rep.afterImgs && rep.afterImgs.length > 0
                  ? rep.afterImgs
                  : [rep.afterImg, rep.afterImg].filter(Boolean);

              const before1 = beforeList[0] || rep.beforeImg;
              const before2 = beforeList[1] || beforeList[0] || rep.beforeImg;
              const after1 = afterList[0] || rep.afterImg;
              const after2 = afterList[1] || afterList[0] || rep.afterImg;

              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{rep.taskName}</h4>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          작업자: <strong className="text-slate-800">{rep.workerName}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          위치: {rep.location}
                        </span>
                      </div>
                    </div>
                    <span className="badge badge-green font-mono text-xs flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(rep.reportedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 4-Photo Split Grid (Requirement 12: 2 Before + 2 After) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before Photos (2 Photos) */}
                    <div className="space-y-2 bg-red-50/40 p-3 rounded-xl border border-red-100">
                      <div className="text-xs font-bold text-red-600 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                          BEFORE (작업 전 2장)
                        </span>
                        <span className="text-[11px] font-medium text-red-500">사진 1 & 사진 2</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="h-32 rounded-lg overflow-hidden border border-red-200 bg-slate-100 relative group">
                            <img
                              src={before1}
                              alt="작업 전 1"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                              전 #1
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-32 rounded-lg overflow-hidden border border-red-200 bg-slate-100 relative group">
                            <img
                              src={before2}
                              alt="작업 전 2"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                              전 #2
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* After Photos (2 Photos) */}
                    <div className="space-y-2 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                      <div className="text-xs font-bold text-emerald-600 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          AFTER (작업 후 2장)
                        </span>
                        <span className="text-[11px] font-medium text-emerald-600">사진 1 & 사진 2</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="h-32 rounded-lg overflow-hidden border border-emerald-200 bg-slate-100 relative group">
                            <img
                              src={after1}
                              alt="작업 후 1"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                              후 #1
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-32 rounded-lg overflow-hidden border border-emerald-200 bg-slate-100 relative group">
                            <img
                              src={after2}
                              alt="작업 후 2"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                              후 #2
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <span className="text-slate-500 block font-semibold mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      작업 내용 및 조치 요약:
                    </span>
                    <p className="leading-relaxed">{rep.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Requirement 12: New Work Completion Report Modal (2 Before + 2 After photos) */}
      {isReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Images className="w-5 h-5 text-emerald-600" />
                작업 완료 보고서 등록 (작업 전 2장 · 작업 후 2장)
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReportSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">작업 명칭 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 배관 밸브 교체 및 누설 차단 공사"
                    value={newReport.taskName}
                    onChange={(e) => setNewReport({ ...newReport, taskName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">담당 작업자 *</label>
                  <select
                    value={newReport.workerId}
                    onChange={(e) => {
                      const sel = workers.find((w) => w.id === e.target.value);
                      setNewReport({
                        ...newReport,
                        workerId: e.target.value,
                        workerName: sel ? sel.name : '',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.nationality})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">작업 구역 / 위치 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: B동 1층 유틸리티실"
                  value={newReport.location}
                  onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              {/* Photos Section: 2 Before + 2 After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* BEFORE 2 PHOTOS */}
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 space-y-2.5">
                  <span className="font-bold text-red-600 block text-xs">작업 전(BEFORE) 사진 2장</span>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">작업 전 사진 1 (URL 또는 경로)</label>
                    <input
                      type="text"
                      required
                      value={newReport.beforeImg1}
                      onChange={(e) => setNewReport({ ...newReport, beforeImg1: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">작업 전 사진 2 (URL 또는 경로)</label>
                    <input
                      type="text"
                      required
                      value={newReport.beforeImg2}
                      onChange={(e) => setNewReport({ ...newReport, beforeImg2: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* AFTER 2 PHOTOS */}
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
                  <span className="font-bold text-emerald-600 block text-xs">작업 후(AFTER) 사진 2장</span>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">작업 후 사진 1 (URL 또는 경로)</label>
                    <input
                      type="text"
                      required
                      value={newReport.afterImg1}
                      onChange={(e) => setNewReport({ ...newReport, afterImg1: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">작업 후 사진 2 (URL 또는 경로)</label>
                    <input
                      type="text"
                      required
                      value={newReport.afterImg2}
                      onChange={(e) => setNewReport({ ...newReport, afterImg2: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">작업 상세 내용 및 조치 사항</label>
                <textarea
                  rows={2}
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="작업 전후 조치 내역과 안전 점검 확인 사항을 기록하세요."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700">
                  완료 보고서 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Label Print Modal */}
      {selectedPrintQr && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                현장 부착용 표준 QR 라벨 인쇄
              </h3>
              <button
                onClick={() => setSelectedPrintQr(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Label Mockup */}
            <div className="bg-white text-slate-900 p-5 rounded-2xl border-4 border-slate-800 shadow-xl flex flex-col items-center text-center space-y-3">
              <div className="w-full bg-slate-800 text-white font-extrabold text-sm py-1.5 rounded tracking-widest uppercase">
                {selectedPrintQr.type} SAFETY QR LABEL
              </div>

              <div className="w-44 h-44 bg-slate-50 border-2 border-slate-800 rounded-xl flex flex-col items-center justify-center p-2">
                <QrCode className="w-32 h-32 text-slate-800" />
                <span className="font-mono text-[10px] text-slate-700 font-bold">{selectedPrintQr.code}</span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">{selectedPrintQr.name}</h4>
                <p className="text-xs text-slate-600 font-semibold">{selectedPrintQr.location}</p>
              </div>

              <div className="text-[11px] text-red-600 font-bold border border-red-300 bg-red-50 p-2.5 rounded-lg w-full">
                스마트폰 카메라로 스캔 시 16개국 모국어로 안전수칙 및 LOTO/MSDS 절차가 즉시 노출됩니다.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPrintQr(null)}
                className="btn-secondary text-xs"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-primary text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                라벨 프린터 출력
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New QR Code Modal */}
      {isQrModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                신규 설비 / 화학물질 QR 코드 생성
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQrSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    기기 / 화학물질 명칭 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 2차 반응기 가압펌프"
                    value={newQr.name}
                    onChange={(e) => setNewQr({ ...newQr, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    설치 위치 / 구역 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: B동 1층 반응기실"
                    value={newQr.location}
                    onChange={(e) => setNewQr({ ...newQr, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    QR 분류 선택 *
                  </label>
                  <select
                    value={newQr.type}
                    onChange={(e) => setNewQr({ ...newQr, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="LOTO">LOTO (잠금장치 및 전원 차단)</option>
                    <option value="MSDS">MSDS (유해화학물질 주의사항)</option>
                    <option value="SAFETY_RULES">일반 안전수칙 및 점검표</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    사진 URL
                  </label>
                  <input
                    type="text"
                    value={newQr.imageUrl}
                    onChange={(e) => setNewQr({ ...newQr, imageUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  한국어 안전 주의사항 입력
                </label>
                <textarea
                  rows={2}
                  value={newQr.cautionNotes}
                  onChange={(e) => setNewQr({ ...newQr, cautionNotes: e.target.value })}
                  placeholder="예: 고전압 위험, 절연장갑 착용 필수"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  응급조치 또는 LOTO 해제 절차
                </label>
                <textarea
                  rows={2}
                  value={newQr.emergencyProcedures}
                  onChange={(e) => setNewQr({ ...newQr, emergencyProcedures: e.target.value })}
                  placeholder="예: 1단계 차단기 OFF -> 2단계 잠금 태그 시건"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  QR 코드 생성 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
