# AnyChange AI

[![CI](https://github.com/merlinvaldez/anyChangeAi/actions/workflows/ci.yml/badge.svg)](https://github.com/merlinvaldez/anyChangeAi/actions/workflows/ci.yml)

A web application for converting documents (PDF, images) to editable text using OCR technology, built with Next.js.

## 🚀 Quick Start

### 1. Environment Setup

**Important**: Before running the app, you need to set up your environment variables.

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
# (At minimum, you can use the default tesseract settings for local development)
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚙️ Environment Configuration

This project uses environment variables for configuration. Here's what you need to know:

### Required Files

- `.env.example` - Template showing all available environment variables
- `.env.local` - Your personal development environment (not committed to git)

### OCR Provider Setup

#### Option 1: Tesseract (Recommended for local development)

```bash
OCR_PROVIDER=tesseract
```

No additional setup required - Tesseract runs locally in your browser.

#### Option 2: Mistral OCR API

```bash
OCR_PROVIDER=mistral
MISTRAL_API_KEY=your_api_key_here
```

Requires signing up for a Mistral API account.

### Environment Variables Reference

| Variable               | Description              | Default                 | Required         |
| ---------------------- | ------------------------ | ----------------------- | ---------------- |
| `NEXT_PUBLIC_APP_NAME` | Application name         | "AnyChange AI"          | No               |
| `NEXT_PUBLIC_APP_URL`  | App URL                  | "http://localhost:3000" | No               |
| `API_SECRET_KEY`       | API authentication key   | -                       | Yes              |
| `OCR_PROVIDER`         | OCR service to use       | "tesseract"             | Yes              |
| `MISTRAL_API_KEY`      | Mistral API key          | -                       | If using Mistral |
| `MAX_FILE_SIZE`        | Max upload size in bytes | 10485760 (10MB)         | No               |
| `MAX_PAGES`            | Max pages per document   | 10                      | No               |
| `ALLOWED_FILE_TYPES`   | Allowed file extensions  | "pdf,jpg,jpeg,png"      | No               |
| `NODE_ENV`             | Environment mode         | "development"           | No               |
| `DEBUG_LOGGING`        | Enable debug logs        | true                    | No               |

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
├── lib/
│   └── env.ts            # Environment configuration
└── utils/                # Utility functions
```

## 🧪 Development

### Running Tests

```bash
npm test                  # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Code Quality

```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types
```

## 📝 Features

- **Document Upload**: Support for PDF, JPG, JPEG, PNG files up to 10MB
- **OCR Processing**: Convert images and PDFs to editable text
- **Text Editing**: Rich text editor for cleaning up OCR results
- **Export Options**: Download as TXT or DOCX files
- **Responsive Design**: Works on desktop and mobile devices

## 🔒 Security Notes

- Never commit `.env.local` files to version control
- Use strong, unique API keys for production
- Rotate API keys regularly
- Keep dependencies updated

## 🚀 Deployment

### Environment Variables for Production

When deploying, make sure to set these environment variables in your hosting platform:

1. Copy all variables from `.env.example`
2. Replace placeholder values with production secrets
3. Set `NODE_ENV=production`
4. Set `DEBUG_LOGGING=false` for production

### Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/merlinvaldez/anyChangeAi)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Next.js Learn Course](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/) - OCR library documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Set up your environment variables
4. Make your changes
5. Run tests (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request
