프로젝트 기획서: GrowthManager (Daily Sales Tracker)

1. 프로젝트 개요

프로젝트명: GrowthManager

목적: 보험 설계사의 일일 영업 활동 기록 및 실적 관리, 팀장과의 실시간 데이터 공유.

주요 타겟: 영업 설계사(User) 및 팀 관리자(Leader).

2. 기술 스택 및 인증 구조

Frontend: React (Next.js) + Tailwind CSS (반응형 웹).

Authentication: Supabase Auth (기존 '엉클비 스튜디오' 계정 연동).

Supabase의 auth.uid를 Firebase Firestore의 사용자 고유 키로 활용.

Database: Firebase Firestore.

사용자 프로필(이메일 포함) 및 영업 기록 저장소.

Data Sync: 로그인 시 사용자의 이메일 주소를 Firestore의 members 테이블에 동기화하여 팀장 검색 및 매칭에 활용.

3. 권한 및 조직 로직

다중 팀장 구조: 한 명의 설계사는 여러 명의 팀장을 설정할 수 있음.

데이터 접근 제한:

설계사: 본인의 기록만 입력 및 조회 가능.

팀장: 자신을 팀장으로 등록한 설계사들의 기록만 조회 가능.

설정 메뉴: '내 팀장 설정' 메뉴에서 팀장의 이메일을 입력하여 추가/삭제 가능.

4. 데이터 모델 (Firestore)

4.1. members (사용자 정보)

uid (string): Supabase UID.

email (string): 검색용 이메일 주소.

leaders (array): 본인이 선택한 팀장들의 이메일 리스트.

monthly_goal_amount (number): 이번 달 원화 목표.

monthly_goal_cases (number): 이번 달 건수 목표.

4.2. daily_logs (일일 영업 기록)

log_id (string): uid_YYYY-MM-DD 형식.

uid (string): 작성자 UID.

date (string): YYYY-MM-DD.

work_status (string): 출근, 외근, 교육, 재택, 직접 입력값.

call_target (number): 오늘의 통화 목표 수.

call_actual (number): 실제 통화 수.

performance_amount (number): 금일 실적(원화).

performance_cases (number): 금일 실적(건수).

notable_outcomes (array):

{ name: string, age: number, memo: string } (제한 없음).

5. 주요 화면 및 기능 명세

5.1. 설계사 대시보드 (Main)

목표 현황 섹션: - 이번 달 누적 실적(합산) vs 월간 목표 시각화 (Progress Bar).

오늘의 콜 목표 vs 현재 진행률 시각화.

일일 기록 입력/수정: - 하루에 여러 번 진입하여 데이터를 수정(Overwrite) 저장 가능.

실적(원화/건수) 및 통화 수 입력 필드.

주목할 만한 성과 리스트: 고객 이름, 나이 기록 (추가 버튼으로 무제한 생성).

근무지 설정: 선택지 외에 직접 입력 가능한 인풋 제공.

5.2. 팀장 모니터링 페이지 (Leader View)

팀원 리스트: 자신을 팀장으로 등록한 설계사들이 리스트 형태로 나열됨.

실시간 요약: 각 팀원의 오늘 출근 상태, 현재 콜 수, 금일 실적 합계를 한눈에 확인.

상세 보기: 특정 팀원 클릭 시 해당 팀원의 월간 누적 데이터 및 최근 일일 기록 리스트 노출.

5.3. 설정 및 관리

월간 목표 설정: 매달 초 1회 입력 및 고정(수정 가능).

내 팀장 설정: 팀장 이메일 기반 검색 및 다중 등록 관리.

6. 핵심 비즈니스 로직

자동 합산: '이번 달 실적'은 Firestore에서 해당 사용자의 해당 월 daily_logs 전체를 쿼리하여 performance_amount와 performance_cases를 합산하여 표시.

수정 우선: 동일 날짜에 대한 입력은 신규 생성이 아닌 기존 문서의 update 로직을 따름.

7. UI/UX 가이드라인

모바일 우선 디자인: 필드 현장에서 한 손으로 입력하기 쉬운 버튼 크기 및 간격 확보.

시각화: 단순 텍스트보다는 차트와 게이지 바를 활용하여 달성률 강조.

리스트 뷰: 기록 조회 시 캘린더보다는 정보 밀도가 높은 리스트 형태 선호.