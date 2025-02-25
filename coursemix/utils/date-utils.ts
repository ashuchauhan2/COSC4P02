import { Term, TermInfo } from '@/types';

/**
 * Gets the current date in Eastern Time zone (Toronto/ET)
 * This ensures consistent date handling across all users regardless of their location
 */
export function getCurrentDateET() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }));
}

/**
 * Converts any date to Eastern Time zone for consistent comparisons
 * @param date The date to convert to Eastern Time
 */
export function toEasternTime(date: Date) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
}

/**
 * Formats a date string for display (e.g., "Jan 1, 2025")
 * @param date Date object or string to format
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats a time for display (e.g., "9:00 AM")
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 */
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, '0');
  
  return `${displayHour}:${displayMinute} ${period}`;
}

export function getCurrentTerm(): TermInfo {
  // Use Eastern Time to determine current term
  const now = getCurrentDateET();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  let term: Term;
  let year = currentYear;

  // Determine the current term based on the month
  if (currentMonth >= 1 && currentMonth <= 4) {
    term = 'WINTER';
  } else if (currentMonth >= 5 && currentMonth <= 6) {
    term = 'SPRING';
  } else if (currentMonth >= 7 && currentMonth <= 8) {
    term = 'SUMMER';
  } else {
    term = 'FALL';
  }

  // Adjust year for winter term (which spans across years)
  if (term === 'WINTER') {
    // For academic purposes, Winter 2025 starts in January 2025
    // No adjustment needed
  }

  // Format the display name
  const displayName = `${term} ${year}`;

  return {
    term,
    year,
    displayName
  };
} 