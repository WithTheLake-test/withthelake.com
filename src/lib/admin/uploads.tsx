"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * 새로 올린 이미지는 저장 전까지 브라우저에만 보관하고, 저장할 때 글·성과 내용과 함께 커밋합니다.
 * 큰 사진은 긴 변 2000px 로 줄여서 저장소가 무거워지지 않게 합니다.
 */
export type PendingUpload = { path: string; base64: string; dataUrl: string };

const MAX_SIDE = 2000;

async function prepareImage(file: File): Promise<PendingUpload> {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const id = Math.random().toString(36).slice(2, 8);
  const keepOriginal = file.type === "image/gif";
  const dataUrl = keepOriginal ? await readAsDataUrl(file) : await resize(file);
  const ext = keepOriginal ? "gif" : "jpg";
  return { path: `public/uploads/${stamp}-${id}.${ext}`, base64: dataUrl.split(",")[1], dataUrl };
}

function readAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

async function resize(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

type UploadsApi = {
  /** 파일을 받아 사이트 경로(/uploads/...)를 돌려줍니다. */
  add: (file: File) => Promise<string>;
  /** 화면에 보여 줄 주소: 저장 전 이미지는 브라우저 안의 데이터 주소 */
  resolve: (src: string) => string;
  list: () => { path: string; base64: string }[];
  clear: () => void;
};

const UploadsContext = createContext<UploadsApi | null>(null);

export function UploadsProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Record<string, PendingUpload>>({});

  const add = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있습니다.");
    const upload = await prepareImage(file);
    const src = upload.path.replace(/^public/, "");
    setPending((p) => ({ ...p, [src]: upload }));
    return src;
  }, []);

  const value = useMemo<UploadsApi>(
    () => ({
      add,
      resolve: (src) => pending[src]?.dataUrl ?? src,
      list: () => Object.values(pending).map(({ path, base64 }) => ({ path, base64 })),
      clear: () => setPending({}),
    }),
    [add, pending],
  );

  return <UploadsContext.Provider value={value}>{children}</UploadsContext.Provider>;
}

export function useUploads() {
  const ctx = useContext(UploadsContext);
  if (!ctx) throw new Error("UploadsProvider 안에서 사용해 주세요.");
  return ctx;
}
