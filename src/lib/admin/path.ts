/** "sections.projects" 같은 경로로 객체 값을 읽고, 바뀐 사본을 만듭니다. 빈 경로는 객체 자신입니다. */
export function getIn(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

export function setIn<T>(obj: T, path: string, value: unknown): T {
  if (!path) return value as T;
  const [head, ...rest] = path.split(".");
  const src = obj as Record<string, unknown>;
  return { ...src, [head]: setIn(src[head], rest.join("."), value) } as T;
}
