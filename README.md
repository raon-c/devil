# 저격 홀덤 게임 (Raon Devils)

Next.js와 Supabase를 사용한 실시간 멀티플레이어 포커 게임입니다.

## 🎮 게임 소개

저격 홀덤은 기존 텍사스 홀덤에 "저격" 시스템을 추가한 독특한 포커 변형 게임입니다.

### 주요 특징
- 실시간 멀티플레이어 (2-6명)
- 저격 시스템: 상대방의 족보를 예측하여 추가 점수 획득
- 생존 확정 시스템: 75칩으로 게임 종료까지 생존 보장
- 다크 모드 지원
- 실시간 게임 로그

## 🚀 시작하기

### 1. 환경 설정

프로젝트를 클론한 후 환경 변수를 설정해야 합니다:

```bash
# .env.local 파일을 생성하고 다음 내용을 추가하세요
cp .env.example .env.local
```

`.env.local` 파일에 Supabase 정보를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. 의존성 설치

```bash
pnpm install
# 또는
npm install
# 또는
yarn install
```

### 3. 개발 서버 실행

```bash
pnpm dev
# 또는
npm run dev
# 또는
yarn dev
```

[http://localhost:3000](http://localhost:3000)에서 게임을 확인할 수 있습니다.

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **Backend**: Supabase (PostgreSQL + Realtime)
- **State Management**: Zustand
- **Package Manager**: pnpm

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── auth/           # 인증 페이지
│   ├── lobby/          # 로비 페이지
│   └── game/[id]/      # 게임 페이지
├── components/         # React 컴포넌트
│   ├── auth/          # 인증 관련 컴포넌트
│   ├── game/          # 게임 관련 컴포넌트
│   ├── layout/        # 레이아웃 컴포넌트
│   └── lobby/         # 로비 관련 컴포넌트
├── hooks/             # 커스텀 훅
├── types/             # TypeScript 타입 정의
└── utils/             # 유틸리티 함수
```

## 🎯 게임 규칙

### 기본 규칙
1. 각 플레이어는 2장의 개인 카드를 받습니다
2. 4장의 공유 카드가 순차적으로 공개됩니다
3. 2차례의 베팅 라운드가 있습니다
4. 최종적으로 6장 중 5장으로 최고의 족보를 만듭니다

### 저격 시스템
- 2차 베팅 후, 개인 카드 공개 전에 진행
- 상대방의 족보와 가장 높은 카드를 예측
- 성공 시 추가 칩 획득, 실패 시 칩 차감

### 생존 확정
- 75칩을 소모하여 게임 종료까지 생존 보장
- 생존 확정 플레이어는 칩을 잃지 않음

## 🔒 보안 주의사항

**중요**: 환경 변수 파일들은 절대 Git에 커밋하지 마세요!

- `.env.local` - 로컬 개발용 환경 변수 (Git 무시됨)
- `.env.example` - 환경 변수 템플릿 (Git에 포함됨)

## 🚀 배포

프로덕션 환경에 배포할 때는 다음을 확인하세요:

1. **환경 변수 설정**: 배포 플랫폼에 Supabase 자격 증명 설정
2. **빌드 최적화**: `npm run build` 실행하여 최적화된 빌드 생성
3. **데이터베이스**: Supabase 프로젝트가 프로덕션 환경에 맞게 설정되었는지 확인

### Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 환경 변수는 Vercel 대시보드에서 설정
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.
