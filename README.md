# Beskriva - AI Content Creation Studio

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-blue" alt="React 18.x">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript 5.x">
  <img src="https://img.shields.io/badge/Vite-5.x-green" alt="Vite 5.x">
  <img src="https://img.shields.io/badge/PWA-Ready-orange" alt="PWA Ready">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</p>

**Beskriva** is an advanced Progressive Web App (PWA) that provides a unified interface for AI-powered content creation. Built with React, TypeScript, and modern web technologies, it offers seamless integration with Lemonfox.ai APIs for Speech-to-Text, Text-to-Speech, Chat, and Image Generation capabilities.

## ✨ Key Features

### 🎯 Core AI Services
- **Chat Interface** - Conversational AI powered by Llama models
- **Speech-to-Text** - Whisper-based transcription with 100+ languages
- **Text-to-Speech** - Natural voice synthesis with 50+ voices
- **Image Generation** - Stable Diffusion XL for high-quality images

### 📄 Advanced Document Processing
- **PDF Upload & Processing** - Client-side text extraction using PDF.js
- **Document Analysis** - AI-powered content summarization and insights
- **Multi-step Workflows** - Research → Summary → Podcast → Audio → Images

### 🎙️ Content Creation Pipeline
- **Multi-Speaker Podcasts** - Generate scripts with multiple speakers
- **Audio Processing** - Advanced TTS with speaker identification
- **Content-Aligned Images** - Generate images that match your content themes
- **Workflow Templates** - Pre-built processes for common use cases

### 🔧 Technical Excellence
- **Offline-First** - Service worker with background sync
- **Cross-Platform** - PWA, mobile apps (Capacitor), desktop (Tauri)
- **Type-Safe** - Full TypeScript implementation with strict mode
- **Responsive Design** - Mobile-first UI with dark/light themes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Lemonfox.ai API key ([Get one here](https://lemonfox.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/beskriva.git
cd beskriva

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Configuration

1. Open the app in your browser
2. Navigate to the **Settings** tab
3. Enter your Lemonfox.ai API key
4. Configure other preferences as needed

## 🏗️ Project Structure

```
beskriva/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and stores
│   │   └── pages/         # Page components
│   └── public/            # Static assets and service worker
├── server/                # Express.js backend
├── shared/                # Shared types and schemas
└── src-tauri/            # Tauri desktop app configuration
```

## 📋 Features in Detail

### Chat Interface
- **Conversational AI** with streaming responses
- **Document attachment** for context-aware conversations
- **Command system** (`/stt`, `/tts`, `/image`, `/pdf`)
- **Message history** with export capabilities

### Speech-to-Text
- **File upload** and live recording
- **Language detection** and manual selection
- **Speaker diarization** for multi-speaker content
- **Multiple formats** (JSON, text, SRT, VTT)

### Text-to-Speech
- **Voice selection** from 50+ natural voices
- **Speed control** (0.5x - 4x)
- **Multi-speaker podcasts** with script parsing
- **Audio format options** (MP3, WAV, OGG)

### Image Generation
- **Prompt-based generation** with negative prompts
- **Content-aligned images** matching document themes
- **Podcast cover generator** with 6 professional styles
- **Batch generation** with customizable parameters

### Document Processing
- **PDF text extraction** using PDF.js
- **Metadata extraction** (title, author, pages)
- **Progress tracking** for large documents
- **Workflow integration** for multi-step processes

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Database operations (if using PostgreSQL)
npm run db:generate
npm run db:migrate
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Query for API state
- Radix UI for accessible components

**Backend:**
- Express.js with TypeScript
- Drizzle ORM for database operations
- Session management with PostgreSQL

**Cross-Platform:**
- Capacitor for mobile apps
- Tauri for desktop applications
- Service Worker for offline functionality

## 🎨 UI Components

Built with **shadcn/ui** components on top of **Radix UI** primitives:

- Accessible design patterns
- Dark/light theme support
- Mobile-responsive layouts
- Consistent design system

## 🔐 Security & Privacy

- **API keys** stored securely in localStorage
- **No server-side data storage** by default
- **Client-side processing** for sensitive documents
- **HTTPS enforcement** in production

## 🚢 Deployment

### Web Deployment
```bash
npm run build
# Deploy the `dist` folder to any static hosting service
```

### Mobile Apps
```bash
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
```

### Desktop Apps
```bash
npm run tauri build
```

## 📖 API Integration

Beskriva integrates with **Lemonfox.ai** APIs:

- **Base URL**: `https://api.lemonfox.ai`
- **Authentication**: API key in headers
- **Rate limiting**: Handled automatically
- **Error handling**: Comprehensive error states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lemonfox.ai** for providing the AI APIs
- **shadcn/ui** for the beautiful component library
- **Radix UI** for accessible primitives
- **Vite** for the excellent build tooling

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/beskriva/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

<p align="center">
  Made with ❤️ by the Beskriva team
</p>