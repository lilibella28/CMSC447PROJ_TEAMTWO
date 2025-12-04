/**
 * Date Utility Functions
 * Handles date validation, parsing, and formatting with proper null handling
 * Prevents invalid dates from being converted to Unix epoch (Dec 31, 1969)
 */

/**
 * Checks if a date string is valid and not an epoch date
 * @param dateString - Date string to validate
 * @returns boolean - true if valid, false if invalid or epoch
 */
export function isValidDate(dateString: string | null | undefined): boolean {
    if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
      return false;
    }
  
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return false;
    }
  
    // Check for Unix epoch dates (1969-12-31, 1970-01-01, etc.)
    const year = date.getFullYear();
    if (year < 1971) {
      return false;
    }
  
    return true;
  }
  
  /**
   * Formats a date string with proper validation
   * Returns "— Missing —" for invalid or missing dates
   * @param dateString - Date string to format
   * @param options - Intl.DateTimeFormatOptions for formatting
   * @returns Formatted date string or "— Missing —"
   */
  export function formatDate(
    dateString: string | null | undefined,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  ): string {
    if (!isValidDate(dateString)) {
      return '— Missing —';
    }
  
    try {
      return new Date(dateString!).toLocaleDateString('en-US', options);
    } catch (error) {
      return '— Missing —';
    }
  }
  
  /**
   * Formats a date string for display in forms (YYYY-MM-DD)
   * Returns empty string for invalid or missing dates
   * @param dateString - Date string to format
   * @returns Formatted date string (YYYY-MM-DD) or empty string
   */
  export function formatDateForInput(dateString: string | null | undefined): string {
    if (!isValidDate(dateString)) {
      return '';
    }
  
    try {
      const date = new Date(dateString!);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  }
  
  /**
   * Parses a date string and returns null for invalid dates
   * Prevents automatic conversion to epoch dates
   * @param dateString - Date string to parse
   * @returns ISO date string or null
   */
  export function parseDate(dateString: string | null | undefined): string | null {
    if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
      return null;
    }
  
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
  
    // Check for Unix epoch dates
    const year = date.getFullYear();
    if (year < 1971) {
      return null;
    }
  
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Checks if a date is missing and needs attention
   * @param dateString - Date string to check
   * @returns boolean - true if missing
   */
  export function isMissingDate(dateString: string | null | undefined): boolean {
    return !isValidDate(dateString);
  }
  
  /**
   * Gets a tooltip message for missing dates
   * @returns string - Tooltip message
   */
  export function getMissingDateTooltip(): string {
    return 'This date was missing or invalid during import and needs updating.';
  }
  
  /**
   * Formats a date for display with fallback
   * @param dateString - Date string to format
   * @param fallback - Fallback text if date is invalid
   * @returns Formatted date or fallback text
   */
  export function formatDateWithFallback(
    dateString: string | null | undefined,
    fallback: string = '—'
  ): string {
    if (!isValidDate(dateString)) {
      return fallback;
    }
  
    try {
      return new Date(dateString!).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return fallback;
    }
  }