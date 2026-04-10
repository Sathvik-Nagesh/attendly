import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fuzzySearch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  
  if (t.includes(q)) return true;
  
  // Split query into words and check if all words exist in targets
  const words = q.split(/\s+/);
  return words.every(word => t.includes(word));
}
