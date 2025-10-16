/**
 * Auth helper - gets current user ID from localStorage
 */
export function getCurrentUserId(): string {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    throw new Error("No user logged in");
  }
  return userId;
}
