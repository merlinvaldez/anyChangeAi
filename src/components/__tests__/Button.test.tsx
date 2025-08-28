/**
 * Unit tests for Button component
 * This file tests React component rendering and user interactions
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

// Test suite for Button component
describe('Button', () => {
  // Test 1: Check if button renders with text
  test('renders button with children text', () => {
    // Arrange: Render the button component
    render(<Button>Click me</Button>);

    // Act: Find the button element
    const buttonElement = screen.getByRole('button', { name: /click me/i });

    // Assert: Check if button is in the document
    expect(buttonElement).toBeInTheDocument();
  });

  // Test 2: Check if onClick handler is called
  test('calls onClick when button is clicked', () => {
    // Arrange: Create a mock function to track calls
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);

    // Act: Find and click the button
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(buttonElement);

    // Assert: Check if the onClick function was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Test 3: Check disabled state
  test('does not call onClick when button is disabled', () => {
    // Arrange: Create a disabled button with onClick
    const mockOnClick = jest.fn();
    render(
      <Button onClick={mockOnClick} disabled>
        Disabled Button
      </Button>
    );

    // Act: Find and try to click the disabled button
    const buttonElement = screen.getByRole('button', {
      name: /disabled button/i,
    });
    fireEvent.click(buttonElement);

    // Assert: Check that onClick was NOT called and button is disabled
    expect(mockOnClick).not.toHaveBeenCalled();
    expect(buttonElement).toBeDisabled();
  });

  // Test 4: Check different variants
  test('applies primary variant classes by default', () => {
    render(<Button>Primary Button</Button>);
    const buttonElement = screen.getByTestId('custom-button');

    // Check if primary classes are applied
    expect(buttonElement).toHaveClass('bg-blue-600', 'text-white');
  });

  test('applies secondary variant classes when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const buttonElement = screen.getByTestId('custom-button');

    // Check if secondary classes are applied
    expect(buttonElement).toHaveClass('bg-gray-200', 'text-gray-800');
  });
});
