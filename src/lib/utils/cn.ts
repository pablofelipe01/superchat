import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 🌿 Utility function to merge Tailwind CSS classes naturally
 * Like nature combines elements, this function harmonizes class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 