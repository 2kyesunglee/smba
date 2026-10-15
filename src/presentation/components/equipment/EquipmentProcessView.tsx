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
} from 'lucide-react';

export const EquipmentProcessView: React.FC = () => {
  const {
    equipmentList,
    templates,
    inspections,
    workReports,
    createEquipmentQR,
    createTemplate,
  } = useAppStore();

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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-400" />
            설비 및 공정 안전 관리 (Process & Equipment)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            QR 코드 LOTO/MSDS 관리, 스마트 체크리스트 폼 빌더, 점검 일지 및 Before & After 사진 갤러리
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            신규 QR 생성 등록
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSection('qr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'qr'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          QR 통합 관리 (LOTO / MSDS) ({equipmentList.length})
        </button>
        <button
          onClick={() => setActiveSection('builder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'builder'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          스마트 체크리스트 폼 빌더
        </button>
        <button
          onClick={() => setActiveSection('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'logs'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          설비 점검 일지 & 이상 수치
          {inspections.filter((i) => i.isAbnormal).length > 0 && (
            <span className="badge badge-red text-[10px]">
              경고 {inspections.filter((i) => i.isAbnormal).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection('gallery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'gallery'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Images className="w-3.5 h-3.5" />
          Before & After 사진 갤러리 ({workReports.length})
        </button>
      </div>

      {/* Section 1: QR 통합 관리 (LOTO & MSDS) */}
      {activeSection === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipmentList.map((eq) => (
            <div
              key={eq.id}
              className={`glass-card p-5 space-y-3 relative overflow-hidden flex flex-col justify-between ${
                eq.isLotoLocked ? 'border-amber-500/40 bg-amber-950/10' : ''
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
                    {eq.type === 'LOTO' && <Lock className="w-3 h-3" />}
                    {eq.type}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-white text-base">{eq.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{eq.location}</p>
                </div>

                {eq.imageUrl && (
                  <div className="my-3 h-32 rounded-xl overflow-hidden border border-white/10 relative">
                    <img
                      src={eq.imageUrl}
                      alt={eq.name}
                      className="w-full h-full object-cover"
                    />
                    {eq.isLotoLocked && (
                      <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-[2px] flex items-center justify-center gap-2 text-amber-300 font-extrabold text-xs">
                        <Lock className="w-4 h-4" />
                        LOTO 잠금 시건 상태
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-black/40 rounded-lg">
                    <span className="text-gray-400 block font-semibold mb-0.5">주의 사항:</span>
                    <p className="text-gray-200 line-clamp-2">{eq.cautionNotes}</p>
                  </div>

                  <div className="p-2.5 bg-black/40 rounded-lg">
                    <span className="text-gray-400 block font-semibold mb-0.5">
                      {eq.type === 'MSDS' ? '응급 조치 요령:' : 'LOTO 해제 절차:'}
                    </span>
                    <p className="text-blue-200 line-clamp-2">{eq.emergencyProcedures}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {eq.activeWorkerName ? `작업자: ${eq.activeWorkerName}` : '가동 준비'}
                </span>
                <button
                  onClick={() => setSelectedPrintQr(eq)}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
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
          <div className="lg:col-span-2 glass-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                설비 점검 항목 동적 구성 (Form Builder)
              </h3>
              <button onClick={handleAddField} className="btn-secondary text-xs">
                <Plus className="w-3.5 h-3.5" />
                항목 추가
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                점검표 템플릿 명칭
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-400">점검 항목 리스트:</span>
              {formFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3.5 bg-white/5 rounded-xl border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-center"
                >
                  <div className="sm:col-span-2">
                    <label className="text-gray-400 text-[10px] block mb-1">항목명</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const copy = [...formFields];
                        copy[idx].label = e.target.value;
                        setFormFields(copy);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] block mb-1">입력 타입</label>
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const copy = [...formFields];
                        copy[idx].type = e.target.value;
                        setFormFields(copy);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white"
                    >
                      <option value="number">숫자 (수치 측정)</option>
                      <option value="checkbox">체크박스 (정상/이상)</option>
                      <option value="text">텍스트 (상태 기술)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] block mb-1">
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
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-amber-300 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button onClick={handleSaveTemplate} className="btn-primary text-xs">
                체크리스트 템플릿 저장 및 배포
              </button>
            </div>
          </div>

          {/* Builder Explanatory Panel */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              스마트 체크리스트 작동 원리
            </h4>
            <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
              <p>
                1. 관리자가 웹에서 설정한 <strong className="text-blue-300">기준 상한선</strong>은 근로자 앱의 실시간 감시 센서로 작동합니다.
              </p>
              <p>
                2. 근로자가 앱에서 입력한 값이 기준값(예: 130°C)을 초과할 경우, <strong className="text-red-400">즉각 관리자 웹 대시보드 및 푸시 경고</strong>가 발령됩니다.
              </p>
              <p>
                3. 모든 점검 데이터는 노동부 및 공단 실사 기준에 맞추어 한국어 표준 엑셀 서식으로 자동 컴파일됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: 점검 일지 & 이상 수치 모니터링 */}
      {activeSection === 'logs' && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-red-400" />
                설비 점검 일지 및 이상 수치 실시간 모니터링
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
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
                    className={insp.isAbnormal ? 'bg-red-950/20' : ''}
                  >
                    <td className="font-mono text-xs text-gray-300">
                      {new Date(insp.inspectedAt).toLocaleString()}
                    </td>
                    <td className="font-bold text-white text-xs">{insp.equipmentName || '지정 설비'}</td>
                    <td className="text-xs text-gray-200">{insp.workerName}</td>
                    <td className="font-mono text-xs text-blue-300">
                      {JSON.stringify(insp.data)}
                    </td>
                    <td>
                      {insp.isAbnormal ? (
                        <span className="badge badge-red animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> 기준치 초과 (이상)
                        </span>
                      ) : (
                        <span className="badge badge-green">정상 가동</span>
                      )}
                    </td>
                    <td className="text-xs text-red-300 font-semibold">
                      {insp.abnormalNotes || '특이사항 없음 (정상)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: Before & After 갤러리 */}
      {activeSection === 'gallery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Images className="w-5 h-5 text-emerald-400" />
                작업 완료 보고서 (Before & After 사진 갤러리 뷰)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                부품 교체, 청소, 보수 등 특정 작업의 작업 전/후 사진을 시각적으로 신속하게 검수합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workReports.map((rep) => (
              <div key={rep.id} className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{rep.taskName}</h4>
                    <div className="text-xs text-gray-400 mt-0.5">
                      작업자: <span className="text-white font-semibold">{rep.workerName}</span> · 위치: {rep.location}
                    </div>
                  </div>
                  <span className="badge badge-green font-mono text-[11px]">
                    {new Date(rep.reportedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Before & After Photo Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-red-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      BEFORE (작업 전)
                    </div>
                    <div className="h-44 rounded-xl overflow-hidden border border-white/10 bg-black">
                      <img
                        src={rep.beforeImg}
                        alt="작업 전"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      AFTER (작업 후)
                    </div>
                    <div className="h-44 rounded-xl overflow-hidden border border-white/10 bg-black">
                      <img
                        src={rep.afterImg}
                        alt="작업 후"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl text-xs text-gray-300">
                  <span className="text-gray-400 block font-semibold mb-0.5">작업 내용 요약:</span>
                  <p>{rep.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Label Print Modal */}
      {selectedPrintQr && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                현장 부착용 표준 QR 라벨 인쇄
              </h3>
              <button
                onClick={() => setSelectedPrintQr(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Label Mockup */}
            <div className="bg-white text-black p-5 rounded-2xl border-4 border-gray-900 shadow-2xl flex flex-col items-center text-center space-y-3">
              <div className="w-full bg-gray-900 text-white font-extrabold text-sm py-1 rounded tracking-widest uppercase">
                {selectedPrintQr.type} SAFETY QR LABEL
              </div>

              {/* Dynamic QR Code Box */}
              <div className="w-44 h-44 bg-gray-100 border-2 border-gray-900 rounded-xl flex flex-col items-center justify-center p-2">
                <QrCode className="w-32 h-32 text-gray-900" />
                <span className="font-mono text-[10px] text-gray-700 font-bold">{selectedPrintQr.code}</span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-gray-900">{selectedPrintQr.name}</h4>
                <p className="text-xs text-gray-600 font-semibold">{selectedPrintQr.location}</p>
              </div>

              <div className="text-[11px] text-red-600 font-bold border border-red-500 bg-red-50 p-2 rounded w-full">
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
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                신규 설비 / 화학물질 QR 코드 생성
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQrSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    기기 / 화학물질 명칭 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 2차 반응기 가압펌프"
                    value={newQr.name}
                    onChange={(e) => setNewQr({ ...newQr, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    설치 위치 / 구역 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: B동 1층 반응기실"
                    value={newQr.location}
                    onChange={(e) => setNewQr({ ...newQr, location: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    QR 분류 선택 *
                  </label>
                  <select
                    value={newQr.type}
                    onChange={(e) => setNewQr({ ...newQr, type: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="LOTO">LOTO (잠금장치 및 전원 차단)</option>
                    <option value="MSDS">MSDS (유해화학물질 주의사항)</option>
                    <option value="SAFETY_RULES">일반 안전수칙 및 점검표</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    사진 URL
                  </label>
                  <input
                    type="text"
                    value={newQr.imageUrl}
                    onChange={(e) => setNewQr({ ...newQr, imageUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  한국어 안전 주의사항 입력
                </label>
                <textarea
                  rows={2}
                  value={newQr.cautionNotes}
                  onChange={(e) => setNewQr({ ...newQr, cautionNotes: e.target.value })}
                  placeholder="예: 고전압 위험, 절연장갑 착용 필수"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  응급조치 또는 LOTO 해제 절차
                </label>
                <textarea
                  rows={2}
                  value={newQr.emergencyProcedures}
                  onChange={(e) => setNewQr({ ...newQr, emergencyProcedures: e.target.value })}
                  placeholder="예: 1단계 차단기 OFF -> 2단계 잠금 태그 시건"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
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
