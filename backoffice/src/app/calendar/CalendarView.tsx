"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { outlineButton } from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import { cardClass, Unavailable } from "@/components/work/ui";
import { TODAY, WEEKDAY_HEADERS, addDays, startOfWeek } from "@/lib/date";
import { useUser } from "@/lib/user";
import { calendarDay, findAlerts } from "@/lib/work/calendar";
import { useWorkFeed } from "@/lib/work/feed";
import { DONE, isProject, isPublished, visible } from "@/lib/work/rules";
import type { CalendarEvent, ContentItem, WorkTask } from "@/lib/work/types";

type Source = "company" | "ceo" | "leave" | "task" | "content";

const SOURCES: { key: Source; label: string }[] = [
  { key: "company", label: "회사 일정" },
  { key: "ceo", label: "대표님 일정" },
  { key: "leave", label: "연차·인사" },
  { key: "task", label: "노션 업무 마감" },
  { key: "content", label: "콘텐츠 발행" },
];
const ALL_ON: Record<Source, boolean> = { company: true, ceo: true, leave: true, task: true, content: true };
const STORAGE_KEY = "calendar-sources";
const CELL_LIMIT = 6;
// The calendar shows five weeks from the Monday of the chosen week: about a month ahead.
const WEEKS = 5;
const SPAN = WEEKS * 7;
const CRUNCH = 5;
const EVERYONE = "전체";

const EVENT_STYLE: Record<CalendarEvent["source"], string> = {
  company: "bg-blue-50 text-blue-700",
  ceo: "bg-orange-50 text-orange-700",
  leave: "bg-stone-200/70 font-medium text-ink",
};

const dayNumber = (day: string) => (day.endsWith("-01") ? `${Number(day.slice(5, 7))}/1` : String(Number(day.slice(8))));
const rangeLabel = (from: string, to: string) =>
  from.slice(0, 7) === to.slice(0, 7) ? `${Number(from.slice(5, 7))}월 ${Number(from.slice(8))}일 – ${Number(to.slice(8))}일` : `${Number(from.slice(5, 7))}월 ${Number(from.slice(8))}일 – ${Number(to.slice(5, 7))}월 ${Number(to.slice(8))}일`;
const short = (day: string) => `${Number(day.slice(5, 7))}/${Number(day.slice(8))}`;

