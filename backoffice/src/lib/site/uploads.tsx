"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * New images stay in the browser until saved, then get committed together with the post or impact data.
 * Photos are shrunk to 1600px wide JPG so the repository stays light.
 */
export type PendingUpload = { path: string; base64: string; dataUrl: string };

const MAX_WIDTH = 1600;

// "Winter Foot.png" → "winter-foot"; names without latin letters or digits get a random one.
function baseName(file: File) {
  const name = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return name || Math.random().toString(36).slice(2, 8);
}

async function prepareImage(file: File): Promise<PendingUpload> {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  // A short suffix keeps two uploads of the same file name on the same day from overwriting each other.
  const suffix = Math.random().toString(36).slice(2, 6);
  const dataUrl = await toJpeg(file);
  return { path: `public/uploads/${stamp}-${baseName(file)}-${suffix}.jpg`, base64: dataUrl.split(",")[1], dataUrl };
}

// Shrinks to at most 1600px wide and re-encodes as JPG (transparent areas become white).
async function toJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
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
  /** Takes a file and returns its site path (/uploads/...). */
  add: (file: File) => Promise<string>;
  /** Address to show: unsaved images use their in-browser data URL */
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

  return <UploadsContext value={value}>{children}</UploadsContext>;
}

export function useUploads() {
  const ctx = useContext(UploadsContext);
  if (!ctx) throw new Error("useUploads must be used inside UploadsProvider");
  return ctx;
}
