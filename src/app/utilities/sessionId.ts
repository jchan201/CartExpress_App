/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create session ID
 * Session ID is used for cart and order tracking for guest users
 */
export function getOrCreateSessionId(): string {
  const SESSION_ID_KEY = "cartexpress_sessionId";
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear session ID (e.g., on logout)
 */
export function clearSessionId(): void {
  const SESSION_ID_KEY = "cartexpress_sessionId";
  localStorage.removeItem(SESSION_ID_KEY);
}

/**
 * Get current session ID without creating one if it doesn't exist
 */
export function getSessionId(): string | null {
  const SESSION_ID_KEY = "cartexpress_sessionId";
  return localStorage.getItem(SESSION_ID_KEY);
}
