import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Institutional Fuzzy Search (Sub-sequence matching)
 * Allows for partial matches, typos, and shorthand (e.g. "Krtk" matches "Karthik")
 */
export function fuzzySearch(query: string, text: string | null | undefined): boolean {
  if (!query) return true;
  if (!text) return false;
  
  const q = query.toLowerCase().replace(/\s/g, '');
  const t = text.toLowerCase().replace(/\s/g, '');
  
  // High-priority: Literal inclusion
  if (t.includes(q)) return true;
  
  // Heuristic: Sub-sequence matching
  let qIdx = 0;
  let tIdx = 0;
  
  while (qIdx < q.length && tIdx < t.length) {
    if (q[qIdx] === t[tIdx]) {
      qIdx++;
    }
    tIdx++;
  }
  
  return qIdx === q.length;
}
