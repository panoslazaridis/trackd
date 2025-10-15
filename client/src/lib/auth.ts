/**
 * Temporary auth helper until proper authentication is implemented
 * TODO: Replace with actual auth context/session management
 */

// Development user ID - matches the test user in the database
export const DEV_USER_ID = "test-user-plumber";

/**
 * Get the current authenticated user ID
 * In development, this returns a hardcoded test user ID
 * In production, this will come from the auth session/context
 */
export function getCurrentUserId(): string {
  // TODO: Replace with actual auth session/context
  return DEV_USER_ID;
}