function readSaved(): Record<Source, boolean> {
  try {
    return { ...ALL_ON, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return ALL_ON;
  }
}

function TaskChip({ task }: { task: WorkTask }) {
  const done = task.status === DONE;
  const day = calendarDay(task)!;
  const late = !done && day < TODAY;
  const project = isProject(task);
  const period = !project && task.end && task.start && task.start !== task.end ? `${short(task.start)}–${short(task.end)} ` : "";
  const style = done
    ? "text-muted line-through"
    : late
      ? "bg-red-50 text-danger"
      : `border border-line bg-white ${project ? "border-dashed" : ""}`;
  return (
    <a href={task.url} target="_blank" rel="noopener noreferrer" className={`block rounded-md px-1.5 py-1 text-xs leading-snug hover:underline ${style}`}>
      {late && "지남 · "}
      {project && "종료 · "}
      {period}
      {!project && task.time && `${task.time} `}
      {task.title}
      {!project && task.assignees.length > 0 && <span className="block text-[11px] opacity-70">{task.assignees.join("·")}</span>}
    </a>
  );
}

function EventChip({ event }: { event: CalendarEvent }) {
  return (
    <span className={`block rounded-md px-1.5 py-1 text-xs leading-snug ${EVENT_STYLE[event.source]}`}>
      {event.time && `${event.time} `}
      {event.title}
    </span>
  );
}

function ContentChip({ item }: { item: ContentItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-md border border-dashed border-purple-300 bg-purple-50 px-1.5 py-1 text-xs leading-snug text-purple-800 hover:underline ${isPublished(item) ? "line-through opacity-60" : ""}`}
    >
      {item.title}
    </a>
  );
}

export default function CalendarView() {
  const { members } = useUser();
  const { feed } = useWorkFeed();
  const params = useSearchParams();
  const router = useRouter();
  const onlyContent = params.get("only") === "content";
  const [saved, setSaved] = useState<Record<Source, boolean>>(ALL_ON);
  const [override, setOverride] = useState(onlyContent);
  const [start, setStart] = useState(startOfWeek(TODAY));
  const [person, setPerson] = useState(EVERYONE);

  // Saved choice is read after mount (localStorage does not exist during the static build).
  useEffect(() => {
    Promise.resolve(readSaved()).then(setSaved);
  }, []);

  const shown: Record<Source, boolean> = override ? { company: false, ceo: false, leave: false, task: false, content: true } : saved;

  const toggle = (key: Source) => {
    const next = { ...shown, [key]: !shown[key] };
    setSaved(next);
    setOverride(false);
    if (onlyContent) router.replace("/calendar");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const days = Array.from({ length: SPAN }, (_, i) => addDays(start, i));
  const last = days[SPAN - 1];
  const ceo = members.find((m) => m.role === "대표")?.name;

  const notion = feed?.notion;
  const calendar = feed?.calendar;
  const tasks = (notion?.tasks ?? []).filter(visible);
  const contents = notion?.contents ?? [];
  const events = calendar?.events ?? [];

  const mine = (names: string[]) => person === EVERYONE || names.includes(person);
  const eventFor = (e: CalendarEvent) =>
    e.source === "company" || person === EVERYONE || (e.source === "ceo" ? person === ceo : e.person === person);

  const viewTasks = tasks.filter((t) => mine(t.assignees));
  const itemsOn = (day: string) => {
    const out: { key: string; node: ReactNode }[] = [];
    if (shown.leave) for (const e of events) if (e.source === "leave" && e.date <= day && e.endDate >= day && eventFor(e)) out.push({ key: e.id, node: <EventChip event={e} /> });
    if (shown.ceo) for (const e of events) if (e.source === "ceo" && e.date <= day && e.endDate >= day && eventFor(e)) out.push({ key: e.id, node: <EventChip event={e} /> });
    if (shown.company) for (const e of events) if (e.source === "company" && e.date <= day && e.endDate >= day) out.push({ key: e.id, node: <EventChip event={e} /> });
    if (shown.task) for (const t of viewTasks) if (calendarDay(t) === day) out.push({ key: t.id, node: <TaskChip task={t} /> });
    if (shown.content) for (const c of contents) if (c.date === day) out.push({ key: c.id, node: <ContentChip item={c} /> });
    return out;
  };

  const openDue = (day: string) => viewTasks.filter((t) => t.status !== DONE && calendarDay(t) === day).length;
  const alerts = notion ? findAlerts(days, viewTasks, events.filter(eventFor), TODAY) : [];
  const contentsInView = contents.filter((c) => c.date && c.date >= start && c.date <= last).length;
  const undated = contents.filter((c) => !c.date && !isPublished(c)).length;

  return (
    <>
      <PageHeader title="캘린더" description="구글 캘린더 3개 + 노션 업무 마감 + 콘텐츠 발행을 한 달력에서 봅니다" />

      <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="일정 출처">
        {SOURCES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={shown[key]}
            onClick={() => toggle(key)}
            className={`h-10 rounded-full border px-3.5 text-sm ${shown[key] ? "border-ink bg-ink text-white" : "border-line bg-white text-muted line-through opacity-60"}`}
          >
            {label}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm">
          사람
          <select value={person} onChange={(e) => setPerson(e.target.value)} className="h-10 rounded-lg border border-line bg-white px-3">
            {[EVERYONE, ...members.map((m) => m.name)].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      {!notion && feed && <div className="mb-3"><Unavailable source="노션" /></div>}
      {!calendar && feed && <div className="mb-3"><Unavailable source="구글 캘린더" /></div>}

      <div className="flex flex-wrap items-start gap-5">
        <section className={`${cardClass} min-w-0 flex-[999_1_640px] overflow-x-auto !p-4`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">{rangeLabel(start, last)}</h2>
            <div className="flex gap-2">
              <button type="button" className={`${outlineButton} h-9`} onClick={() => setStart(addDays(start, -SPAN))}>
                ← 이전 {WEEKS}주
              </button>
              <button type="button" className={`${outlineButton} h-9`} onClick={() => setStart(startOfWeek(TODAY))}>
                오늘
              </button>
              <button type="button" className={`${outlineButton} h-9`} onClick={() => setStart(addDays(start, SPAN))}>
                다음 {WEEKS}주 →
              </button>
            </div>
          </div>

          {!feed ? (
            <p className="py-20 text-center text-muted">노션·구글 캘린더를 불러오는 중</p>
          ) : (
            <div className="grid min-w-[760px] grid-cols-7 gap-1.5">
              {WEEKDAY_HEADERS.map((d) => (
                <div key={d} className="px-1.5 text-xs font-bold text-muted">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const items = itemsOn(day);
                const due = shown.task ? openDue(day) : 0;
                const crunch = due >= CRUNCH;
                const limit = crunch ? CELL_LIMIT - 1 : CELL_LIMIT;
                const today = day === TODAY;
                return (
                  <div
                    key={day}
                    className={`flex min-h-[170px] flex-col gap-1 rounded-lg p-1.5 ${crunch ? "bg-red-50 outline outline-1 outline-red-200" : today ? "bg-white outline-2 outline-ink" : "bg-stone-50"}`}
                  >
                    <span className="flex items-center justify-between text-[13px] font-bold">
                      <span>
                        {dayNumber(day)}
                        {today && " · 오늘"}
                      </span>
                      {crunch && <span className="rounded-full bg-danger px-1.5 text-[11px] text-white">마감 {due}</span>}
                    </span>
                    {items.slice(0, limit).map((item) => (
                      <div key={item.key}>{item.node}</div>
                    ))}
                    {items.length > limit && <span className="text-xs text-muted">+{items.length - limit}건</span>}
                  </div>
                );
              })}
            </div>
          )}

          {notion && shown.content && contentsInView === 0 && undated > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-2 px-1 text-sm text-muted">
              콘텐츠는 발행일이 비어 있는 게 많아 이 기간에 표시된 게 없습니다
              <Link href="/" className={`${outlineButton} h-8`}>
                발행일 없는 콘텐츠 보기
              </Link>
            </p>
          )}
        </section>

        <aside className="min-w-0 flex-[1_1_280px]">
          <h2 className="mb-3 text-sm font-bold text-muted">자동으로 찾은 겹침·쏠림</h2>
          {!notion ? (
            <p className="text-sm text-muted">노션을 불러오지 못해 확인할 수 없습니다.</p>
          ) : alerts.length === 0 ? (
            <p className={`${cardClass} text-sm text-muted`}>이 기간에는 겹치거나 몰린 일정이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`${cardClass} ${a.kind === "마감 쏠림" ? "border-red-200" : ""}`}>
                  <span className={`text-xs font-bold ${a.kind === "마감 쏠림" ? "text-danger" : "text-orange-600"}`}>{a.kind}</span>
                  <h3 className="my-1 font-bold">{a.title}</h3>
                  <span className="text-sm text-muted">{a.detail}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
