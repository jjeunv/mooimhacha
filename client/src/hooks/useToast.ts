import { useCallback, useRef } from "react";

export function useToast() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    const t = document.getElementById("toast");
    if (!t) return;
    t.querySelector("span")!.textContent = msg;
    t.classList.add("show");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => t.classList.remove("show"), 2400);
  }, []);

  return { showToast };
}
