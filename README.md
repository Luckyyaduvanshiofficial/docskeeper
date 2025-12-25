# 📄 Personal Document Manager

A modern, production-grade document management application built with React and Appwrite. Securely upload, organize, search, and manage your personal documents with AI-powered analysis.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65?logo=appwrite)

## 🎯 Project Overview

Personal Document Manager is a full-stack web application that helps users digitally organize and manage their important documents. Built with a focus on user experience, security, and scalability, this application demonstrates modern frontend development practices and cloud backend integration.

### Key Problems Solved
- **Document Organization**: Categorize documents (Academic, Receipts, ID Proofs, Certificates, etc.)
- **Quick Search**: Find documents instantly with full-text search
- **Secure Storage**: All documents encrypted and stored securely in the cloud
- **AI-Powered Analysis**: Automatic document categorization and description generation
- **Form Autofill**: Extract data from documents to auto-fill forms

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure email/password and Google OAuth login |
| 📤 **Document Upload** | Drag-and-drop file upload with progress tracking |
| 🗂️ **Smart Categories** | Organize documents into predefined categories |
| 🔍 **Advanced Search** | Search by filename, category, or date range |
| 👁️ **Document Preview** | In-app document viewing without downloading |
| 🤖 **AI Analysis** | Auto-generate descriptions using Gemini AI |

### Desktop-Specific Features
| Feature | Description |
|---------|-------------|
| 📊 **Split View** | View document list and preview side-by-side |
| ⌨️ **Command Palette** | Quick actions with `Ctrl+K` or `Ctrl+P` |
| 🎯 **Drag & Drop** | Drop files anywhere to upload |
| 📋 **Data Table View** | Sortable columns for power users |
| 🔄 **Collapsible Sidebar** | More screen space with `Ctrl+B` |

### Mobile Features
| Feature | Description |
|---------|-------------|
| 📱 **Responsive Design** | Optimized for all screen sizes |
| 👆 **Touch Gestures** | Swipe and tap interactions |
| 🔽 **Bottom Navigation** | Easy thumb-reach navigation |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components       │  Hooks                │
│  ├─ Dashboard   │  ├─ UI Components │  ├─ useDocuments      │
│  ├─ Documents   │  ├─ Layout        │  ├─ useCategories     │
│  ├─ Upload      │  ├─ Forms         │  ├─ useDebounce       │
│  ├─ Search      │  └─ Cards         │  └─ useKeyboardShortcuts
│  └─ Settings    │                   │                        │
├─────────────────────────────────────────────────────────────┤
│                    Services Layer                            │
│  ├─ appwrite.ts (Auth, Database, Storage)                   │
│  └─ gemini.ts (AI Analysis)                                 │
├─────────────────────────────────────────────────────────────┤
│                    Appwrite Backend                          │
│  ├─ Authentication    ├─ Database       ├─ Storage          │
│  └─ (Email/OAuth)     └─ (Metadata)     └─ (Files)          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks and functional components
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **React Router v6** - Client-side routing
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Form handling and validation

### Backend (Appwrite)
- **Authentication** - Email/password + OAuth providers
- **Database** - NoSQL document storage for metadata
- **Storage** - Secure file storage with access control

### AI Integration
- **Google Gemini** - Document analysis and auto-categorization

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **PWA Support** - Installable as mobile app

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Card, etc.)
│   ├── layout/          # Layout components (Sidebar, MainLayout)
│   ├── forms/           # Form components (FileUpload, SearchBar)
│   ├── cards/           # Card components (DocumentCard, StatCard)
│   └── skeletons/       # Loading skeletons
├── pages/
│   ├── Dashboard.tsx    # Main dashboard with stats
│   ├── Documents.tsx    # Document list with filters
│   ├── Upload.tsx       # Document upload page
│   ├── Search.tsx       # Advanced search
│   └── Settings.tsx     # User preferences
├── services/
│   ├── appwrite.ts      # Appwrite SDK wrapper
│   └── gemini.ts        # Gemini AI integration
├── hooks/
│   ├── useDocuments.ts  # Document CRUD operations
│   ├── useCategories.ts # Category management
│   └── useDebounce.ts   # Input debouncing
├── context/
│   └── AuthContext.tsx  # Authentication state
└── utils/
    └── formatters.ts    # Date/file formatters
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Appwrite account (or self-hosted instance)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/personal-document-manager.git

# Navigate to project directory
cd personal-document-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Appwrite Setup

1. Create a new Appwrite project
2. Enable Email/Password authentication
3. Create a database with a `document_metadata` collection
4. Create a storage bucket named `documents`
5. Configure collection attributes:
   - `fileId` (string)
   - `fileName` (string)
   - `category` (string)
   - `description` (string)
   - `uploadedAt` (datetime)
   - `userId` (string)

## 🎨 Key Design Decisions

### 1. Component Architecture
Used **compound components** and **composition patterns** for flexible, reusable UI elements. Each component is single-responsibility and highly testable.

### 2. State Management
- **TanStack Query** for server state (caching, refetching, optimistic updates)
- **React Context** for auth state only (minimal global state)
- **Local state** for UI-specific state

### 3. Authentication Flow
Implemented **AuthGuard** component that:
- Checks session on mount
- Redirects unauthenticated users to login
- Preserves intended destination URL

### 4. Performance Optimizations
- **Code splitting** with React.lazy for routes
- **Debounced search** to reduce API calls
- **Skeleton loaders** for perceived performance
- **Optimistic UI updates** for better UX

### 5. Accessibility
- Full keyboard navigation support
- ARIA labels on interactive elements
- Focus management in modals
- Color contrast compliance

## 📊 What I Learned

### Technical Skills
- Building production-grade React applications
- Integrating with BaaS platforms (Appwrite)
- Implementing secure authentication flows
- Managing complex state with TanStack Query
- Creating responsive, accessible UIs

### Soft Skills
- Breaking down large features into manageable tasks
- Making architectural decisions with trade-offs
- Writing maintainable, documented code
- Performance optimization strategies

## 🔮 Future Enhancements

- [ ] Document sharing with other users
- [ ] OCR text extraction from images
- [ ] Document expiry reminders
- [ ] Bulk upload functionality
- [ ] Export documents to different formats
- [ ] Folder/subfolder organization
- [ ] Document versioning

## 📝 Interview Talking Points

1. **Why Appwrite over Firebase?**
   - Open-source and self-hostable
   - Better privacy control
   - Simpler SDK and pricing

2. **How did you handle authentication?**
   - Session-based auth with Appwrite
   - AuthGuard HOC for route protection
   - Secure token storage

3. **How does the AI integration work?**
   - Gemini API for document analysis
   - Async processing with loading states
   - Graceful fallbacks on API failure

4. **What would you improve?**
   - Add end-to-end tests with Playwright
   - Implement offline-first with service workers
   - Add real-time sync across devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [Lovable](https://lovable.dev)
