'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/presentation/context/AppContext';
import { SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  X,
  Smartphone,
  Pencil,
  Check,
  ShieldCheck,
  Trash2,
  UserCheck,
  Heart,
  Plane,
  BadgeAlert,
} from 'lucide-react';

export const WorkerManagementView: React.FC = () => {
  const { workers, approveWorker, addWorker, updateWorker, deleteWorker } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'list' | 'pending' | 'calendar'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [approvalModalWorker, setApprovalModalWorker] = useState<any | null>(null);

  // New Worker Form State
  const [newWorker, setNewWorker] = useState({
    name: '',
    koreanName: '',
    alienRegNumber: '',
    phoneNumber: '',
    nationality: 'VN',
    visaType: 'E-9',
    gender: 'M' as 'M' | 'F',
    bloodType: 'A' as 'A' | 'B' | 'AB' | 'O',
    reEntryAllowed: true,
    contractStartDate: '2024-01-01',
    contractEndDate: '2027-12-31',
    departureDate: '',
    specialHealthCheckDate: '',
  });

  const pendingWorkers = workers.filter((w) => w.status === 'PENDING_APPROVAL');
  const activeMasterWorkers = workers.filter((w) => w.status !== 'PENDING_APPROVAL');

  const filteredWorkers = (activeTab === 'pending' ? pendingWorkers : activeMasterWorkers).filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.koreanName && w.koreanName.includes(searchTerm)) ||
      w.phoneNumber.includes(searchTerm) ||
      (w.alienRegNumber && w.alienRegNumber.includes(searchTerm));
    const matchNat = nationalityFilter === 'ALL' || w.nationality === nationalityFilter;
    const matchStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchSearch && matchNat && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.phoneNumber) {
      alert('이름과 스마트폰 번호는 필수 입력 항목입니다.');
      return;
    }
    addWorker({
      ...newWorker,
      status: 'ACTIVE',
    });
    setIsAddModalOpen(false);
    setNewWorker({
      name: '',
      koreanName: '',
      alienRegNumber: '',
      phoneNumber: '',
      nationality: 'VN',
      visaType: 'E-9',
      gender: 'M',
      bloodType: 'A',
      reEntryAllowed: true,
      contractStartDate: '2024-01-01',
      contractEndDate: '2027-12-31',
      departureDate: '',
      specialHealthCheckDate: '',
    });
    alert('신규 근로자 인사기록카드가 전체 마스터 DB에 등록되었습니다.');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    updateWorker(editingWorker.id, editingWorker);
    setEditingWorker(null);
    alert(`[수정 완료] ${editingWorker.name} 근로자의 인사카드가 성공적으로 변경되었습니다.`);
  };

  // Approval Submission (대기열에서 국가, 주민번호, 비자 등 기입 후 연동 승인 -> 마스터 탭으로 저장)
  const handleApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalWorker) return;

    const alienReg = approvalModalWorker.alienRegNumber?.trim() || '미등록 (차후보완)';
    updateWorker(approvalModalWorker.id, {
      ...approvalModalWorker,
      alienRegNumber: alienReg,
      status: 'ACTIVE',
    });
    approveWorker(approvalModalWorker.id);
    setApprovalModalWorker(null);
    setStatusFilter('ALL');
    setSearchTerm('');
    setActiveTab('list');
    alert(
      `🎉 [앱 연동 승인 완료]\n\n${approvalModalWorker.name} 근로자의 인사기록카드가 정상 연동되었으며,\n"전체 근로자 마스터" 탭으로 이동하여 활성화 저장되었습니다.`
    );
  };

  // Quick Approval Handler without modal
  const handleQuickApprove = (worker: any) => {
    approveWorker(worker.id);
    setStatusFilter('ALL');
    setSearchTerm('');
    setActiveTab('list');
    alert(
      `🎉 [앱 연동 즉시 승인 완료]\n\n${worker.name} (${worker.phoneNumber}) 근로자가 승인되어\n"전체 근로자 마스터" 탭으로 이동했습니다.`
    );
  };

  // Worker Delete Handler (Request #2)
  const handleDeleteWorker = (worker: any) => {
    const confirmed = window.confirm(
      `⚠️ [근로자 인사기록카드 삭제]\n\n정말로 "${worker.name} (${worker.phoneNumber})"의 데이터를 완전히 삭제하시겠습니까?\n(퇴사자 정리 또는 잘못된 회원가입 삭제를 위한 기능입니다.)`
    );
    if (confirmed) {
      deleteWorker(worker.id);
      if (editingWorker?.id === worker.id) {
        setEditingWorker(null);
      }
      alert(`[삭제 완료] ${worker.name} 근로자의 데이터가 마스터 DB에서 영구 삭제되었습니다.`);
    }
  };

  const getCountryInfo = (code: string) => {
    if (code === 'KR') return '🇰🇷 대한민국';
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code.toLowerCase());
    return found ? `${found.flag} ${found.country}` : code;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#0071E3]" />
            근로자 인사 기록카드 마스터 DB
          </h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">
            스마트폰 번호 기반 계정 연동 및 17개국 근로자 통합 메타데이터 & 출입국 체류기한 관리
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary shadow-sm text-xs px-4 py-2.5"
          >
            <UserPlus className="w-4 h-4" />
            신규 근로자 등록
          </button>
        </div>
      </div>

      {/* Tabs (Apple Segmented Style) */}
      <div className="flex flex-wrap items-center gap-2.5 p-1.5 bg-[#E8E8ED]/70 rounded-2xl border border-black/5">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'list'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold scale-[1.01]'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Users className="w-4 h-4 text-[#0071E3]" />
          <span>전체 근로자 마스터</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-bold">
            {activeMasterWorkers.length}명
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold scale-[1.01]'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#FF9500]" />
          <span>앱 연동 승인 대기열</span>
          {pendingWorkers.length > 0 && (
            <span className="bg-[#FF3B30] text-white text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {pendingWorkers.length}건
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-white text-[#1D1D1F] shadow-sm font-bold scale-[1.01]'
              : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#AF52DE]" />
          <span>비자/검진 만료 일정 캘린더</span>
        </button>
      </div>

      {activeTab !== 'calendar' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
              <input
                type="text"
                placeholder="이름, 한국어명, 주민번호, 휴대폰번호 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F5F5F7] border border-black/5 rounded-xl text-xs text-[#1D1D1F] focus:outline-none focus:bg-white focus:border-[#0071E3] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="bg-[#F5F5F7] border border-black/5 rounded-xl px-3 py-2 text-xs text-[#1D1D1F] focus:outline-none"
              >
                <option value="ALL">모든 국적</option>
                <option value="KR">🇰🇷 대한민국</option>
                <option value="VN">🇻🇳 베트남</option>
                <option value="MN">🇲🇳 몽골</option>
                <option value="PH">🇵🇭 필리핀</option>
                <option value="TH">🇹🇭 태국</option>
                <option value="ID">🇮🇩 인도네시아</option>
                <option value="UZ">🇺🇿 우즈베키스탄</option>
                <option value="KH">🇰🇭 캄보디아</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#F5F5F7] border border-black/5 rounded-xl px-3 py-2 text-xs text-[#1D1D1F] focus:outline-none"
              >
                <option value="ALL">전체 상태</option>
                <option value="ACTIVE">연동 활성 (ACTIVE)</option>
                <option value="PENDING_APPROVAL">승인 대기</option>
                <option value="INACTIVE">비활성</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container shadow-sm">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>이름 (여권/영문)</th>
                  <th>한국어 성명</th>
                  <th>국적</th>
                  <th>스마트폰 번호</th>
                  <th>외국인/주민등록번호</th>
                  <th>비자·혈액형</th>
                  <th>계약 만료일 (D-Day)</th>
                  <th>앱 연동 상태</th>
                  <th className="text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-[#86868B] text-xs">
                      {activeTab === 'pending'
                        ? '현재 스마트폰 앱 연동 승인 대기 중인 근로자가 없습니다.'
                        : '검색 조건과 일치하는 근로자가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((w) => {
                    const daysLeft = w.getDaysUntilContractEnd();
                    const isExpiring = w.isVisaExpiringSoon(daysLeft);

                    return (
                      <tr key={w.id} className="transition-colors hover:bg-[#F9FAFB]">
                        <td className="font-semibold text-[#1D1D1F]">
                          {w.name}
                        </td>
                        <td className="text-[#6E6E73]">
                          {w.koreanName || '-'}
                        </td>
                        <td>
                          <span className="font-medium text-xs">
                            {getCountryInfo(w.nationality)}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-[#1D1D1F]">
                          {w.phoneNumber}
                        </td>
                        <td className="font-mono text-xs text-[#86868B]">
                          {w.alienRegNumber || '-'}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="badge badge-blue text-[10px]">{w.visaType}</span>
                            {w.bloodType && (
                              <span className="badge badge-amber text-[10px]">{w.bloodType}형</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-xs">
                            <div className="text-[#1D1D1F] font-mono">{w.contractEndDate}</div>
                            {isExpiring ? (
                              <span className="text-[11px] font-bold text-[#FF3B30]">
                                ⚠️ 만료임박 (D-{daysLeft})
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#86868B]">D-{daysLeft}일</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              w.status === 'ACTIVE'
                                ? 'badge-green'
                                : w.status === 'PENDING_APPROVAL'
                                ? 'badge-amber'
                                : 'badge-red'
                            }`}
                          >
                            {w.status === 'ACTIVE'
                              ? '연동 활성'
                              : w.status === 'PENDING_APPROVAL'
                              ? '승인 대기'
                              : '비활성'}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {w.status === 'PENDING_APPROVAL' ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleQuickApprove(w)}
                                  className="btn-primary text-xs py-1.5 px-2.5 bg-[#34C759] hover:bg-[#2FB350] shadow-none flex items-center gap-1"
                                  title="클릭 시 즉시 승인 및 전체 마스터 DB로 이동"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  즉시 승인
                                </button>
                                <button
                                  onClick={() => setApprovalModalWorker(w)}
                                  className="btn-primary text-xs py-1.5 px-2.5 bg-[#FF9500] hover:bg-[#E08500] shadow-none flex items-center gap-1"
                                  title="인사기록카드 보완 입력 후 승인"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  상세 승인
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingWorker(w)}
                                className="p-1.5 text-[#0071E3] hover:bg-blue-50 rounded-lg transition-colors"
                                title="수정"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteWorker(w)}
                              className="p-1.5 text-[#FF3B30] hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제 (퇴사/오류)"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </>
      ) : (
        /* Calendar Schedule View */
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#AF52DE]" />
              근로자 비자 및 특수건강검진 만료 타임라인 스케줄러 (D-60 / D-30)
            </h3>
            <span className="text-xs text-[#86868B] font-medium">자동 일정 모니터링</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-purple-50/70 border border-purple-200/60 rounded-2xl space-y-3">
              <h4 className="font-bold text-sm text-purple-900 flex items-center justify-between">
                <span>비자 체류기한 만료 임박 대상자 (60일 이내)</span>
                <span className="badge badge-purple">{workers.filter((w) => w.isVisaExpiringSoon()).length}명</span>
              </h4>
              <div className="space-y-2">
                {workers
                  .filter((w) => w.isVisaExpiringSoon())
                  .map((w) => (
                    <div
                      key={w.id}
                      className="p-3 bg-white rounded-xl border border-purple-100 flex items-center justify-between text-xs shadow-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{w.name}</span> ({w.nationality}) · 만료일: {w.contractEndDate}
                      </div>
                      <span className="badge badge-red font-bold">D-{w.getDaysUntilContractEnd()}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-5 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-3">
              <h4 className="font-bold text-sm text-amber-900 flex items-center justify-between">
                <span>특수건강검진(소음/분진/유해화학물질) 예정자</span>
                <span className="badge badge-amber">{workers.filter((w) => w.specialHealthCheckDate).length}명</span>
              </h4>
              <div className="space-y-2">
                {workers
                  .filter((w) => w.specialHealthCheckDate)
                  .map((w) => (
                    <div
                      key={w.id}
                      className="p-3 bg-white rounded-xl border border-amber-100 flex items-center justify-between text-xs shadow-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{w.name}</span> · 검진예정일: {w.specialHealthCheckDate}
                      </div>
                      <span className="badge badge-amber">검진표 발급</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Worker Modal (Enlarged 30% to max-w-[884px]) */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0071E3]" />
                신규 근로자 인사기록카드 등록
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    이름 (영문/여권 성명) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: Nguyen Van An 또는 홍길동"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    한국어 이름 (발음)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 응우옌 안"
                    value={newWorker.koreanName}
                    onChange={(e) => setNewWorker({ ...newWorker, koreanName: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    스마트폰 번호 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="010-0000-0000"
                    value={newWorker.phoneNumber}
                    onChange={(e) => setNewWorker({ ...newWorker, phoneNumber: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    주민번호 (외국인등록번호)
                  </label>
                  <input
                    type="text"
                    placeholder="950512-5123456"
                    value={newWorker.alienRegNumber}
                    onChange={(e) => setNewWorker({ ...newWorker, alienRegNumber: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    국적 *
                  </label>
                  <select
                    value={newWorker.nationality}
                    onChange={(e) => setNewWorker({ ...newWorker, nationality: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  >
                    <option value="KR">🇰🇷 대한민국 (내국인)</option>
                    {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'ko' && l.code !== 'en').map((lang) => (
                      <option key={lang.code} value={lang.code.toUpperCase()}>
                        {lang.flag} {lang.country} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    비자 형태 *
                  </label>
                  <select
                    value={newWorker.visaType}
                    onChange={(e) => setNewWorker({ ...newWorker, visaType: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  >
                    <option value="내국인">내국인 (대한민국 국적자)</option>
                    <option value="E-9">E-9 (비전문취업)</option>
                    <option value="E-7">E-7 (특정활동)</option>
                    <option value="H-2">H-2 (방문취업)</option>
                    <option value="F-4">F-4 (재외동포)</option>
                    <option value="F-5">F-5 (영주권)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    혈액형 *
                  </label>
                  <select
                    value={newWorker.bloodType}
                    onChange={(e) => setNewWorker({ ...newWorker, bloodType: e.target.value as any })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  >
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    재입국 여부 *
                  </label>
                  <select
                    value={newWorker.reEntryAllowed ? 'true' : 'false'}
                    onChange={(e) => setNewWorker({ ...newWorker, reEntryAllowed: e.target.value === 'true' })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  >
                    <option value="true">재입국 허용 (가능)</option>
                    <option value="false">재입국 비해당 (불가)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    근로계약 시작일
                  </label>
                  <input
                    type="date"
                    value={newWorker.contractStartDate}
                    onChange={(e) => setNewWorker({ ...newWorker, contractStartDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    근로계약 만료일 (체류기한) *
                  </label>
                  <input
                    type="date"
                    required
                    value={newWorker.contractEndDate}
                    onChange={(e) => setNewWorker({ ...newWorker, contractEndDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    특수건강검진 예정일
                  </label>
                  <input
                    type="date"
                    value={newWorker.specialHealthCheckDate}
                    onChange={(e) => setNewWorker({ ...newWorker, specialHealthCheckDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F] focus:bg-white focus:border-[#0071E3]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-xs text-blue-900 leading-relaxed">
                💡 인사기록카드가 등록되면 근로자가 스마트폰 앱에서 본인 번호로 로그인할 수 있습니다.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary text-xs">
                  인사기록카드 생성 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Worker Modal (Enlarged 30% + Delete Button Added per Request #2) */}
      {editingWorker && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#0071E3]" />
                근로자 인사기록카드 정보 수정 및 변경
              </h3>
              <button
                onClick={() => setEditingWorker(null)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    이름 (영문/여권 성명) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingWorker.name || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    한국어 이름 (발음)
                  </label>
                  <input
                    type="text"
                    value={editingWorker.koreanName || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, koreanName: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    스마트폰 번호 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingWorker.phoneNumber || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, phoneNumber: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    주민번호 (외국인등록번호)
                  </label>
                  <input
                    type="text"
                    value={editingWorker.alienRegNumber || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, alienRegNumber: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    국적 *
                  </label>
                  <select
                    value={editingWorker.nationality || 'VN'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, nationality: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="KR">🇰🇷 대한민국 (내국인)</option>
                    {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'ko' && l.code !== 'en').map((lang) => (
                      <option key={lang.code} value={lang.code.toUpperCase()}>
                        {lang.flag} {lang.country} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    비자 형태 *
                  </label>
                  <select
                    value={editingWorker.visaType || 'E-9'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, visaType: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="내국인">내국인 (대한민국 국적자)</option>
                    <option value="E-9">E-9 (비전문취업)</option>
                    <option value="E-7">E-7 (특정활동)</option>
                    <option value="H-2">H-2 (방문취업)</option>
                    <option value="F-4">F-4 (재외동포)</option>
                    <option value="F-5">F-5 (영주권)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    혈액형 *
                  </label>
                  <select
                    value={editingWorker.bloodType || 'A'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, bloodType: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    재입국 여부 *
                  </label>
                  <select
                    value={editingWorker.reEntryAllowed ? 'true' : 'false'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, reEntryAllowed: e.target.value === 'true' })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="true">재입국 허용 (가능)</option>
                    <option value="false">재입국 비해당 (불가)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    근로계약 시작일
                  </label>
                  <input
                    type="date"
                    value={editingWorker.contractStartDate || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, contractStartDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    근로계약 만료일 (체류기한) *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingWorker.contractEndDate || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, contractEndDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    특수건강검진 예정일
                  </label>
                  <input
                    type="date"
                    value={editingWorker.specialHealthCheckDate || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, specialHealthCheckDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    앱 연동 상태
                  </label>
                  <select
                    value={editingWorker.status || 'ACTIVE'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, status: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="ACTIVE">연동 활성 (ACTIVE)</option>
                    <option value="PENDING_APPROVAL">승인 대기 (PENDING_APPROVAL)</option>
                    <option value="INACTIVE">비활성 (INACTIVE)</option>
                    <option value="LEAVE">휴직 / 출국 (LEAVE)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons: Request #2 Delete Button Added */}
              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => handleDeleteWorker(editingWorker)}
                  className="btn-danger text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  근로자 삭제 (퇴사/오류)
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingWorker(null)}
                    className="btn-secondary text-xs"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    수정 사항 저장 완료
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Connection & Metadata Approval Modal (Request #2: 30% 커진 모달창) */}
      {approvalModalWorker && (
        <div className="modal-overlay">
          <div className="modal-content p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#FF9500]" />
                  앱 연동 승인 및 인사기록카드 보완 입력
                </h3>
                <p className="text-xs text-[#86868B] mt-1">
                  근로자가 스마트폰에서 가입 요청한 정보를 바탕으로 인사정보를 기입하고 연동하면 전체 마스터 DB로 이동하여 활성화됩니다.
                </p>
              </div>
              <button
                onClick={() => setApprovalModalWorker(null)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApprovalSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                <span>
                  <strong>가입 신청자:</strong> {approvalModalWorker.name} ({getCountryInfo(approvalModalWorker.nationality)})
                </span>
                <span className="font-mono">{approvalModalWorker.phoneNumber}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    국가 (국적) *
                  </label>
                  <select
                    value={approvalModalWorker.nationality || 'VN'}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, nationality: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="KR">🇰🇷 대한민국 (내국인)</option>
                    {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'ko' && l.code !== 'en').map((lang) => (
                      <option key={lang.code} value={lang.code.toUpperCase()}>
                        {lang.flag} {lang.country} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    주민번호 (외국인등록번호)
                  </label>
                  <input
                    type="text"
                    placeholder="950512-5123456 (미등록 시 차후 보완)"
                    value={approvalModalWorker.alienRegNumber || ''}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, alienRegNumber: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    스마트폰 번호 *
                  </label>
                  <input
                    type="text"
                    required
                    value={approvalModalWorker.phoneNumber || ''}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, phoneNumber: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    한국어 발음 성명
                  </label>
                  <input
                    type="text"
                    placeholder="예: 응우옌 안"
                    value={approvalModalWorker.koreanName || ''}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, koreanName: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    혈액형 *
                  </label>
                  <select
                    value={approvalModalWorker.bloodType || 'A'}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, bloodType: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    재입국 여부 *
                  </label>
                  <select
                    value={approvalModalWorker.reEntryAllowed ? 'true' : 'false'}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, reEntryAllowed: e.target.value === 'true' })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="true">재입국 허용 (가능)</option>
                    <option value="false">재입국 비해당 (불가)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    비자 형태 *
                  </label>
                  <select
                    value={approvalModalWorker.visaType || 'E-9'}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, visaType: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  >
                    <option value="E-9">E-9 (비전문취업)</option>
                    <option value="E-7">E-7 (특정활동)</option>
                    <option value="H-2">H-2 (방문취업)</option>
                    <option value="F-4">F-4 (재외동포)</option>
                    <option value="내국인">내국인</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    근로계약 시작일
                  </label>
                  <input
                    type="date"
                    value={approvalModalWorker.contractStartDate || '2024-01-01'}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, contractStartDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    근로계약 만료일 (체류기한) *
                  </label>
                  <input
                    type="date"
                    required
                    value={approvalModalWorker.contractEndDate || '2027-12-31'}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, contractEndDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>

                <div>
                  <label className="block text-[#1D1D1F] font-semibold mb-1">
                    특수건강검진 예정일
                  </label>
                  <input
                    type="date"
                    value={approvalModalWorker.specialHealthCheckDate || ''}
                    onChange={(e) => setApprovalModalWorker({ ...approvalModalWorker, specialHealthCheckDate: e.target.value })}
                    className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-3.5 py-2.5 text-[#1D1D1F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => handleDeleteWorker(approvalModalWorker)}
                  className="btn-danger text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  가입 요청 삭제
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setApprovalModalWorker(null)}
                    className="btn-secondary text-xs"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary text-xs bg-[#0071E3] hover:bg-[#0077ED]">
                    인사카드 저장 및 앱 연동 승인 완료
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
