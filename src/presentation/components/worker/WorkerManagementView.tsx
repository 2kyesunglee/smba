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
} from 'lucide-react';

export const WorkerManagementView: React.FC = () => {
  const { workers, approveWorker, addWorker, updateWorker, deleteWorker } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'list' | 'pending' | 'calendar'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);

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

  const filteredWorkers = workers.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.koreanName && w.koreanName.includes(searchTerm)) ||
      w.phoneNumber.includes(searchTerm) ||
      (w.alienRegNumber && w.alienRegNumber.includes(searchTerm));
    const matchNat = nationalityFilter === 'ALL' || w.nationality === nationalityFilter;
    const matchStatus = statusFilter === 'ALL' || w.status === statusFilter;
    const matchTab = activeTab === 'pending' ? w.status === 'PENDING_APPROVAL' : true;
    return matchSearch && matchNat && matchStatus && matchTab;
  });

  const pendingWorkers = workers.filter((w) => w.status === 'PENDING_APPROVAL');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.phoneNumber) {
      alert('이름과 스마트폰 번호는 필수 입력 항목입니다.');
      return;
    }
    addWorker(newWorker);
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
    alert('신규 근로자 인사기록카드가 등록되었습니다.');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    updateWorker(editingWorker.id, editingWorker);
    setEditingWorker(null);
    alert(`[수정 완료] ${editingWorker.name} 근로자의 인사카드가 성공적으로 변경되었습니다.`);
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
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            근로자 인사 기록카드 마스터 DB
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            스마트폰 번호 기반 계정 연동 및 대한민국 포함 17개국 근로자 통합 메타데이터 관리
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary shadow-lg shadow-blue-500/20 text-xs px-4 py-2.5"
          >
            <UserPlus className="w-4 h-4" />
            신규 근로자 등록
          </button>
        </div>
      </div>

      {/* Tabs (Significantly Enlarged & High Prominence) */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>전체 근로자 마스터</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'list' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {workers.length}명
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>앱 연동 승인 대기열</span>
          {pendingWorkers.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
              {pendingWorkers.length}건
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-sm flex items-center gap-2.5 ${
            activeTab === 'calendar'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>비자/검진 만료 일정 캘린더</span>
        </button>
      </div>

      {activeTab !== 'calendar' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="이름, 한국어명, 연락처, 주민번호 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>국적:</span>
              </div>
              <select
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="ALL">전체 국적 (17개국)</option>
                <option value="KR">🇰🇷 대한민국 (내국인)</option>
                {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'ko' && l.code !== 'en').map((lang) => (
                  <option key={lang.code} value={lang.code.toUpperCase()}>
                    {lang.flag} {lang.country} ({lang.name})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold ml-2">
                <span>상태:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="ALL">전체 상태</option>
                <option value="ACTIVE">연동 완료 (ACTIVE)</option>
                <option value="PENDING_APPROVAL">승인 대기 (PENDING)</option>
                <option value="INACTIVE">비활성 (INACTIVE)</option>
              </select>
            </div>
          </div>

          {/* DataGrid Table */}
          <div className="glass-card overflow-hidden">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>국적 / 이름</th>
                    <th>주민번호</th>
                    <th>스마트폰 번호</th>
                    <th>혈액형 / 재입국</th>
                    <th>비자형태</th>
                    <th>계약 / 체류 만료일</th>
                    <th>특수건강검진</th>
                    <th>앱 연동 상태</th>
                    <th className="text-right">관리 / 수정</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400 text-xs font-medium">
                        검색 조건에 해당하는 근로자가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((w) => {
                      const dDay = w.getDaysUntilContractEnd();
                      const isSoon = w.isVisaExpiringSoon();

                      return (
                        <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                          <td>
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{getCountryInfo(w.nationality).split(' ')[0]}</span>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{w.name}</div>
                                <div className="text-xs text-slate-500">
                                  {w.koreanName ? `${w.koreanName} (${w.nationality})` : w.nationality}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-xs text-slate-600 font-semibold">
                            {w.alienRegNumber || '미등록'}
                          </td>
                          <td className="font-mono text-xs text-blue-600 font-semibold">
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                              {w.phoneNumber}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="badge badge-red text-[11px] font-bold">
                                {w.bloodType ? `${w.bloodType}형` : 'A형'}
                              </span>
                              <span className={`badge ${w.reEntryAllowed ? 'badge-green' : 'badge-amber'} text-[10px]`}>
                                {w.reEntryAllowed ? '재입국 가능' : '재입국 제한'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-purple">{w.visaType}</span>
                          </td>
                          <td>
                            <div>
                              <span className="font-mono text-xs text-slate-700 font-semibold">{w.contractEndDate}</span>
                              {isSoon && (
                                <span className="ml-2 badge badge-red text-[10px]">
                                  D-{dDay}일 (만료임박)
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-xs text-amber-700 font-semibold">
                              {w.specialHealthCheckDate || '검진 완료'}
                            </span>
                          </td>
                          <td>
                            {w.status === 'ACTIVE' ? (
                              <span className="badge badge-green">
                                <CheckCircle className="w-3 h-3" /> 연동 활성
                              </span>
                            ) : (
                              <span className="badge badge-amber animate-pulse">
                                <Clock className="w-3 h-3" /> 승인 대기
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button (Request #3) */}
                              <button
                                onClick={() => setEditingWorker({ ...w })}
                                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                                title="근로자 인사카드 수정"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                                <span>수정</span>
                              </button>

                              {w.status === 'PENDING_APPROVAL' && (
                                <button
                                  onClick={() => approveWorker(w.id)}
                                  className="btn-primary text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 shadow-sm"
                                >
                                  연동 승인
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Calendar Schedule View */
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              근로자 비자 및 특수건강검진 만료 타임라인 스케줄러 (D-60 / D-30)
            </h3>
            <span className="text-xs text-slate-500 font-medium">자동 Cron 알림 발송 기준</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
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

            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
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

      {/* New Worker Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                신규 근로자 인사기록카드 등록
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    이름 (영문/여권 성명) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: Nguyen Van An 또는 홍길동"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    한국어 이름 (발음)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 응우옌 안"
                    value={newWorker.koreanName}
                    onChange={(e) => setNewWorker({ ...newWorker, koreanName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    스마트폰 번호 (계정 연동 키) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="010-XXXX-XXXX"
                    value={newWorker.phoneNumber}
                    onChange={(e) => setNewWorker({ ...newWorker, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    주민번호 (외국인등록번호) *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 940101-1234567 또는 940101-5XXXXXX"
                    value={newWorker.alienRegNumber}
                    onChange={(e) => setNewWorker({ ...newWorker, alienRegNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    국적 (대한민국 및 16개국 지원) *
                  </label>
                  <select
                    value={newWorker.nationality}
                    onChange={(e) => setNewWorker({ ...newWorker, nationality: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    비자 형태 *
                  </label>
                  <select
                    value={newWorker.visaType}
                    onChange={(e) => setNewWorker({ ...newWorker, visaType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    혈액형 *
                  </label>
                  <select
                    value={newWorker.bloodType}
                    onChange={(e) => setNewWorker({ ...newWorker, bloodType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    재입국 여부 *
                  </label>
                  <select
                    value={newWorker.reEntryAllowed ? 'true' : 'false'}
                    onChange={(e) => setNewWorker({ ...newWorker, reEntryAllowed: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="true">재입국 허용 (가능)</option>
                    <option value="false">재입국 비해당 (불가)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    근로계약 시작일
                  </label>
                  <input
                    type="date"
                    value={newWorker.contractStartDate}
                    onChange={(e) => setNewWorker({ ...newWorker, contractStartDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    근로계약 만료일 (체류기한) *
                  </label>
                  <input
                    type="date"
                    required
                    value={newWorker.contractEndDate}
                    onChange={(e) => setNewWorker({ ...newWorker, contractEndDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    특수건강검진 예정일
                  </label>
                  <input
                    type="date"
                    value={newWorker.specialHealthCheckDate}
                    onChange={(e) => setNewWorker({ ...newWorker, specialHealthCheckDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                💡 인사기록카드가 등록되면 근로자가 스마트폰 앱에서 본인 번호로 로그인할 때 가입 승인 요청이 전송됩니다.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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

      {/* Edit Worker Modal (Request #3) */}
      {editingWorker && (
        <div className="modal-overlay">
          <div className="modal-content p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                근로자 인사기록카드 정보 수정 및 변경
              </h3>
              <button
                onClick={() => setEditingWorker(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    이름 (영문/여권 성명) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingWorker.name || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    한국어 이름 (발음)
                  </label>
                  <input
                    type="text"
                    value={editingWorker.koreanName || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, koreanName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    스마트폰 번호 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingWorker.phoneNumber || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    주민번호 (외국인등록번호)
                  </label>
                  <input
                    type="text"
                    value={editingWorker.alienRegNumber || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, alienRegNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    국적 *
                  </label>
                  <select
                    value={editingWorker.nationality || 'VN'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, nationality: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    비자 형태 *
                  </label>
                  <select
                    value={editingWorker.visaType || 'E-9'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, visaType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    혈액형 *
                  </label>
                  <select
                    value={editingWorker.bloodType || 'A'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, bloodType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    재입국 여부 *
                  </label>
                  <select
                    value={editingWorker.reEntryAllowed ? 'true' : 'false'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, reEntryAllowed: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="true">재입국 허용 (가능)</option>
                    <option value="false">재입국 비해당 (불가)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    근로계약 시작일
                  </label>
                  <input
                    type="date"
                    value={editingWorker.contractStartDate || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, contractStartDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    근로계약 만료일 (체류기한) *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingWorker.contractEndDate || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, contractEndDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    특수건강검진 예정일
                  </label>
                  <input
                    type="date"
                    value={editingWorker.specialHealthCheckDate || ''}
                    onChange={(e) => setEditingWorker({ ...editingWorker, specialHealthCheckDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    앱 연동 상태
                  </label>
                  <select
                    value={editingWorker.status || 'ACTIVE'}
                    onChange={(e) => setEditingWorker({ ...editingWorker, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="ACTIVE">연동 활성 (ACTIVE)</option>
                    <option value="PENDING_APPROVAL">승인 대기 (PENDING_APPROVAL)</option>
                    <option value="INACTIVE">비활성 (INACTIVE)</option>
                    <option value="LEAVE">휴직 / 출국 (LEAVE)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

