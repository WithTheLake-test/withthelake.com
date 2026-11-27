"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { outlineButton } from "@/components/Button";
import FollowUps from "@/components/work/FollowUps";
import GovProject from "@/components/work/GovProjects";
import ImportantTimeline from "@/components/work/ImportantTimeline";
import Sales from "@/components/work/Sales";
import { Section, Unavailable, cardClass } from "@/components/work/ui";
import WeeklyGoals from "@/components/work/WeeklyGoals";
import { TODAY, endOfWeek, monthDay, startOfWeek } from "@/lib/date";
import { useUser } from "@/lib/user";
import { useWorkFeed } from "@/lib/work/feed";
import {
  blockedContents,
  dueOf,
  dueWithin,
  eventsOn,
  followUps,
  governmentProjects,
  importantSoon,
  NO_OWNER,
  isPublished,
  needsPhoto,
  overdueTasks,
  tasksOn,
  visible,
  type Overdue,
} from "@/lib/work/rules";
import type { CalendarEvent, WorkTask } from "@/lib/work/types";

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const weekday = (day: string) => WEEKDAY[new Date(`${day}T00:00:00Z`).getUTCDay()];

const SOURCE_STYLE: Record<CalendarEvent["source"], string> = {
  company: "bg-blue-50 text-blue-700",
  ceo: "bg-orange-50 text-orange-700",
  leave: "bg-soft text-muted",
};

type PersonCount = { name: string; count: number };

function StatCard({ label, value, sub, href, alert = false, people }: { label: string; value: ReactNode; sub: ReactNode; href: string; alert?: boolean; people?: PersonCount[] }) {
  return (
    <Link href={href} className={`${cardClass} block hover:border-faint ${alert ? "border-red-200 bg-red-50" : ""}`}>
      <p className="font-semibold">{label}</p>
      <p className={`mt-2 text-[40px] leading-none font-bold ${alert ? "text-danger" : ""}`}>{value}</p>
      <p className={`mt-3 truncate text-sm ${alert ? "text-danger" : "text-muted"}`}>{sub}</p>
      {people && (
        <p className={`mt-2.5 flex flex-wrap gap-x-1.5 border-t pt-2.5 text-[13px] text-muted ${alert ? "border-red-200" : "border-line"}`}>
          {people.map(({ name, count }, i) => (
            <span key={name}>
              {i > 0 && "· "}
              {name} <b className={alert && count ? "text-danger" : "text-ink"}>{count}</b>
            </span>
          ))}
        </p>
      )}
    </Link>
  );
}

const truncate = (text: string, max = 10) => (text.length > max ? `${text.slice(0, max)}…` : text);

