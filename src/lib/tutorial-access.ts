// The tutorial shows only example data, so a shared PIN is enough for readers without an account.
const tutorialPin = "0001";

export const tutorialCookie = "kp-tutorial-access";
export const tutorialCookieValue = "granted";

export function isTutorialPin(value: unknown): boolean {
  return value === tutorialPin;
}
