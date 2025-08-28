/**
 * Simple utility functions for our application
 */

/**
 * Adds two numbers together
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function addNumbers(a: number, b: number): number {
  return a + b; // Fixed: Back to addition!
}

/**
 * Checks if a person is old enough to vote (18 or older)
 * @param age - Person's age
 * @returns true if person can vote, false otherwise
 */
export function canVote(age: number): boolean {
  return age >= 18;
}

/**
 * Calculates a tip amount
 * @param billAmount - The bill amount
 * @param tipPercentage - The tip percentage (as a decimal, e.g., 0.15 for 15%)
 * @returns The tip amount
 */
export function calculateTip(
  billAmount: number,
  tipPercentage: number
): number {
  return billAmount * tipPercentage;
}
