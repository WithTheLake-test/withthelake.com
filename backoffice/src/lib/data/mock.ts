import { TODAY, addDays, monthDay } from "../date";
import { NOTION_TASKS_URL } from "../links";
import type { CalendarEvent, Member, PublishItem, Task } from "./types";

// Dates are relative to today so the screens never go empty.
const day = (offset: number) => addDays(TODAY, offset);
const meeting = (offset: number, name: string) => `${monthDay(day(offset))} ${name}`;
const url = NOTION_TASKS_URL;

export const members: Member[] = [
  { id: "mikyung", name: "정미경", short: "미경", role: "대표", notionName: "대표님" },
  { id: "minju", name: "김민주", short: "민주", role: "PM", notionName: "김민주" },
  { id: "jin", name: "김진", short: "김진", role: "팀원", notionName: "김진" },
];

const MG = "mg-school";

export const tasks: Task[] = [
  // MG 함께자람 건강학교 and its sub-tasks
  { id: MG, title: "MG 함께자람 건강학교", status: "진행중", important: false, assigneeIds: ["minju"], start: day(-60), due: day(10), category: "운영", kind: "프로젝트", partner: "MG새마을금고", notionUrl: url },
  { id: "t1", title: "만족도조사 참여 안내 문자 발송", status: "준비", important: false, assigneeIds: ["mikyung"], due: day(-3), category: "운영", kind: "할 일", parentId: MG, notionUrl: url },
  { id: "t2", title: "결과 대외 안내", status: "준비", important: false, assigneeIds: ["minju"], due: day(1), category: "운영", kind: "마감·제출", parentId: MG, notionUrl: url },
  { id: "t3", title: "결과지 제작·데이터 정리", status: "진행중", important: true, assigneeIds: ["minju"], start: day(-9), due: day(-2), category: "운영", kind: "할 일", parentId: MG, meetingTitle: meeting(-9, "주간 회의"), notionUrl: url },
  { id: "t4", title: "결과보고서 완성", status: "진행중", important: true, assigneeIds: ["mikyung"], due: day(-2), category: "운영", kind: "마감·제출", parentId: MG, meetingTitle: meeting(-9, "주간 회의"), memo: "결과지 정리 후 최종본 작성", notionUrl: url },
  { id: "t5", title: "사업보고 제출", status: "진행중", important: true, assigneeIds: ["mikyung"], due: day(4), category: "운영", kind: "마감·제출", parentId: MG, notionUrl: url },
  { id: "t6", title: "우두중리경로당 현판식 촬영", status: "완료", important: false, assigneeIds: ["mikyung"], due: day(-6), category: "운영", kind: "행사·미팅", parentId: MG, notionUrl: url },
  { id: "t7", title: "출석부 스캔 (증빙)", status: "완료", important: false, assigneeIds: ["jin"], due: day(-5), category: "운영", kind: "할 일", parentId: MG, notionUrl: url },

  // Other projects
  { id: "t8", title: "위드웰미 스마트스토어 셋팅", status: "진행중", important: false, assigneeIds: ["jin"], due: day(-24), category: "운영", kind: "프로젝트", notionUrl: url },
  { id: "t9", title: "강원초기창업 IR 발표", status: "진행중", important: true, assigneeIds: ["mikyung"], due: day(0), category: "정부지원과제", kind: "프로젝트", partner: "강원창조경제혁신센터", notionUrl: url },
  { id: "t10", title: "산업인력공단 AI 교육", status: "진행중", important: true, assigneeIds: ["minju", "jin"], start: day(-3), due: day(4), category: "정부지원과제", kind: "프로젝트", partner: "한국산업인력공단", notionUrl: url },
  { id: "t11", title: "[강원창경] 지역주도 AI 대전환", status: "진행중", important: false, assigneeIds: ["minju", "jin"], due: day(4), category: "정부지원과제", kind: "프로젝트", notionUrl: url },
  { id: "t12", title: "미스트 후원 (복지관·경로당)", status: "진행중", important: true, assigneeIds: ["mikyung"], due: day(9), category: "운영", kind: "프로젝트", notionUrl: url },
  { id: "t13", title: "춘천 맨발걷기 웰니스 특방", status: "진행중", important: false, assigneeIds: ["mikyung", "jin"], due: day(14), category: "운영", kind: "프로젝트", notionUrl: url },
  { id: "t14", title: "세니오 앱 추가개발", status: "진행중", important: false, assigneeIds: ["minju"], due: day(23), category: "개발", kind: "프로젝트", notionUrl: url },
  { id: "t15", title: "찜질팩 제작", status: "준비", important: false, assigneeIds: ["mikyung", "minju"], start: day(5), due: day(16), category: "운영", kind: "프로젝트", notionUrl: url },
  { id: "t16", title: "오마이컴퍼니·해피빈 펀딩", status: "준비", important: false, assigneeIds: ["mikyung"], due: day(24), category: "정부지원과제", kind: "프로젝트", notionUrl: url },
  { id: "t17", title: "홈페이지 리뉴얼 기획", status: "준비", important: false, assigneeIds: ["jin"], category: "개발", kind: "할 일", memo: "일정 미정", notionUrl: url },
  { id: "t18", title: "판판대로 (상품 개선 지원)", status: "완료", important: false, assigneeIds: ["minju"], due: day(-12), category: "정부지원과제", kind: "프로젝트", notionUrl: url },
  { id: "t19", title: "2026 강원 시니어산업박람회", status: "완료", important: false, assigneeIds: ["mikyung", "jin"], due: day(-8), category: "운영", kind: "행사·미팅", notionUrl: url },
];