export default function HomeView() {
  const { me, members } = useUser();
  const { feed } = useWorkFeed();
  const team = !me;

  if (!feed) return <p className="py-20 text-center text-muted">노션·구글 캘린더를 불러오는 중</p>;

  const notion = feed.notion;
  const events = feed.calendar?.events ?? [];
  const allTasks = (notion?.tasks ?? []).filter(visible);
  const byId = new Map(allTasks.map((t) => [t.id, t]));
  // "전체" sees the whole team; a chosen member sees only their own tasks.
  const tasks = me ? allTasks.filter((t) => t.assignees.includes(me.name)) : allTasks;
  const projectOf = (t: WorkTask) => (t.parentIds.map((id) => byId.get(id)?.title).find(Boolean) ?? t.category ?? "");

  const overdue = overdueTasks(tasks, TODAY);
  const soon = dueWithin(tasks, TODAY, 7);
  const perDay = soon.reduce<Record<string, number>>((acc, t) => ({ ...acc, [dueOf(t)!]: (acc[dueOf(t)!] ?? 0) + 1 }), {});
  const busiest = Object.entries(perDay).sort((a, b) => b[1] - a[1])[0];
  const todayEvents = eventsOn(events, TODAY);
  const todayTasks = tasksOn(tasks, TODAY);
  const nextTimed = [...todayEvents.filter((e) => e.time), ...todayTasks.filter((t) => t.time)].sort((a, b) => a.time!.localeCompare(b.time!))[0];
  const contents = notion?.contents ?? [];
  const blocked = blockedContents(contents, TODAY);
  const weekContents = contents.filter((c) => !isPublished(c) && c.date && c.date >= startOfWeek(TODAY) && c.date <= endOfWeek(TODAY));
  const gov = governmentProjects(allTasks);
  // Per-person counts under the cards when viewing everyone; a shared task counts for each assignee.
  const perPerson = (list: WorkTask[]): PersonCount[] | undefined => {
    if (!team || !notion) return undefined;
    const counts = members.map((m) => ({ name: m.name, count: list.filter((t) => t.assignees.includes(m.name)).length }));
    const noOwner = list.filter((t) => t.assignees.length === 0).length;
    return noOwner ? [...counts, { name: NO_OWNER, count: noOwner }] : counts;
  };

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[26px] font-bold">
          {monthDay(TODAY)} {weekday(TODAY)}요일
        </h1>
        <p className="mt-1.5 text-base text-muted">{me ? `${me.name} 님 업무 기준` : "팀 전체 기준"}</p>
      </div>

      <Section title="1 · 오늘 상태" note="숫자를 누르면 해당 화면으로 이동합니다">
        {!notion && <div className="mb-3"><Unavailable source="노션" /></div>}
        {!feed.calendar && <div className="mb-3"><Unavailable source="구글 캘린더" /></div>}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="마감 지난 업무"
            value={notion ? overdue.length : "–"}
            sub={overdue[0] ? `가장 오래: ${truncate(overdue[0].task.title)} ${overdue[0].days}일` : "없음"}
            href="/progress"
            alert={overdue.length > 0}
            people={perPerson(overdue.map((o) => o.task))}
          />
          <StatCard
            label="7일 안 마감"
            value={notion ? soon.length : "–"}
            sub={busiest && busiest[1] > 1 ? `${Number(busiest[0].slice(8))}일(${weekday(busiest[0])})에 ${busiest[1]}건 몰림` : soon[0] ? `${monthDay(dueOf(soon[0])!)} ${truncate(soon[0].title)}` : "없음"}
            href="/calendar"
            people={perPerson(soon)}
          />
          <StatCard
            label="오늘 일정"
            value={notion || feed.calendar ? todayEvents.length + todayTasks.length : "–"}
            sub={nextTimed ? `${nextTimed.time} ${truncate(nextTimed.title)}` : todayEvents.length + todayTasks.length ? "종일 일정" : "없음"}
            href="/calendar"
          />
          <StatCard label="발행 막힌 콘텐츠" value={notion ? blocked.total : "–"} sub={`예정일 지남 ${blocked.late} · 날짜·사진 없음 ${blocked.notReady.length}`} href="/calendar" />
        </div>
      </Section>

      <Section title="2 · 2주 안 중요 일정" note="중요도 높음 · 마감 D-14~D-day">
        {notion ? <ImportantTimeline tasks={importantSoon(tasks, TODAY)} category={(t) => t.category ?? ""} today={TODAY} /> : <Unavailable source="노션" />}
      </Section>

      <Section title="3 · 이번 주 목표와 팔로업">
        <div className="grid grid-cols-2 items-start gap-4">
          <WeeklyGoals today={TODAY} me={me?.name} />
          {notion ? (
            <FollowUps groups={followUps(overdue).filter((g) => !me || g.name === me.name)} project={(o: Overdue) => (o.stale ? "프로젝트 · 마감일 없음" : projectOf(o.task))} />
          ) : (
            <Unavailable source="노션" />
          )}
        </div>
      </Section>

      <Section title="4 · 오늘과 이번 주 흐름">
        <div className="grid grid-cols-3 items-start gap-4">
          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">오늘 일정</h3>
              <Link href="/calendar" className={`${outlineButton} h-9`}>
                캘린더 →
              </Link>
            </div>
            {!feed.calendar && <p className="mb-2 text-sm text-danger">구글 캘린더를 불러오지 못했습니다.</p>}
            {feed.calendar && todayEvents.length + todayTasks.length === 0 && <p className="text-muted">오늘 일정이 없습니다.</p>}
            <ul className="space-y-2">
              {todayEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span className={`w-16 shrink-0 rounded-md px-2 py-0.5 text-center text-sm ${SOURCE_STYLE[e.source]}`}>{e.time ?? "종일"}</span>
                  <span className="truncate">{e.title}</span>
                </li>
              ))}
              {todayTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 rounded-md border border-line px-2 py-0.5 text-center text-sm">{t.time ?? "종일"}</span>
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">콘텐츠 · 준비 안 된 것</h3>
              <Link href="/calendar?only=content" className={`${outlineButton} h-9`}>
                콘텐츠 →
              </Link>
            </div>
            {!notion ? (
              <p className="text-sm text-danger">노션을 불러오지 못했습니다.</p>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted">
                  {weekContents.length ? `이번 주 발행 예정 ${weekContents.length}건` : "이번 주 발행일이 잡힌 콘텐츠가 없습니다"}
                </p>
                {blocked.notReady.length === 0 && <p className="text-muted">준비 안 된 콘텐츠가 없습니다.</p>}
                <ul className="space-y-2">
                  {blocked.notReady.slice(0, 4).map((c) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${c.category ? "bg-orange-50 text-orange-700" : "border border-line text-muted"}`}>{c.category ?? "발행처 미정"}</span>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate hover:underline">
                        {c.title}
                      </a>
                      <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600">{needsPhoto(c) ? "사진 필요" : "발행일 없음"}</span>
                    </li>
                  ))}
                </ul>
                {blocked.notReady.length > 4 && <p className="mt-2 text-sm text-muted">외 {blocked.notReady.length - 4}건</p>}
              </>
            )}
          </div>

          <div className={cardClass}>
            <h3 className="mb-3 text-base font-bold">이번 달 결제 예정</h3>
            <p className="flex justify-between">
              <span>Google Workspace</span>
              <span className="text-muted">[결제일] · [금액]</span>
            </p>
          </div>
        </div>
      </Section>

      <Section title={`5 · 정부지원사업 진행중 ${gov.projects.length}`} note={`마감 빠른 순${gov.onHold ? ` · 보류 ${gov.onHold}건 제외` : ""}`}>
        {notion ? (
          gov.projects.length ? (
            <div className="grid grid-cols-3 items-start gap-4">
              {gov.projects.map((item) => (
                <GovProject key={item.project.id} item={item} today={TODAY} />
              ))}
            </div>
          ) : (
            <p className="text-muted">진행 중인 정부지원사업이 없습니다.</p>
          )
        ) : (
          <Unavailable source="노션" />
        )}
      </Section>

      {notion ? <Sales items={notion.sales} today={TODAY} /> : <Section title="6 · 영업 활동"><Unavailable source="노션" /></Section>}
    </>
  );
}

