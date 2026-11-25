import type { CalendarEvent, Member, Task, WeeklyGoal } from "./types";

// Every date below is written as if today were MOCK_ANCHOR; the data layer shifts them to the real today.
export const MOCK_ANCHOR = "2026-11-25";

const NOTION = "https://www.notion.so";

export const members: Member[] = [
  { id: "mikyung", name: "정미경", short: "미경", role: "대표" },
  { id: "minju", name: "김민주", short: "민주", role: "PM" },
  { id: "jin", name: "김진", short: "김진", role: "팀원" },
];

// The title gets its date prefix ("11월 24일 홍보 회의") after the shift.
export const meetings = [
  { id: "m1", name: "주간 회의", date: "2026-11-12" },
  { id: "m2", name: "주간 회의", date: "2026-11-19" },
  { id: "m3", name: "기획 회의", date: "2026-11-20" },
  { id: "m4", name: "홍보 회의", date: "2026-11-24" },
];

export const tasks: Task[] = [
  // 김진
  { id: "t1", title: "법인카드 구독 목록 정리", status: "todo", assigneeId: "jin", due: "2026-11-21", important: false, meetingId: "m2", notionUrl: NOTION },
  {
    id: "t2",
    title: "백오피스 화면 시안",
    status: "doing",
    assigneeId: "jin",
    due: "2026-11-25",
    important: true,
    meetingId: "m3",
    description: "홈, 캘린더, 진행 현황, 팀 현황 화면 시안 만들기",
    subtasks: [
      { title: "1차 시안", done: true },
      { title: "색 줄이기", done: true },
      { title: "홈, 캘린더 추가", done: false },
    ],
    notionUrl: NOTION,
  },
  { id: "t3", title: "노션 표 항목 정리", status: "review", assigneeId: "jin", due: "2026-11-25", important: false, meetingId: "m3", notionUrl: NOTION },
  { id: "t4", title: "홈페이지 글 화면 보완", status: "done", assigneeId: "jin", due: "2026-11-25", important: false, meetingId: "m2", notionUrl: NOTION },
  { id: "t5", title: "구글 캘린더 권한 요청", status: "todo", assigneeId: "jin", due: "2026-11-27", important: false, meetingId: "m3", notionUrl: NOTION },
  { id: "t6", title: "슬랙 앱 만들기", status: "todo", assigneeId: "jin", due: "2026-11-28", important: false, meetingId: "m3", notionUrl: NOTION },
  { id: "t7", title: "백오피스 메뉴 구조 정리", status: "done", assigneeId: "jin", due: "2026-11-23", important: false, meetingId: "m3", notionUrl: NOTION },
  { id: "t8", title: "노션 연동 범위 정리", status: "done", assigneeId: "jin", due: "2026-11-24", important: false, meetingId: "m3", notionUrl: NOTION },

  // 정미경
  { id: "t9", title: "A기관 미팅 자료 준비", status: "done", assigneeId: "mikyung", due: "2026-11-25", important: false, meetingId: "m2", notionUrl: NOTION },
  { id: "t10", title: "B요양원 협의 안건 정리", status: "todo", assigneeId: "mikyung", due: "2026-11-27", important: true, meetingId: "m2", notionUrl: NOTION },
  { id: "t11", title: "SENIO 특허 보도자료", status: "review", assigneeId: "mikyung", due: "2026-11-27", important: true, meetingId: "m4", notionUrl: NOTION },
  { id: "t12", title: "투자사 발표 자료 보완", status: "done", assigneeId: "mikyung", due: "2026-11-23", important: false, meetingId: "m2", notionUrl: NOTION },
  { id: "t13", title: "월간 지출 결재", status: "done", assigneeId: "mikyung", due: "2026-11-24", important: false, notionUrl: NOTION },
  { id: "t14", title: "C기관 담당자 통화", status: "done", assigneeId: "mikyung", due: "2026-11-24", important: false, meetingId: "m2", notionUrl: NOTION },
  { id: "t15", title: "C기관 시범 운영 보고서", status: "doing", assigneeId: "mikyung", due: "2026-12-02", important: true, meetingId: "m2", notionUrl: NOTION },

  // 김민주
  { id: "t16", title: "정부과제 중간보고서 초안", status: "todo", assigneeId: "minju", due: "2026-11-28", important: true, meetingId: "m2", notionUrl: NOTION },
  { id: "t17", title: "보도자료 배포 일정 확인", status: "doing", assigneeId: "minju", due: "2026-11-24", important: false, meetingId: "m4", notionUrl: NOTION },
  { id: "t18", title: "백오피스 공개 사내 공지", status: "review", assigneeId: "minju", due: "2026-11-25", important: false, meetingId: "m3", notionUrl: NOTION },
  { id: "t19", title: "C경로당 방문 사진 받기", status: "doing", assigneeId: "minju", due: "2026-11-26", important: false, meetingId: "m4", notionUrl: NOTION },
  { id: "t20", title: "12월 홍보 일정 확정", status: "done", assigneeId: "minju", due: "2026-11-24", important: true, meetingId: "m4", notionUrl: NOTION },
  { id: "t21", title: "겨울 실내 걷기 글 작성", status: "done", assigneeId: "minju", due: "2026-11-24", important: false, meetingId: "m4", notionUrl: NOTION },
  { id: "t22", title: "D 건강학교 후속 자료 정리", status: "done", assigneeId: "minju", due: "2026-11-23", important: false, meetingId: "m2", notionUrl: NOTION },
  { id: "t23", title: "11월 활동 사진 정리", status: "done", assigneeId: "minju", due: "2026-11-25", important: false, meetingId: "m4", notionUrl: NOTION },
  { id: "t24", title: "홍보 사진 촬영 정리", status: "done", assigneeId: "minju", due: "2026-11-23", important: false, meetingId: "m4", notionUrl: NOTION },
  { id: "t25", title: "12월 카톡 소식 문안 검토", status: "todo", assigneeId: "minju", due: "2026-12-01", important: false, meetingId: "m4", notionUrl: NOTION },

  // 미지정
  { id: "t26", title: "건강학교 참여자 인터뷰 섭외", status: "todo", due: "2026-11-28", important: false, meetingId: "m4", notionUrl: NOTION },

  // 지난 업무
  { id: "t27", title: "A기관 협약 보도", status: "done", assigneeId: "mikyung", due: "2026-11-10", important: false, meetingId: "m1", notionUrl: NOTION },
  { id: "t28", title: "중간 점검 자료", status: "done", assigneeId: "minju", due: "2026-11-13", important: true, meetingId: "m1", notionUrl: NOTION },
  { id: "t29", title: "SENIO 현장 사진 정리", status: "done", assigneeId: "minju", due: "2026-11-18", important: false, meetingId: "m1", notionUrl: NOTION },
  { id: "t30", title: "건강학교 수료 소식", status: "done", assigneeId: "minju", due: "2026-11-20", important: false, meetingId: "m2", notionUrl: NOTION },
];

