/**
 * Unit tests for Home page component
 * This file tests the main landing page of our application
 */

import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home Page', () => {
  // Test 1: Check if main heading renders
  test('renders main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /convert documents to editable text/i,
    });
    expect(heading).toBeInTheDocument();
  });

  // Test 2: Check if app title is in header
  test('renders app title in header', () => {
    render(<Home />);
    const appTitle = screen.getByRole('heading', {
      name: /anychange ai/i,
    });
    expect(appTitle).toBeInTheDocument();
  });

  // Test 3: Check if all workflow steps are present
  test('renders all workflow steps', () => {
    render(<Home />);

    // Check for all four workflow steps
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('OCR Extract')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  // Test 4: Check if upload area is present
  test('renders upload area', () => {
    render(<Home />);
    const uploadText = screen.getByText(/drop your document here/i);
    expect(uploadText).toBeInTheDocument();
  });

  // Test 5: Check if file format information is displayed
  test('displays supported file formats', () => {
    render(<Home />);
    const formatInfo = screen.getByText(/supports pdf, jpg, png/i);
    expect(formatInfo).toBeInTheDocument();
  });

  // Test 6: Check if navigation links are present
  test('renders navigation links', () => {
    render(<Home />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  // Test 7: Check if footer is present
  test('renders footer with copyright', () => {
    render(<Home />);
    const copyright = screen.getByText(/© 2025 anychange ai/i);
    expect(copyright).toBeInTheDocument();
  });

  // Test 8: Check if description text is present
  test('renders description text', () => {
    render(<Home />);
    const description = screen.getByText(/upload any pdf, image, or scan/i);
    expect(description).toBeInTheDocument();
  });
});
