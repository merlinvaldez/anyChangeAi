import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../FileUpload';

// Mock the useFileLimits hook
jest.mock('../../hooks/useFileLimits', () => ({
  useFileLimits: () => ({
    maxSize: 50 * 1024 * 1024, // 50MB
    maxPages: 0, // No page limit
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'], // File extensions from environment
  }),
}));

// Mock File constructor for testing
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  });
  return file;
};

describe('FileUpload Component', () => {
  const mockOnFileSelect = jest.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
  });

  describe('File Type Validation', () => {
    test('accepts valid file types (PDF, JPG, JPEG, PNG)', async () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const validFiles = [
        createMockFile('document.pdf', 1024 * 1024, 'application/pdf'), // 1MB PDF
        createMockFile('image.jpg', 1024 * 1024, 'image/jpeg'), // 1MB JPG
        createMockFile('photo.png', 1024 * 1024, 'image/png'), // 1MB PNG
      ];

      // We'll test drag and drop functionality
      const dropZone = screen
        .getByText(/Drop your document here/i)
        .closest('div');

      for (const file of validFiles) {
        const dataTransfer = {
          files: [file],
        };

        fireEvent.drop(dropZone!, { dataTransfer });

        await waitFor(() => {
          expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
        });

        mockOnFileSelect.mockClear();
      }
    });

    test('rejects invalid file types', async () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const invalidFile = createMockFile(
        'document.txt',
        1024 * 1024,
        'text/plain'
      );
      const dropZone = screen
        .getByText(/Drop your document here/i)
        .closest('div');

      const dataTransfer = {
        files: [invalidFile],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(
          screen.getByText(/File type not supported/i)
        ).toBeInTheDocument();
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('File Size Validation', () => {
    test('accepts files under 50MB limit', async () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      // Create a file just under 50MB (49MB)
      const validFile = createMockFile(
        'large-file.pdf',
        49 * 1024 * 1024,
        'application/pdf'
      );
      const dropZone = screen
        .getByText(/Drop your document here/i)
        .closest('div');

      const dataTransfer = {
        files: [validFile],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith([validFile]);
      });
    });

    test('rejects files over 50MB limit', async () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      // Create a file over 50MB (51MB)
      const oversizedFile = createMockFile(
        'huge-file.pdf',
        51 * 1024 * 1024,
        'application/pdf'
      );
      const dropZone = screen
        .getByText(/Drop your document here/i)
        .closest('div');

      const dataTransfer = {
        files: [oversizedFile],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(
          screen.getByText(/File size exceeds 50MB limit/i)
        ).toBeInTheDocument();
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('Multiple File Validation', () => {
    test('respects maxFiles limit', async () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} maxFiles={2} />);

      const files = [
        createMockFile('file1.pdf', 1024 * 1024, 'application/pdf'),
        createMockFile('file2.pdf', 1024 * 1024, 'application/pdf'),
        createMockFile('file3.pdf', 1024 * 1024, 'application/pdf'), // This should cause an error
      ];

      const dropZone = screen
        .getByText(/Drop your document here/i)
        .closest('div');
      const dataTransfer = { files };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(
          screen.getByText(/Maximum 2 files allowed/i)
        ).toBeInTheDocument();
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    test('shows multiple errors when multiple files are invalid', async () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const invalidFiles = [
        createMockFile('too-big.pdf', 60 * 1024 * 1024, 'application/pdf'), // Too big
        createMockFile('wrong-type.txt', 1024 * 1024, 'text/plain'), // Wrong type
      ];

      const dropZone = screen
        .getByText(/Drop your document here/i)
        .closest('div');
      const dataTransfer = { files: invalidFiles };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByText(/Upload Errors/i)).toBeInTheDocument();
        expect(
          screen.getByText(/File size exceeds 50MB limit/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/File type not supported/i)
        ).toBeInTheDocument();
      });
    });

    test('clears errors when valid files are uploaded', async () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const dropZone = screen
        .getByText(/Drop your document here/i)
        .closest('div');

      // First, upload an invalid file
      const invalidFile = createMockFile(
        'invalid.txt',
        1024 * 1024,
        'text/plain'
      );
      fireEvent.drop(dropZone!, { dataTransfer: { files: [invalidFile] } });

      await waitFor(() => {
        expect(
          screen.getByText(/File type not supported/i)
        ).toBeInTheDocument();
      });

      // Then upload a valid file
      const validFile = createMockFile(
        'valid.pdf',
        1024 * 1024,
        'application/pdf'
      );
      fireEvent.drop(dropZone!, { dataTransfer: { files: [validFile] } });

      await waitFor(() => {
        expect(
          screen.queryByText(/File type not supported/i)
        ).not.toBeInTheDocument();
        expect(mockOnFileSelect).toHaveBeenCalledWith([validFile]);
      });
    });
  });
});
