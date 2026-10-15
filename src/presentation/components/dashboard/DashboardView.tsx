'use client';

import React from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Clock,
  ArrowRight,
  Calendar,
  ThermometerSnowflake,
  CheckCircle2,
  FileSignature,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    workers,
    equipmentList,
    ptwList,
    inspections,
    approvePTW,
    approveWorker,
    pendingPTWCount,
    pendingWorkerCount,
    abnormalInspectionCount,
    expiringVisaCount,
  } = useAppStore();

  const activeLotoList = equipmentList.filter((e) => e.isLotoLocked);
  const abnormalInspections = inspections.filter((i) => i.isAbnormal);
  const expiringWorkers = workers.filter((w) => w.isVisaExpiringSoon());
  const pendingPTWList = ptwList.filter((p) => p.status === 'REQUESTED');
  const pendingWorkers = workers.filter((w) => w.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>사업장 등록 외국인 근로자</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{workers.length}</span>
            <span className="text-xs text-emerald-400 font-medium">● 출근 23명 가동중</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">16개국 다국어 번역 시스템 연동</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>PTW 안전작업허가 대기</span>
            <FileSignature className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{pendingPTWCount}</span>
            <span className="text-xs text-gray-400 font-medium">건 즉시 검토 필요</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">고소/밀폐/화기 위험 작업 승인</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>설비 이상 징후 (임계 초과)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400">{abnormalInspectionCount}</span>
            <span className="text-xs text-red-300 font-medium">건 기준값 이탈 경고</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">실시간 센서 & 체크리스트 검출</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>사업장 무재해 연속 기록</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">248</span>
            <span className="text-xs text-gray-400 font-medium">일째 달성 중</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">100% 디지털 페이퍼리스 안전관리</p>
        </div>
      </div>

      {/* Main 4 Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: 근태 및 승인 현황 */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">위젯 1: 근태 및 승인 대기 현황</h3>
                  <p className="text-xs text-gray-400">신규 가입 요청 및 안전작업허가 승인 큐</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('workers')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                상세보기 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* App Login Approval Queue */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    앱 로그인 가입 승인 대기 ({pendingWorkerCount}명)
                  </span>
                  <span className="text-[11px] text-gray-400">스마트폰 번호 매칭 완료</span>
                </div>
                {pendingWorkers.length === 0 ? (
                  <div className="p-3 bg-white/5 rounded-lg text-xs text-gray-400 text-center">
                    대기 중인 근로자 가입 요청이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingWorkers.map((pw) => (
                      <div
                        key={pw.id}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between border border-white/5 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{pw.name}</span>
                            <span className="text-xs text-gray-400">({pw.koreanName || '한국어명 미등록'})</span>
                            <span className="badge badge-amber">{pw.nationality}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            연락처: {pw.phoneNumber} · 비자: {pw.visaType}
                          </div>
                        </div>
                        <button
                          onClick={() => approveWorker(pw.id)}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          가입 승인
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PTW Request Preview */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    작업허가서(PTW) 심사 대기 ({pendingPTWList.length}건)
                  </span>
                  <button
                    onClick={() => onNavigateTab('safety')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    안전관리 탭 이동
                  </button>
                </div>
                {pendingPTWList.length === 0 ? (
                  <div className="p-3 bg-white/5 rounded-lg text-xs text-gray-400 text-center">
                    심사 대기 중인 작업허가서가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingPTWList.map((ptw) => (
                      <div
                        key={ptw.id}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between border border-white/5"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-blue-400 font-bold">{ptw.ptwNumber}</span>
                            <span className="text-xs font-bold text-white">{ptw.taskName}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            신청자: {ptw.workerName} · 작업위치: {ptw.location}
                          </div>
                        </div>
                        <button
                          onClick={() => approvePTW(ptw.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          허가 승인
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: 이상 징후 알림 (설비 점검) */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">위젯 2: 설비 이상 징후 알림 (임계 이탈)</h3>
                  <p className="text-xs text-gray-400">기준값을 벗어난 센서 및 체크리스트 로그</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('equipment')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                점검일지 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {abnormalInspections.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  현재 모든 설비가 정상 기준 범위 내에서 안전하게 가동 중입니다.
                </div>
              ) : (
                abnormalInspections.map((insp) => (
                  <div
                    key={insp.id}
                    className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-red-200">{insp.equipmentName}</span>
                      <span className="badge badge-red text-xs">주의: 기준치 초과</span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-lg text-xs font-mono text-red-300">
                      {insp.abnormalNotes}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>점검자: {insp.workerName}</span>
                      <span>측정 시각: {new Date(insp.inspectedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-gray-400 flex items-center justify-between">
            <span>설비 기준치 설정 변경은 스마트 체크리스트 폼 빌더에서 수정 가능합니다.</span>
            <button
              onClick={() => onNavigateTab('equipment')}
              className="text-blue-400 hover:underline font-semibold"
            >
              폼 빌더 이동
            </button>
          </div>
        </div>

        {/* Widget 3: 컴플라이언스 리마인더 (비자 & 건강검진) */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">위젯 3: 컴플라이언스 리마인더 (비자/검진)</h3>
                  <p className="text-xs text-gray-400">1~2개월 내 기한 도래 대상자 자동 스케줄링</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('compliance')}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                서류센터 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {expiringWorkers.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">
                  2개월 내 만료 예정인 비자 또는 특수건강검진 대상자가 없습니다.
                </div>
              ) : (
                expiringWorkers.map((w) => {
                  const dDay = w.getDaysUntilContractEnd();
                  return (
                    <div
                      key={w.id}
                      className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-extrabold text-sm">
                          D-{dDay}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{w.name}</span>
                            <span className="badge badge-purple">{w.visaType} ({w.nationality})</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            계약/체류 만료: <span className="text-purple-300 font-medium">{w.contractEndDate}</span>
                            {w.specialHealthCheckDate && (
                              <span className="ml-2 text-amber-300">· 특수검진: {w.specialHealthCheckDate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateTab('compliance')}
                        className="btn-secondary text-xs py-1.5 px-3 text-purple-300 border-purple-500/30 hover:bg-purple-900/30"
                      >
                        연장 서류 발급
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Widget 4: LOTO 현황 */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">위젯 4: LOTO (잠금장치) 정비 현황</h3>
                  <p className="text-xs text-gray-400">현재 안전 잠금 태그가 발부된 설비 및 작업자</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('equipment')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                QR 관리 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activeLotoList.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">
                  현재 LOTO 잠금 중인 설비가 없습니다. (정상 가동 상태)
                </div>
              ) : (
                activeLotoList.map((eq) => (
                  <div
                    key={eq.id}
                    className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-sm text-white">{eq.name}</span>
                        <span className="text-xs text-gray-400 font-mono">[{eq.code}]</span>
                      </div>
                      <span className="badge badge-amber text-xs">LOTO 발부 중 (조작 금지)</span>
                    </div>

                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {eq.cautionNotes}
                    </p>

                    <div className="p-2.5 bg-black/40 rounded-lg text-xs text-gray-300 flex items-center justify-between">
                      <div>
                        <span className="text-gray-400">시건 작업자:</span>{' '}
                        <span className="font-bold text-white">{eq.activeWorkerName || '지정 작업자'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">위치:</span>{' '}
                        <span className="text-gray-200">{eq.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
