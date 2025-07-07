# Lemonfox.ai PWA Dashboard

## Overview

This is a Progressive Web App (PWA) that provides a unified dashboard for all Lemonfox.ai API services. The application offers a chat-centric interface for orchestrating Speech-to-Text (Whisper), Text-to-Speech, Image Generation (Stable Diffusion XL), and Chat (Llama) capabilities. It's designed to work offline-first with no backend dependency, storing all data locally in the browser.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern component patterns
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with dark/light theme support
- **Zustand** for lightweight state management
- **Wouter** for client-side routing
- **React Query** for API state management and caching

### Cross-Platform Deployment
- **PWA-first** approach with service worker and manifest for web installation
- **Capacitor** configuration for native mobile app deployment (Android/iOS)
- **Tauri** configuration for desktop app deployment (Windows/macOS/Linux)

### UI Component System
- **Radix UI** primitives for accessible, unstyled components
- **shadcn/ui** component library built on top of Radix UI
- Comprehensive component set including forms, dialogs, navigation, and media controls

## Key Components

### 1. Chat Interface (`/chat`)
- Central hub for orchestrating all AI services
- Command-based interaction (`/stt`, `/tts`, `/image` commands)
- Real-time message display with streaming support preparation
- Message actions (copy, download, regenerate)
- Model selection and configuration

### 2. Speech-to-Text Panel (`/stt`)
- File upload with drag-and-drop support
- Audio recording using Web Media Recorder API
- Language selection (auto-detect + 100+ languages)
- Multiple response formats (JSON, text, SRT, VTT)
- Speaker diarization and identification
- Translation to English option

### 3. Text-to-Speech Panel (`/tts`)
- Text input with character counter
- Voice selection from 50+ voices grouped by language
- Speed control (0.5x - 4x)
- Audio format selection
- Built-in audio player with controls
- Audio generation history

### 4. Image Generation Panel (`/image`)
- Text prompt input with negative prompt support
- Image quantity and size configuration
- Response format options
- Generated image gallery with download/share options
- Image history and management

### 5. Settings Panel (`/settings`)
- API key management with secure storage
- Base URL configuration for API endpoints
- Theme selection (light/dark/system)
- Timeout and connection settings
- Data management and export options

## Data Flow

### API Integration
1. **Client-side API calls** directly to Lemonfox.ai endpoints
2. **API key authentication** stored securely in localStorage
3. **Request/Response handling** with proper error management
4. **Streaming support** for real-time responses (chat)

### State Management
1. **Global state** managed through Zustand stores
2. **Local persistence** using localStorage and IndexedDB
3. **Settings synchronization** across all panels
4. **History management** for generated content

### File Operations
1. **File System Access API** for native file operations (when supported)
2. **Blob downloads** as fallback for file saving
3. **Media URL generation** for audio/image preview
4. **Local caching** of generated content

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database driver (configured but not actively used)
- **@tanstack/react-query**: Server state management
- **@capacitor/core**: Native mobile capabilities
- **@tauri-apps/cli**: Desktop app compilation

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **class-variance-authority**: Type-safe variant handling
- **clsx**: Conditional class names
- **tailwind-merge**: Tailwind class merging utility

### Media Dependencies
- **Web Speech API**: For speech recognition
- **MediaRecorder API**: For audio recording
- **File System Access API**: For file operations

## Deployment Strategy

### Development
- **Vite dev server** with HMR for fast development
- **TypeScript checking** with strict mode enabled
- **ESLint/Prettier** for code quality (configured but not visible)

### Production Build
- **Vite build** generates optimized static assets
- **Service Worker** for offline functionality and caching
- **PWA manifest** for web app installation

### Multi-Platform Deployment
1. **Web**: Deploy static files to any web server
2. **Mobile**: Use Capacitor to build native Android/iOS apps
3. **Desktop**: Use Tauri to build native desktop applications

### Database Strategy
- **No server-side database** required
- **localStorage** for settings and preferences
- **IndexedDB** for larger data storage (media files, history)
- **Drizzle ORM** configured for potential future backend integration

## Changelog

- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.