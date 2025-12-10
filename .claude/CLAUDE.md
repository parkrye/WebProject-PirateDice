# CLAUDE.md - AI 개발 가이드

이 문서는 AI가 코드를 작성할 때 반드시 따라야 할 규칙입니다.

---

## 프로젝트 개요

웹 애플리케이션

### 기술 스택
| 영역 | 기술 |
|------|------|
| Backend | NestJS (Node.js 프레임워크) |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Database | Firebase Realtime Database |
| 게임 로직 | libs/game-engine (공유 라이브러리) |

### 프로젝트 구조
```
apps/
  backend/     -> NestJS 서버 (API, 네트워크 처리)
  frontend/    -> React 클라이언트 (UI, 사용자 입력)
libs/
  game-engine/ -> 게임 규칙 핵심 로직
  entities/    -> 게임 데이터 모델 (Player, DiceSet 등)
  constants/   -> 상수값 (점수 테이블 등)
  services/    -> 게임 서비스 (주사위, 점수 계산 등)
  types/       -> 타입 정의
```

---

## 핵심 원칙

### 1. 유지보수성 우선
- 코드는 읽는 사람이 이해할 수 있게 작성
- 하드코딩 금지 -> 설정값은 configs/ 또는 constants/에 분리
- 임시 해결책(TEMP FIX)은 반드시 TODO 주석으로 표시

### 2. 확장성 고려
- SOLID 원칙 준수
- 하나의 클래스/함수는 하나의 책임만 가짐

---

## 코딩 규칙

### TypeScript
```typescript
// 금지: any 사용
let data: any  // X

// 권장: 명확한 타입 정의
interface PlayerStatus {  // O
  hp: number;
  combo: number;
}
```

| 항목 | 규칙 |
|------|------|
| 타입 | any 사용 금지 |
| 클래스/인터페이스 | PascalCase |
| 변수/함수 | camelCase |
| enum | PascalCase |
| 파일명 | kebab-case |

### 함수 작성
- Early Return 패턴 사용 (중첩 줄이기)
- 500줄 초과 금지 (파일 분리 필요)
- 의미있는 변수명 사용

### NestJS 아키텍처
```
Controller -> Service -> Repository
(요청/응답)   (비즈니스)   (DB 접근)
```

| 레이어 | 역할 |
|--------|------|
| Controller | HTTP 요청/응답 처리만 담당 |
| Service | 비즈니스 로직 처리 |
| Repository | 데이터베이스 접근 |
| Module | 기능별 분리 및 의존성 관리 |

### Tailwind CSS
```html
<!-- 금지: 인라인에 긴 클래스 나열 -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">Play</button>

<!-- 권장: 의미있는 클래스로 추상화 -->
<button class="btn-primary">Play</button>
```

- 반복되는 스타일은 @apply로 컴포넌트화
- 클래스명은 의미 기반: btn-primary, text-danger

---

## 하드코딩 금지 예시
```typescript
// 금지
if (combo > 30) damage *= 1.5;

// 권장
import { COMBO_DAMAGE_TABLE } from '@/configs/combat.config';
damage *= COMBO_DAMAGE_TABLE.getMultiplier(combo);
```

다음은 반드시 설정 파일로 분리:
- 게임 상수 (점수, 배율 등)
- API 키
- 메시지 문자열
- 서버 설정값

---

## 금지 사항

| 항목 | 이유 |
|------|------|
| 하드코딩 | 수정 어려움, 확장성 저하 |
| any 타입 | 타입 안전성 훼손 |
| Controller에 비즈니스 로직 | 관심사 분리 위반 |
| 주석 없는 복잡한 로직 | 유지보수 어려움 |
| 의미 없는 변수명 (a, temp) | 가독성 저하 |

---

## 목표

모든 코드는 다음을 만족해야 합니다:
- 확장하기 쉬울 것
- 설정을 바꾸기 쉬울 것
- 읽기 쉬울 것
- 오류 발생 시 원인 파악이 쉬울 것

---

## 시스템 설계

### 게임 흐름

### 데이터 모델

### API 설계

#### Game API

### 파일 구조 상세

### Firebase 데이터 구조

## UI 디자인 시스템

### 디자인 컨셉: Casino Table

### 컬러 팔레트

### Tailwind 커스텀 설정

### 커스텀 컴포넌트 클래스

### UI 컴포넌트 레이아웃