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
} from 'lucide-react';

export const WorkerManagementView: React.FC = () => {
  const { workers, approveWorker, addWorker } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'list' | 'pending' | 'calendar'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Worker Form State
  const [newWorker, setNewWorker] = useState({
    name: '',
    koreanName: '',
    alienRegNumber: '',
    phoneNumber: '',
    nationality: 'VN',
    visaType: 'E-9',
    gender: 'M' as 'M' | 'F',
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
      contractStartDate: '2024-01-01',
      contractEndDate: '2027-12-31',
      departureDate: '',
      specialHealthCheckDate: '',
    });
  };

  const getCountryInfo = (code: string) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code.toLowerCase());
    return found ? `${found.flag} ${found.country}` : code;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            외국인 근로자 인사기록카드 마스터 DB
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            스마트폰 번호 기반 계정 연동 및 16개국 외국인 근로자 통합 메타데이터 관리
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            신규 근로자 등록
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          전체 근로자 마스터 ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>앱 연동 승인 대기열</span>
          {pendingWorkers.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingWorkers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'calendar'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          비자/검진 만료 일정 캘린더
        </button>
      </div>

      {activeTab !== 'calendar' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="이름, 한국어명, 연락처, 외국인등록번호 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Filter className="w-3.5 h-3.5" />
                <span>국적:</span>
              </div>
              <select
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">전체 국적 (16개국)</option>
                {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'ko' && l.code !== 'en').map((lang) => (
                  <option key={lang.code} value={lang.code.toUpperCase()}>
                    {lang.flag} {lang.country} ({lang.name})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-2">
                <span>상태:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    <th>외국인등록번호</th>
                    <th>스마트폰 번호 (연동 키)</th>
                    <th>비자형태</th>
                    <th>계약 / 체류 만료일</th>
                    <th>특수건강검진</th>
                    <th>앱 연동 상태</th>
                    <th className="text-right">관리 작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400 text-xs">
                        검색 조건에 해당하는 근로자가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((w) => {
                      const dDay = w.getDaysUntilContractEnd();
                      const isSoon = w.isVisaExpiringSoon();

                      return (
                        <tr key={w.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{getCountryInfo(w.nationality).split(' ')[0]}</span>
                              <div>
                                <div className="font-bold text-white text-sm">{w.name}</div>
                                <div className="text-xs text-gray-400">
                                  {w.koreanName ? `${w.koreanName} (${w.nationality})` : w.nationality}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-xs text-gray-300">
                            {w.alienRegNumber || '미등록'}
                          </td>
                          <td className="font-mono text-xs text-blue-300">
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                              {w.phoneNumber}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-purple">{w.visaType}</span>
                          </td>
                          <td>
                            <div>
                              <span className="font-mono text-xs text-gray-200">{w.contractEndDate}</span>
                              {isSoon && (
                                <span className="ml-2 badge badge-red text-[10px]">
                                  D-{dDay}일 (만료임박)
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-xs text-amber-300">
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
                            {w.status === 'PENDING_APPROVAL' ? (
                              <button
                                onClick={() => approveWorker(w.id)}
                                className="btn-primary text-xs py-1.5 px-3"
                              >
                                연동 승인
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-semibold">연동 정상</span>
                            )}
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
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              외국인 근로자 비자 및 특수건강검진 만료 타임라인 스케줄러 (D-60 / D-30)
            </h3>
            <span className="text-xs text-gray-400">자동 Cron 알림 발송 기준</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-3">
              <h4 className="font-bold text-sm text-purple-300 flex items-center justify-between">
                <span>비자 체류기한 만료 임박 대상자 (60일 이내)</span>
                <span className="badge badge-purple">{workers.filter((w) => w.isVisaExpiringSoon()).length}명</span>
              </h4>
              <div className="space-y-2">
                {workers
                  .filter((w) => w.isVisaExpiringSoon())
                  .map((w) => (
                    <div
                      key={w.id}
                      className="p-3 bg-black/40 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{w.name}</span> ({w.nationality}) · 만료일: {w.contractEndDate}
                      </div>
                      <span className="badge badge-red font-bold">D-{w.getDaysUntilContractEnd()}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
              <h4 className="font-bold text-sm text-amber-300 flex items-center justify-between">
                <span>특수건강검진(소음/분진/유해화학물질) 예정자</span>
                <span className="badge badge-amber">{workers.filter((w) => w.specialHealthCheckDate).length}명</span>
              </h4>
              <div className="space-y-2">
                {workers
                  .filter((w) => w.specialHealthCheckDate)
                  .map((w) => (
                    <div
                      key={w.id}
                      className="p-3 bg-black/40 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{w.name}</span> · 검진예정일: {w.specialHealthCheckDate}
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
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                신규 외국인 근로자 인사기록카드 등록
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    영문 이름 (여권 성명) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: Nguyen Van An"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    한국어 이름 (발음)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 응우옌 안"
                    value={newWorker.koreanName}
                    onChange={(e) => setNewWorker({ ...newWorker, koreanName: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    스마트폰 번호 (계정 연동 키) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="010-XXXX-XXXX"
                    value={newWorker.phoneNumber}
                    onChange={(e) => setNewWorker({ ...newWorker, phoneNumber: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    외국인등록번호
                  </label>
                  <input
                    type="text"
                    placeholder="940101-5XXXXXX"
                    value={newWorker.alienRegNumber}
                    onChange={(e) => setNewWorker({ ...newWorker, alienRegNumber: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    국적 (16개국 지원) *
                  </label>
                  <select
                    value={newWorker.nationality}
                    onChange={(e) => setNewWorker({ ...newWorker, nationality: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'ko' && l.code !== 'en').map((lang) => (
                      <option key={lang.code} value={lang.code.toUpperCase()}>
                        {lang.flag} {lang.country} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    비자 형태 *
                  </label>
                  <select
                    value={newWorker.visaType}
                    onChange={(e) => setNewWorker({ ...newWorker, visaType: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="E-9">E-9 (비전문취업)</option>
                    <option value="E-7">E-7 (특정활동)</option>
                    <option value="H-2">H-2 (방문취업)</option>
                    <option value="F-4">F-4 (재외동포)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    근로계약 시작일
                  </label>
                  <input
                    type="date"
                    value={newWorker.contractStartDate}
                    onChange={(e) => setNewWorker({ ...newWorker, contractStartDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    근로계약 만료일 (체류기한) *
                  </label>
                  <input
                    type="date"
                    required
                    value={newWorker.contractEndDate}
                    onChange={(e) => setNewWorker({ ...newWorker, contractEndDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    특수건강검진 예정일
                  </label>
                  <input
                    type="date"
                    value={newWorker.specialHealthCheckDate}
                    onChange={(e) => setNewWorker({ ...newWorker, specialHealthCheckDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-xs text-blue-200">
                💡 인사기록카드가 등록되면 근로자가 스마트폰 앱에서 본인 번호로 로그인할 때 가입 승인 요청이 전송됩니다.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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
    </div>
  );
};
