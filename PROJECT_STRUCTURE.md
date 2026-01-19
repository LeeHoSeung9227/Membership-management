# 프로젝트 구조 설명

## 📂 디렉토리 구조

```
Membership-management/
├── backend/                    # 백엔드 코드
│   ├── config/                # 설정 파일
│   │   └── database.js       # MySQL 연결 설정
│   ├── controllers/          # 컨트롤러 (비즈니스 로직)
│   │   ├── authController.js
│   │   ├── memberController.js
│   │   ├── attendanceController.js
│   │   ├── statisticsController.js
│   │   ├── instructorController.js
│   │   ├── programController.js
│   │   └── dashboardController.js
│   ├── middleware/           # 미들웨어
│   │   └── auth.js          # JWT 인증 미들웨어
│   ├── routes/              # API 라우트
│   │   ├── index.js         # 라우트 통합
│   │   ├── authRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── statisticsRoutes.js
│   │   ├── instructorRoutes.js
│   │   ├── programRoutes.js
│   │   └── dashboardRoutes.js
│   ├── server.js            # Express 서버 메인 파일
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/                 # 프론트엔드 코드
│   ├── views/              # HTML 페이지
│   │   ├── 로그인.html
│   │   ├── 홈페이지.html
│   │   ├── 회원관리.html
│   │   ├── 회원정보등록.html
│   │   ├── 회원수업추가.html
│   │   ├── 회원수업수정.html
│   │   ├── 출석부.html
│   │   ├── 수업관리.html
│   │   ├── 선생님관리.html
│   │   ├── 선생님정보등록.html
│   │   ├── 선생님정보수정.html
│   │   ├── 매출_통계페이지.html
│   │   └── 설정.html
│   └── public/             # 정적 파일
│       ├── images/         # 이미지 파일
│       │   ├── 로고_black.png
│       │   ├── 로고_white.png
│       │   └── ...
│       ├── scripts/       # JavaScript 파일
│       │   ├── api.js           # API 통신 모듈
│       │   ├── login.js         # 로그인 페이지 스크립트
│       │   ├── dashboard.js     # 대시보드 스크립트
│       │   ├── member_management.js
│       │   ├── attendance.js
│       │   ├── schedule.js
│       │   ├── sales_statistics.js
│       │   └── ...
│       └── styles/        # CSS 파일 (추후 추가)
│
├── database/               # 데이터베이스 관련
│   └── init.sql          # 데이터베이스 초기화 스크립트
│
├── server.js.old          # 기존 서버 파일 (참조용)
├── package.json
├── README.md
└── PROJECT_STRUCTURE.md   # 이 파일
```

## 🔄 구조 개선 사항

### Before (기존 구조)
```
Membership-management/
├── *.html (모든 HTML 파일이 루트에)
├── *.js (모든 JS 파일이 루트에)
├── image/ (이미지 폴더)
├── server.js (모든 API가 하나의 파일에)
└── init.sql
```

### After (개선된 구조)
- ✅ 백엔드와 프론트엔드 분리
- ✅ MVC 패턴 적용 (Routes, Controllers, Middleware)
- ✅ 설정 파일 분리 (database.js)
- ✅ 정적 파일 정리 (images, scripts, styles)
- ✅ 데이터베이스 파일 분리

## 📝 다음 단계

1. **컨트롤러 구현 완성**
   - 현재 컨트롤러들은 구조만 정의되어 있음
   - `server.js.old`를 참조하여 실제 로직 구현 필요

2. **프론트엔드 경로 수정**
   - HTML 파일 내의 스크립트 경로 수정 필요
   - 이미지 경로 수정 필요

3. **환경 변수 설정**
   - `.env.development` 및 `.env.production` 파일 확인

4. **테스트**
   - 서버 실행 테스트
   - API 엔드포인트 테스트

## 🚀 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
# .env.development 파일 생성 및 설정

# 3. 데이터베이스 초기화
mysql -u root -p < database/init.sql

# 4. 서버 실행
node backend/server.js
```

