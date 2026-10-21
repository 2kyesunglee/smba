'use client';

import React, { useState } from 'react';
import { AdminAuthService } from '@/infrastructure/services/AdminAuthService';
import { ShieldAlert, Lock, User, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1004');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authService = new AdminAuthService();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(username, password);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message || '로그인에 실패했습니다.');
      }
    }, 200);
  };

  const handleFillDefault = () => {
    setUsername('admin');
    setPassword('1004');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-2">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">SafeGuard AI</h1>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            통합 안전보건 & 외국인 근로자 관제 포털
          </p>
          <p className="text-xs text-slate-500 pt-1">
            시스템 접근을 위해 총괄 관리자 계정으로 로그인해주세요.
          </p>
        </div>

        {/* Notice Badge */}
        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
          <KeyRound className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <p className="font-bold">시스템 최초 접속 안내</p>
            <p className="text-[11px] text-blue-800 mt-0.5">
              기본 아이디: <strong className="font-mono bg-blue-100 px-1 py-0.5 rounded">admin</strong> / 기본 비밀번호: <strong className="font-mono bg-blue-100 px-1 py-0.5 rounded">1004</strong>
            </p>
            <button
              type="button"
              onClick={handleFillDefault}
              className="mt-1.5 text-[11px] font-bold text-blue-700 underline hover:text-blue-900"
            >
              👉 클릭하여 기본 계정 자동 입력
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              관리자 아이디 (Username)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                비밀번호 (Password)
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="1004"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span>로그인 인증 중...</span>
            ) : (
              <>
                <span>관리자 로그인</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            로그인 후 상단 네비게이션 프로필에서 언제든 비밀번호를 변경할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
