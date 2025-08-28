/**
 * Unit tests for math utility functions
 * This file tests the functions in ../math.ts
 */

import { addNumbers, canVote, calculateTip } from '../math';

// Test suite for the addNumbers function
describe('addNumbers', () => {
  // Individual test case
  test('should add two positive numbers correctly', () => {
    // Arrange: Set up the test data
    const a = 2;
    const b = 3;
    const expected = 5;

    // Act: Call the function we're testing
    const result = addNumbers(a, b);

    // Assert: Check if the result matches what we expected
    expect(result).toBe(expected);
  });

  test('should add negative numbers correctly', () => {
    const result = addNumbers(-1, -2);
    expect(result).toBe(-3);
  });

  test('should add zero correctly', () => {
    const result = addNumbers(5, 0);
    expect(result).toBe(5);
  });
});

// Test suite for the canVote function
describe('canVote', () => {
  test('should return true for age 18', () => {
    const result = canVote(18);
    expect(result).toBe(true);
  });

  test('should return true for age over 18', () => {
    const result = canVote(25);
    expect(result).toBe(true);
  });

  test('should return false for age under 18', () => {
    const result = canVote(17);
    expect(result).toBe(false);
  });
});

// Test suite for calculateTip function
describe('calculateTip', () => {
  test('should calculate 15% tip correctly', () => {
    const billAmount = 100;
    const tipPercentage = 0.15; // 15%
    const result = calculateTip(billAmount, tipPercentage);
    expect(result).toBe(15);
  });

  test('should calculate 20% tip correctly', () => {
    const result = calculateTip(50, 0.2);
    expect(result).toBe(10);
  });

  test('should handle zero tip', () => {
    const result = calculateTip(100, 0);
    expect(result).toBe(0);
  });
});