export const publishes: PublishItem[] = [
  { id: "p1", title: "시니어박람회 참여", date: day(1), status: "발행대기", category: "기사PR", assigneeIds: ["minju"], notionUrl: url },
  { id: "p2", title: "춘천웰니스 점심 정기메시지", date: day(1), status: "작성중", category: "카톡정기메세지", assigneeIds: ["jin"], notionUrl: url },
  { id: "p3", title: "(PR)슬슬쌀롱 프로그램", date: day(2), status: "발행대기", category: "기사PR", assigneeIds: ["minju"], notionUrl: url },
  { id: "p4", title: "슬슬쌀롱 프로그램", date: day(2), status: "사진수급필요", category: "홈페이지", assigneeIds: ["jin"], notionUrl: url },
  { id: "p5", title: "건강학교 참여자 인터뷰", date: day(3), status: "대기", category: "N블로그", assigneeIds: [], notionUrl: url },
  { id: "p6", title: "함께자람 건강학교 소개", date: day(-16), status: "발행완료", category: "홈페이지", assigneeIds: ["minju"], notionUrl: url },
  { id: "p7", title: "(PR)함께자람 건강학교", date: day(-16), status: "발행완료", category: "기사PR", assigneeIds: ["mikyung"], notionUrl: url },
  { id: "p8", title: "미래동행 협약 소식", date: day(-9), status: "대기", category: "기사PR", assigneeIds: ["minju"], notionUrl: url },
  { id: "p9", title: "겨울 걷기 챌린지 안내", date: day(7), status: "대기", category: "인스타그램", assigneeIds: ["jin"], notionUrl: url },
];

export const events: CalendarEvent[] = [
  { id: "e1", title: "A기관 미팅", date: day(-23), ownerId: "mikyung" },
  { id: "e2", title: "주간 업무 회의", date: day(-21), ownerId: "all" },
  { id: "e3", title: "시범 운영 기관 방문", date: day(-16), ownerId: "mikyung" },
  { id: "e4", title: "주간 업무 회의", date: day(-14), ownerId: "all" },
  { id: "e5", title: "정부과제 중간 점검", date: day(-13), ownerId: "minju" },
  { id: "e6", title: "B요양원 협의", date: day(-9), time: "10:00", ownerId: "mikyung" },
  { id: "e7", title: "주간 업무 회의", date: day(-7), ownerId: "all" },
  { id: "e8", title: "기획 회의", date: day(-6), time: "14:00", ownerId: "jin" },
  { id: "e9", title: "투자사 발표", date: day(-6), ownerId: "mikyung" },
  { id: "e10", title: "12월 홍보 회의", date: day(-2), ownerId: "minju" },
  { id: "e11", title: "주간 업무 회의", date: day(0), time: "10:00", ownerId: "all" },
  { id: "e12", title: "강원초기창업 IR 발표", date: day(0), time: "14:00", ownerId: "mikyung" },
  { id: "e13", title: "백오피스 시안 검토", date: day(0), time: "16:00", ownerId: "jin" },
  { id: "e14", title: "C경로당 방문", date: day(1), ownerId: "mikyung" },
  { id: "e15", title: "월말 결산", date: day(4), ownerId: "mikyung" },
  { id: "e16", title: "주간 업무 회의", date: day(7), time: "10:00", ownerId: "all" },
  { id: "e17", title: "연말 성과 보고회", date: day(12), time: "15:00", ownerId: "all" },
];