export const weeklyGoals: WeeklyGoal[] = [
  { id: "g1", week: "2026-W48", title: "SENIO 시범 운영 기관 2곳 추가 미팅", ownerId: "mikyung", done: true },
  { id: "g2", week: "2026-W48", title: "12월 홍보 일정 확정", ownerId: "minju", done: true },
  { id: "g3", week: "2026-W48", title: "백오피스 1차 화면 공개", ownerId: "jin", done: false },
  { id: "g4", week: "2026-W48", title: "정부과제 중간보고서 초안", ownerId: "minju", done: false },
];

export const events: CalendarEvent[] = [
  { id: "e1", title: "주간 업무 회의", date: "2026-11-05", ownerId: "all" },
  { id: "e2", title: "주간 업무 회의", date: "2026-11-12", ownerId: "all" },
  { id: "e3", title: "B요양원 협의", date: "2026-11-17", time: "10:00", ownerId: "mikyung" },
  { id: "e4", title: "홍보 사진 촬영", date: "2026-11-18", ownerId: "minju" },
  { id: "e5", title: "주간 업무 회의", date: "2026-11-19", ownerId: "all" },
  { id: "e6", title: "백오피스 기획 회의", date: "2026-11-20", time: "14:00", ownerId: "jin" },
  { id: "e7", title: "투자사 발표", date: "2026-11-20", ownerId: "mikyung" },
  { id: "e8", title: "12월 홍보 회의", date: "2026-11-24", ownerId: "minju" },
  { id: "e9", title: "월말 업무 점검 회의", date: "2026-11-25", time: "10:00", ownerId: "all" },
  { id: "e10", title: "백오피스 시안 검토", date: "2026-11-25", time: "14:00", ownerId: "jin" },
  { id: "e11", title: "D 건강학교 후속 논의", date: "2026-11-25", time: "16:30", ownerId: "minju" },
  { id: "e12", title: "주간 업무 회의", date: "2026-11-26", ownerId: "all" },
  { id: "e13", title: "C경로당 방문", date: "2026-11-26", time: "16:00", ownerId: "mikyung" },
  { id: "e14", title: "B요양원 협의 회의", date: "2026-11-27", time: "11:00", ownerId: "mikyung", important: true },
  { id: "e15", title: "정부과제 중간보고서 제출", date: "2026-11-28", ownerId: "minju", important: true },
  { id: "e16", title: "월말 결산", date: "2026-11-30", ownerId: "mikyung" },
  { id: "e17", title: "C기관 시범 운영 시작 보고", date: "2026-12-02", ownerId: "mikyung", important: true },
  { id: "e18", title: "백오피스 1차 공개", date: "2026-12-05", ownerId: "jin", important: true },
  { id: "e19", title: "연말 성과 보고회", date: "2026-12-08", time: "15:00", ownerId: "all", important: true },
];
