# 🎯 댄스 아카데미 회원 관리 시스템

> 지인의 댄스 아카데미 관리를 위해 개발된 **2인 프로젝트**  
> 회원 등록부터 출석 관리, 매출 통계까지 학원 운영에 필요한 모든 기능을 통합 관리하는 웹 애플리케이션

## 📋 프로젝트 개요

기존에 수기로 관리하던 학원의 회원 정보, 출석, 결제 내역을 디지털화하여 효율적으로 관리할 수 있도록 개발했습니다. 실무에서 바로 사용 가능한 수준의 완성도를 목표로 했습니다.

## ✨ 주요 기능

### 1. 회원 관리
- 회원 등록/수정/삭제 및 상세 정보 관리
- 회원별 수업 등록 및 연장 기능
- 결제 상태 관리 및 결제 로그 조회
- 회원 숨김 처리 (삭제 대신 비활성화)

### 2. 출석 관리
- 일별 출석 체크 및 취소
- 출석 기록 자동 차감 (남은 수업 횟수 관리)
- 수업별 출석 현황 조회

### 3. 수업 관리
- 수업 등록/수정/삭제
- 주간 스케줄 관리 (요일별 시간 설정)
- 선생님 할당 및 관리

### 4. 통계 및 대시보드
- 월별 매출 통계 (결제/미결제 구분)
- 수업별 통계 (학생 수, 매출)
- 실시간 대시보드 (회원 수, 오늘의 수업 등)

### 5. 인증 시스템
- JWT 기반 인증
- 비밀번호 암호화 (bcrypt)
- 관리자 설정 (비밀번호/아이디 변경)

## 🛠 기술 스택

### Backend
- **Node.js** + **Express.js** - RESTful API 서버
- **MySQL** - 관계형 데이터베이스
- **JWT** - 토큰 기반 인증
- **bcrypt** - 비밀번호 암호화

### Frontend
- **Vanilla JavaScript** - 프레임워크 없이 순수 JS로 구현
- **HTML/CSS** - 반응형 UI

### Architecture
- **MVC 패턴** - Routes, Controllers, Middleware 분리
- **RESTful API** - 표준 HTTP 메서드 사용
- **Transaction** - 데이터 일관성 보장

## 📁 프로젝트 구조

```
Membership-management/
├── backend/
│   ├── config/          # DB 연결 설정
│   ├── controllers/     # 비즈니스 로직
│   ├── routes/          # API 엔드포인트
│   ├── middleware/      # 인증 미들웨어
│   └── server.js        # Express 서버
├── frontend/
│   ├── views/          # HTML 페이지
│   └── public/         # 정적 파일
│       ├── images/
│       └── scripts/
└── database/
    └── init.sql        # DB 스키마
```

## 🚀 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env.development)
NODE_ENV=development
MYSQLHOST=localhost
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQL_DATABASE=oohjinDanceAcademy_DB
MYSQLPORT=3306
JWT_SECRET=your_jwt_secret_key
PORT=8080

# 3. 데이터베이스 초기화
mysql -u root -p < database/init.sql

# 4. 서버 실행
node backend/server.js
```

## 💡 주요 특징

- **실무 중심 설계**: 실제 학원 운영 시나리오를 반영한 기능 구현
- **데이터 무결성**: Transaction을 통한 안전한 데이터 처리
- **확장 가능한 구조**: MVC 패턴으로 유지보수 용이
- **사용자 친화적 UI**: 직관적인 인터페이스로 누구나 쉽게 사용 가능
