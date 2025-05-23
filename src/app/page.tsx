'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">🎯 Raon Devils</div>
        <nav className="flex space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">안녕하세요, {user.email}</span>
              <Link href="/lobby" className="btn btn-primary">
                로비 입장
              </Link>
              <button 
                onClick={() => supabase?.auth.signOut()}
                className="btn btn-outline btn-secondary"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link href="/auth" className="btn btn-outline btn-primary">
                로그인
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            저격 홀덤
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            기존 텍사스 홀덤에 독특한 "저격" 시스템을 추가한 
            실시간 멀티플레이어 포커 게임
          </p>
          {user ? (
            <Link href="/lobby" className="btn btn-primary btn-lg text-lg">
              🎮 게임 시작하기
            </Link>
          ) : (
            <Link href="/auth" className="btn btn-primary btn-lg text-lg">
              🎮 지금 시작하기
            </Link>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="card-title text-white justify-center">저격 시스템</h3>
              <p className="text-gray-300">
                상대방의 족보를 예측하여 추가 점수를 획득하는 독특한 시스템
              </p>
            </div>
          </div>

          <div className="card bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="card-title text-white justify-center">생존 확정</h3>
              <p className="text-gray-300">
                75칩으로 게임 종료까지 생존을 보장받을 수 있는 전략적 선택
              </p>
            </div>
          </div>

          <div className="card bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="card-title text-white justify-center">실시간 플레이</h3>
              <p className="text-gray-300">
                2-6명이 함께 즐기는 실시간 멀티플레이어 포커 게임
              </p>
            </div>
          </div>
        </div>

        {/* Game Rules Preview */}
        <div className="card bg-white/5 backdrop-blur-sm border border-white/10 mb-16">
          <div className="card-body">
            <h2 className="card-title text-white text-3xl justify-center mb-8">게임 방법</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">기본 규칙</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• 각 플레이어는 2장의 개인 카드를 받습니다</li>
                  <li>• 4장의 공유 카드가 순차적으로 공개됩니다</li>
                  <li>• 2차례의 베팅 라운드가 진행됩니다</li>
                  <li>• 6장 중 5장으로 최고의 족보를 만듭니다</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">특별 규칙</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• <span className="text-yellow-400">저격:</span> 상대방 족보 예측으로 추가 점수</li>
                  <li>• <span className="text-green-400">생존 확정:</span> 75칩으로 안전 보장</li>
                  <li>• <span className="text-blue-400">실시간:</span> 동시 접속으로 빠른 게임</li>
                  <li>• <span className="text-purple-400">다크모드:</span> 눈에 편한 UI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">지금 바로 시작하세요!</h2>
          <p className="text-lg text-gray-300 mb-8">
            친구들과 함께 새로운 포커의 재미를 경험해보세요
          </p>
          {user ? (
            <div className="flex justify-center space-x-4">
              <Link href="/lobby" className="btn btn-primary btn-lg">
                🏠 로비로 이동
              </Link>
              <Link href="/auth" className="btn btn-outline btn-secondary btn-lg">
                👤 계정 관리
              </Link>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Link href="/auth" className="btn btn-primary btn-lg">
                📝 회원가입
              </Link>
              <Link href="/auth" className="btn btn-outline btn-secondary btn-lg">
                🔑 로그인
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p className="mb-4">© 2024 Raon Devils. 개인 프로젝트.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-white transition-colors">게임 규칙</a>
            <a href="#" className="hover:text-white transition-colors">문의하기</a>
            <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
