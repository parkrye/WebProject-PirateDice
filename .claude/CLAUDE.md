# CLAUDE.md - AI 개발 가이드

이 문서는 AI가 코드를 작성할 때 **반드시 따라야 할 핵심 규칙**입니다.

---

## 참조 문서

| 문서 | 설명 | 용도 |
|------|------|------|
| [game_rules.md](./game_rules.md) | 게임 규칙 | 게임 로직 구현 시 |
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | 시스템 설계 | API, 데이터 모델, 파일 구조 |
| [UI_DESIGN.md](./UI_DESIGN.md) | UI 디자인 시스템 | 컬러, 컴포넌트, 레이아웃 |
| [CHANGELOG.md](./CHANGELOG.md) | 변경 이력 | 모든 변경 사항 기록 |

---

## 프로젝트 개요

**Pirate Dice** - 블러핑 기반 주사위 게임 웹 애플리케이션

### 기술 스택
| 영역 | 기술 |
|------|------|
| Backend | NestJS (Node.js) |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Database | Firebase Realtime Database |
| 실시간 통신 | WebSocket (Socket.io) |

### 프로젝트 구조
```
apps/
  backend/     -> NestJS 서버 (API, WebSocket)
  frontend/    -> React 클라이언트 (UI)
libs/
  game-engine/ -> 게임 규칙 핵심 로직
  entities/    -> 데이터 모델
  constants/   -> 상수값
  services/    -> 게임 서비스
  types/       -> 타입 정의
```

---

## 핵심 원칙

### 1. 유지보수성 우선
- 코드는 읽는 사람이 이해할 수 있게 작성
- 하드코딩 금지 -> 설정값은 `constants/`에 분리
- 임시 해결책은 반드시 `TODO` 주석으로 표시

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
| 타입 | `any` 사용 금지 |
| 클래스/인터페이스 | PascalCase |
| 변수/함수 | camelCase |
| enum | PascalCase |
| 파일명 | kebab-case |

### 함수 작성
- Early Return 패턴 사용
- 500줄 초과 금지 (파일 분리)
- 의미있는 변수명 사용

### NestJS 아키텍처
| 레이어 | 역할 |
|--------|------|
| Controller | HTTP 요청/응답 처리만 |
| Service | 비즈니스 로직 |
| Repository | 데이터베이스 접근 |
| Gateway | WebSocket 이벤트 처리 |

### Tailwind CSS
```html
<!-- 금지 -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">Play</button>

<!-- 권장 -->
<button class="btn-treasure">Play</button>
```

- 반복 스타일은 `@apply`로 컴포넌트화
- 클래스명은 의미 기반: `btn-primary`, `text-danger`

---

## 하드코딩 금지

```typescript
// 금지
if (playerCount === 2) initialDice = 15;

// 권장
import { INITIAL_DICE_COUNT } from '@libs/constants/game.constants';
const initialDice = INITIAL_DICE_COUNT[playerCount];
```

**반드시 설정 파일로 분리:**
- 게임 상수 (초기 주사위 수 등)
- API 키
- 메시지 문자열
- 서버 설정값

---

## 금지 사항

| 항목 | 이유 |
|------|------|
| 하드코딩 | 수정 어려움, 확장성 저하 |
| `any` 타입 | 타입 안전성 훼손 |
| Controller에 비즈니스 로직 | 관심사 분리 위반 |
| 주석 없는 복잡한 로직 | 유지보수 어려움 |
| 의미 없는 변수명 (`a`, `temp`) | 가독성 저하 |

---

## 변경 이력 기록 규칙

모든 문서/코드 변경 시 [CHANGELOG.md](./CHANGELOG.md)에 기록:

```markdown
## YYYY-MM-DD

### 작업 제목

**요청**: 사용자의 요청 내용 요약

#### 변경 사항

| 항목 | 변경 내용 |
|------|----------|
| 파일명 | 변경 내용 |
```

**기록 대상:**
- 새로운 파일 생성
- 기존 파일의 주요 수정
- 기능 추가/삭제/변경
- 설계 문서 업데이트

---

## 목표

모든 코드는 다음을 만족해야 합니다:
- 확장하기 쉬울 것
- 설정을 바꾸기 쉬울 것
- 읽기 쉬울 것
- 오류 발생 시 원인 파악이 쉬울 것
