'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { MultiLanguageTranslationService, SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';
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
  UserCheck,
  Flame,
  Radio,
} from 'lucide-react';

export const SafetyHealthView: React.FC = () => {
  const {
    workers,
    ptwList,
    sosList,
    signatures,
    approvePTW,
    rejectPTW,
    resolveSOS,
  } = useAppStore();

  const translationService = new MultiLanguageTranslationService();

  const [activeSection, setActiveSection] = useState<'instruction' | 'tbm' | 'ptw' | 'sos'>('instruction');

  // Push Instruction State
  const [instructionText, setInstructionText] = useState('오늘 스크러버 배관 용접 작업 주의');
  const [targetWorkerId, setTargetWorkerId] = useState('ALL');
  const [previewLanguage, setPreviewLanguage] = useState('vi');
  const [pushSentMessage, setPushSentMessage] = useState<string | null>(null);

  // PTW Reject Modal State
  const [rejectingPtwId, setRejectingPtwId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Signature Preview Modal
  const [selectedSignature, setSelectedSignature] = useState<any | null>(null);

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructionText) return;
    setPushSentMessage(`[푸시 발송 성공] "${instructionText}" 내용이 대상 근로자 16개국 모국어로 번역되어 푸시 전송되었습니다.`);
    setTimeout(() => setPushSentMessage(null), 5000);
  };

  const handleConfirmReject = () => {
    if (rejectingPtwId && rejectReason) {
      rejectPTW(rejectingPtwId, rejectReason);
      setRejectingPtwId(null);
      setRejectReason('');
    }
  };

  const translatedPreview = translationService.translateInstruction(instructionText, previewLanguage);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            현장 안전 및 보건 관리 (Safety & Health)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            16개국어 다국어 지시, 작업전 안전점검(TBM) 전자서명 아카이브, 안전작업허가(PTW) 심사
          </p>
        </div>
      </div>

      {/* Navigation Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSection('instruction')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'instruction'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          다국어 업무 지시 및 푸시 알림
        </button>
        <button
          onClick={() => setActiveSection('tbm')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'tbm'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileSignature className="w-3.5 h-3.5" />
          TBM / 안전교육 교안 & 전자서명
        </button>
        <button
          onClick={() => setActiveSection('ptw')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'ptw'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          안전작업허가서(PTW) 심사
          {ptwList.filter((p) => p.status === 'REQUESTED').length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {ptwList.filter((p) => p.status === 'REQUESTED').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection('sos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'sos'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          SOS 비상 호출 이력
          {sosList.filter((s) => s.status === 'TRIGGERED').length > 0 && (
            <span className="bg-yellow-300 text-black text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
              긴급 {sosList.filter((s) => s.status === 'TRIGGERED').length}
            </span>
          )}
        </button>
      </div>

      {/* Section 1: Multilingual Instruction & Push */}
      {activeSection === 'instruction' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Send className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">한국어 작업 지시 작성</h3>
            </div>

            <form onSubmit={handleSendPush} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  수신 대상 근로자 선택
                </label>
                <select
                  value={targetWorkerId}
                  onChange={(e) => setTargetWorkerId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="ALL">전체 현장 근로자 (16개국 25명 동시 발송)</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.koreanName || w.nationality}) - {w.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  지시 사항 입력 (한국어)
                </label>
                <textarea
                  rows={4}
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  placeholder="예: 오늘 스크러버 배관 용접 작업 주의, 화재 감시자 1인 상주 필수"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-xs text-blue-200">
                🌐 관리자가 한국어로 입력하면 서버 번역 엔진이 각 근로자의 인사기록카드 국적에 맞추어 16개국 모국어로 즉시 변환하여 스마트폰 앱에 푸시 전송합니다.
              </div>

              <button type="submit" className="btn-primary w-full justify-center">
                <Send className="w-4 h-4" />
                다국어 푸시 알림 즉시 발송
              </button>

              {pushSentMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{pushSentMessage}</span>
                </div>
              )}
            </form>
          </div>

          {/* Real-time Translation Preview Box */}
          <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">근로자 앱 수신 화면 실시간 프리뷰</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">언어 선택:</span>
                  <select
                    value={previewLanguage}
                    onChange={(e) => setPreviewLanguage(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
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
              <div className="mt-4 mx-auto max-w-sm bg-black/60 border-2 border-white/20 rounded-2xl p-4 shadow-2xl relative">
                <div className="w-24 h-4 bg-white/10 rounded-full mx-auto mb-3"></div>

                <div className="bg-[#1E293B] rounded-xl p-3 border border-white/10 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
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

                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-xs text-blue-200 leading-relaxed font-sans">
                    {translatedPreview}
                  </div>

                  <div className="text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    원문 (한국어): {instructionText}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[11px] text-gray-500">
              * 근로자 모바일 뷰어 팝업에서도 동일한 번역 콘텐츠를 확인할 수 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* Section 2: TBM & Education Signatures Archive */}
      {activeSection === 'tbm' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-emerald-400" />
                  작업 전 안전수칙(TBM) 및 안전교육 전자서명 아카이브
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  모바일 펜 툴 전자서명 완료 시 영구 보관되며 법적 증빙(중대재해처벌법 실사)으로 활용됩니다.
                </p>
              </div>
              <span className="badge badge-green">전자서명 DB 영구 보관 중</span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>일시</th>
                    <th>구분</th>
                    <th>근로자 이름 (국적)</th>
                    <th>작업 / 교육 명칭</th>
                    <th>전자서명 증빙</th>
                    <th>상태</th>
                    <th className="text-right">서명 이미지 검수</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Seeded or Live Signatures */}
                  <tr>
                    <td className="font-mono text-xs text-gray-300">2026-10-15 08:35</td>
                    <td><span className="badge badge-blue">TBM 안전점검</span></td>
                    <td>
                      <span className="font-bold text-white">Nguyen Van An</span>{' '}
                      <span className="text-xs text-gray-400">(베트남 🇻🇳)</span>
                    </td>
                    <td className="text-xs text-gray-200">고소 및 배관 용접 작업 안전수칙 서명</td>
                    <td>
                      <div className="w-20 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[10px] text-emerald-400 font-mono">
                        VERIFIED ✍️
                      </div>
                    </td>
                    <td><span className="badge badge-green">이수 완료</span></td>
                    <td className="text-right">
                      <button
                        onClick={() =>
                          setSelectedSignature({
                            name: 'Nguyen Van An',
                            date: '2026-10-15 08:35',
                            title: '고소 및 배관 용접 작업 안전수칙',
                            type: 'TBM',
                          })
                        }
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> 서명 원본
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="font-mono text-xs text-gray-300">2026-10-14 08:15</td>
                    <td><span className="badge badge-purple">정기 안전교육</span></td>
                    <td>
                      <span className="font-bold text-white">Batbayar Bold</span>{' '}
                      <span className="text-xs text-gray-400">(몽골 🇲🇳)</span>
                    </td>
                    <td className="text-xs text-gray-200">회전체 협착 및 LOTO 잠금장치 취급 교육</td>
                    <td>
                      <div className="w-20 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[10px] text-emerald-400 font-mono">
                        VERIFIED ✍️
                      </div>
                    </td>
                    <td><span className="badge badge-green">이수 완료</span></td>
                    <td className="text-right">
                      <button
                        onClick={() =>
                          setSelectedSignature({
                            name: 'Batbayar Bold',
                            date: '2026-10-14 08:15',
                            title: '회전체 협착 및 LOTO 취급 교육',
                            type: 'SAFETY_EDUCATION',
                          })
                        }
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> 서명 원본
                      </button>
                    </td>
                  </tr>

                  {signatures.map((sig) => (
                    <tr key={sig.id}>
                      <td className="font-mono text-xs text-gray-300">
                        {new Date(sig.signedAt).toLocaleString()}
                      </td>
                      <td><span className="badge badge-blue">{sig.referenceType}</span></td>
                      <td className="font-bold text-white">{sig.workerName}</td>
                      <td className="text-xs text-gray-200">{sig.referenceTitle}</td>
                      <td>
                        <img
                          src={sig.signatureDataUrl}
                          alt="서명"
                          className="h-7 bg-white rounded px-1"
                        />
                      </td>
                      <td><span className="badge badge-green">이수 완료</span></td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedSignature(sig)}
                          className="btn-secondary text-xs py-1 px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> 서명 원본
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: PTW (안전작업허가서) */}
      {activeSection === 'ptw' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-400" />
                  모바일 안전작업허가서(PTW) 심사 및 승인 관리
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  근로자가 작업 착수 전 모바일 앱에서 안전수칙 확인 및 서명 요청한 건을 관리자가 승인합니다.
                </p>
              </div>
              <span className="badge badge-amber font-mono">
                승인 대기: {ptwList.filter((p) => p.status === 'REQUESTED').length}건
              </span>
            </div>

            <div className="space-y-4">
              {ptwList.map((ptw) => (
                <div
                  key={ptw.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ptw.status === 'REQUESTED'
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : ptw.status === 'APPROVED'
                      ? 'bg-white/5 border-white/10'
                      : 'bg-red-950/20 border-red-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {ptw.ptwNumber}
                      </span>
                      <h4 className="font-bold text-white text-base">{ptw.taskName}</h4>
                    </div>

                    <div>
                      {ptw.status === 'REQUESTED' && (
                        <span className="badge badge-amber animate-pulse">승인 심사 대기</span>
                      )}
                      {ptw.status === 'APPROVED' && (
                        <span className="badge badge-green">작업 허가 발급완료</span>
                      )}
                      {ptw.status === 'REJECTED' && (
                        <span className="badge badge-red">작업 불허 (반려)</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
                    <div className="p-3 bg-black/40 rounded-lg">
                      <span className="text-gray-400 block mb-1">작업자 및 위치</span>
                      <div className="font-bold text-white">{ptw.workerName}</div>
                      <div className="text-gray-300">{ptw.location}</div>
                    </div>

                    <div className="p-3 bg-black/40 rounded-lg">
                      <span className="text-gray-400 block mb-1">위험 요인 (Hazard)</span>
                      <div className="text-red-300 font-medium">{ptw.hazardFactors}</div>
                    </div>

                    <div className="p-3 bg-black/40 rounded-lg">
                      <span className="text-gray-400 block mb-1">안전 대책 (Safety Measures)</span>
                      <div className="text-emerald-300 font-medium">{ptw.safetyMeasures}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-gray-400">
                    <div>
                      근로자 모바일 서명일시: {new Date(ptw.workerSignedAt || '').toLocaleString()}
                      {ptw.approvedBy && (
                        <span className="ml-3 text-emerald-400 font-semibold">
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

      {/* Section 4: SOS Emergency Alerts History */}
      {activeSection === 'sos' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-500" />
                  SOS 비상 호출 수신 및 현장 조치 이력
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
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
                      ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-500/20'
                      : 'bg-white/5 border-white/10'
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
                      <span className="font-bold text-white text-sm">{sos.workerName}</span>
                      <span className="font-mono text-xs text-gray-400">({sos.phoneNumber})</span>
                    </div>
                    <div className="text-xs text-red-300 font-semibold">
                      발생 구역: {sos.location}
                    </div>
                    <p className="text-xs text-gray-300">{sos.message}</p>
                    <div className="text-[11px] text-gray-400">
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
                      <span className="text-xs text-emerald-400 font-semibold">조치 종결됨</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reject PTW Reason Modal */}
      {rejectingPtwId && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4">
            <h3 className="font-bold text-white text-base text-red-400">
              안전작업허가서(PTW) 반려 사유 입력
            </h3>
            <p className="text-xs text-gray-300">
              작업자에게 전달될 반려 사유와 안전 보완 조치를 입력해주세요.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white"
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

      {/* Signature Image Preview Modal */}
      {selectedSignature && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4 max-w-md">
            <h3 className="font-bold text-white text-base flex items-center justify-between">
              <span>전자서명 법적 증빙 원본</span>
              <button
                onClick={() => setSelectedSignature(null)}
                className="text-gray-400 hover:text-white"
              >
                닫기
              </button>
            </h3>
            <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] border border-gray-300 shadow-inner">
              {selectedSignature.signatureDataUrl ? (
                <img
                  src={selectedSignature.signatureDataUrl}
                  alt="전자서명"
                  className="max-h-32 object-contain"
                />
              ) : (
                <div className="font-mono text-xl font-extrabold text-blue-900 tracking-wider italic">
                  Nguyen Van An ✍️
                </div>
              )}
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>서명자: <span className="font-bold text-white">{selectedSignature.name || selectedSignature.workerName}</span></div>
              <div>작업/교육: <span className="text-white">{selectedSignature.title || selectedSignature.referenceTitle}</span></div>
              <div>타임스탬프: <span className="font-mono text-gray-400">{selectedSignature.date || selectedSignature.signedAt}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
