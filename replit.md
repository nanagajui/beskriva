# Beskriva - AI Content Creation Studio

## Overview

Beskriva is a Progressive Web App (PWA) that provides a unified content creation studio for all Lemonfox.ai API services. The application offers a chat-centric interface for orchestrating Speech-to-Text (Whisper), Text-to-Speech, Image Generation (Stable Diffusion XL), and Chat (Llama) capabilities with advanced document processing workflows. It's designed to work offline-first with no backend dependency, storing all data locally in the browser.

**Key Enhancement:** Content Processing Pipeline - Upload research PDFs, generate AI summaries, create podcast scripts for multiple speakers, produce TTS audio, and generate aligned cover images - all through conversational chat orchestration.

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
- **Document Upload & Processing** - PDF attachment with text extraction
- **Multi-step Content Workflows** - Research paper → Summary → Podcast script → TTS audio → Cover image
- Command-based interaction (`/stt`, `/tts`, `/image`, `/pdf` commands)
- **Workflow Templates** - Pre-built prompts for podcast creation, content summarization
- Real-time message display with streaming support preparation
- Message actions (copy, download, regenerate, use-as-prompt)
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

### Content Processing Pipeline
1. **Document Upload** - PDF files processed with PDF.js for text extraction
2. **Workflow Orchestration** - Multi-step AI processes with state management
3. **Cross-Service Integration** - Results from one API feed into another
4. **Template System** - Pre-built workflows for common use cases
5. **Progress Tracking** - Step-by-step workflow visualization

### State Management
1. **Global state** managed through Zustand stores
2. **Local persistence** using localStorage and IndexedDB
3. **Settings synchronization** across all panels
4. **History management** for generated content
5. **Workflow state** - Track multi-step process progress and intermediate results

### File Operations
1. **File System Access API** for native file operations (when supported)
2. **PDF.js integration** for client-side document processing
3. **Blob downloads** as fallback for file saving
4. **Media URL generation** for audio/image preview
5. **Local caching** of generated content and extracted documents

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

- January 08, 2025. Completed Phase 2 Advanced Features (Multi-Speaker TTS + Content-Aligned Images):
  - Multi-Speaker Podcast Generation: Advanced AudioProcessor class with script parsing, speaker identification, voice assignment, and audio mixing
  - Content-Aligned Image Generation: ContentAlignedImageGenerator with theme/mood analysis, 6 professional podcast cover styles, and contextual prompt generation
  - Enhanced TTS Panel: Added tabbed interface with single speaker and podcast generator modes
  - Enhanced Image Panel: Added content-aligned generation tab with podcast cover generator and content illustration tools
  - Smart Content Analysis: Automatic extraction of themes, mood, genre, and visual style recommendations from text content
- January 08, 2025. Completed Full Application Implementation (Rebranding + Pipeline):
  - App Rebranding: Renamed to "Beskriva - AI Content Creation Studio" across all files
  - Service Worker Completion: Implemented full background sync with IndexedDB queue management  
  - Streaming Chat Enhancement: Fixed token usage calculation for proper API response handling
  - PWA Manifest Updates: Added PDF file handling and workflow shortcuts for native-like experience
- January 08, 2025. Implemented PDF-to-Podcast Content Pipeline (Phase 1A & 1B):
  - PDF Processing: Added PDF.js integration for client-side text extraction with progress tracking
  - Document Management: Created comprehensive document store with metadata extraction
  - Workflow Engine: Implemented multi-step AI process orchestration with template system
  - Content Workflows: Added Research→Podcast, Document Analysis, and Content Expansion templates
  - Enhanced Chat: Integrated document attachment, /pdf commands, and workflow triggers
  - UI Navigation: Added Workflow panel with step visualization and progress tracking
- January 07, 2025. Fixed all major functionality issues:
  - STT Recording Controls: Added proper stop/pause/resume with file storage integration
  - TTS Voice Selection: Updated with actual Lemonfox.ai voice names (50+ voices)
  - TTS Language Support: Added language selector with 9 supported languages
  - API Parameter Mapping: All calls now use correct Lemonfox.ai parameters
  - Timestamp Handling: Fixed Date object conversion in chat messages
  - UI/UX Improvements: Enhanced recording controls and voice selection interface
- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Status & Quality Assessment

**Beskriva v1.0 - Feature Complete, Quality Review Phase**

### ✅ Implemented Features (Phase 1A, 1B, & 2 Complete)
- Complete rebrand from "Lemonfox.ai Dashboard" to "Beskriva - AI Content Creation Studio"
- Service worker background sync with full IndexedDB implementation
- Enhanced streaming chat with proper token usage calculation  
- PWA manifest optimized for mobile app installation with PDF handling
- Complete workflow engine for PDF → Summary → Podcast → TTS → Image pipelines
- Document store with Zustand state management and persistence
- PDF.js integration with progress tracking and metadata extraction (client-side, no API)
- Multi-speaker podcast generation with audio mixing capabilities
- Content-aligned image generation with 6 professional style templates
- Advanced audio processor with speaker identification and voice assignment
- Content analysis engine for theme/mood detection and visual style adaptation
- Comprehensive PDF file management (upload, switch, remove, preview)
- Error boundary system for runtime crash protection

### 🔧 Quality Issues Identified (January 8, 2025)
- **Codebase Size**: 85 TypeScript files, 8,500+ lines of code
- **Component Complexity**: Some components exceed 200+ lines (DocumentUpload, TTS Panel, Image Panel)
- **Store Monoliths**: useDocumentStore combines documents, workflows, and templates (300+ lines)
- **Type Duplication**: Similar types defined across multiple files
- **API Patterns**: Inconsistent error handling and request patterns
- **Documentation Drift**: Implementation has grown beyond current documentation

### 🚧 Quality Improvement Progress (January 8, 2025)

**✅ Completed Actions:**
- Created comprehensive quality assessment and refactoring plan (QUALITY_PLAN.md)
- Identified critical areas: 85 TypeScript files, 8,500+ lines, complex components
- Started type system consolidation with shared/types.ts (300+ unified types)
- Updated documentation to reflect actual codebase state vs. aspirational features
- Began component refactoring with custom hooks for business logic separation

**🔧 Active Refactoring Areas:**
- **Type Safety**: Consolidating duplicate types across 15+ files into shared/types.ts
- **Component Architecture**: Extracting business logic into custom hooks (useDocumentUpload)
- **Store Optimization**: Planning split of 300-line useDocumentStore into focused stores
- **API Standardization**: Unifying error handling patterns across API calls
- **Documentation Sync**: Ensuring replit.md accurately reflects implemented features

**📊 Quality Metrics Target:**
- Component files < 150 lines (current: some >250 lines)
- Store files < 200 lines (current: useDocumentStore 300+ lines)  
- Zero TypeScript strict mode errors
- Consistent error handling patterns
- Comprehensive documentation coverage

**Next Priority**: Complete type consolidation and component hook extraction for DocumentUpload, TTS Panel, and Image Generation components.