# TalentMesh - Complete Project

A modern web application that connects students, mentors, and recruiters to showcase and discover talents.

## 🚀 Project Status

- ✅ **Phase 2 Complete**: Full UI/UX implementation with routing, authentication flow, and all pages
- ✅ **Phase 3 In Progress**: Real Firebase integration (Auth + Firestore)
- 🔄 **Phase 4**: Production readiness (Security, Performance, Deployment)

## 🛠️ Technology Stack

### Frontend
- **React 19.2.6** - UI Library
- **Vite 8.0.12** - Build tool & dev server
- **React Router 7.15.1** - Client-side routing
- **Tailwind CSS 3.4.19** - Styling
- **Lucide React 1.17.0** - Icons
- **Framer Motion 12.40.0** - Animations

### Backend & Services
- **Firebase 12.13.0**
  - Authentication (Email/Password, Google)
  - Firestore (Real-time database)
  - Cloud Functions (optional)

## 📋 Prerequisites

- Node.js 18+
- npm 9+
- Firebase Project (https://console.firebase.google.com)

## ⚙️ Installation & Setup

### 1. Extract & Navigate
```bash
cd TALENTMESH
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create Project" → Name it "talentmesh"
3. Click "Create Project"

### 4. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (optional)

### 5. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Choose **Production Mode** with security rules
4. Select your region
5. Click "Create"

### 6. Copy Firebase Credentials

1. Click gear icon → **Project Settings**
2. Scroll to "Your apps"
3. Click "Web" app (or create one)
4. Copy the config object

### 7. Create `.env.local`

Create `.env.local` in the project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 8. Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules
```

## 🎯 Running the App

### Development
```bash
npm run dev
```
Opens at http://localhost:5174

### Production Build
```bash
npm run build
npm run preview
```

## 📱 Features

### ✅ Completed
- Role-based signup (Student, Mentor, Recruiter)
- Secure authentication (Email/Password + Google)
- Real-time messaging system
- Collaboration requests
- Talent selection & discovery
- Leaderboard
- Notifications
- User profiles
- Responsive design
- Error boundaries

### 🔄 In Progress
- Firebase data persistence
- Real-time updates
- Profile editing

### 📋 Planned
- Projects management
- Team collaboration
- Video chat
- Mobile app
- Analytics

## 🗂️ Project Structure

```
src/
├── auth/                    # Authentication pages
│   ├── Login.jsx           # Login/Register
│   ├── RoleSelection.jsx   # Role picker
│   └── TalentSelection.jsx # Talent picker
├── components/             # UI components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── ChatWidget.jsx
├── context/                # State management
│   └── AuthContext.jsx
├── layouts/                # Page layouts
│   └── MainLayout.jsx
├── pages/                  # Page components
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Explore.jsx
│   ├── Requests.jsx
│   ├── Projects.jsx
│   ├── Notifications.jsx
│   ├── Leaderboard.jsx
│   ├── Chart.jsx
│   └── ChartList.jsx
├── services/               # Firebase services
│   ├── auth.js
│   ├── chatService.js
│   ├── requestService.js
│   ├── notificationService.js
│   └── getCurrentUser.js
└── firebase.js             # Firebase config
```

## 🔐 Firestore Schema

The security rules protect:
- **Users**: Can read any, write only own
- **Requests**: Can read own, only recipient accepts
- **Notifications**: Can only read own
- **Chats**: Participants can read/write
- **Messages**: Sender can delete, participants can read

## 🧪 Testing Checklist

### Authentication
- [ ] Register new account
- [ ] Login with credentials  
- [ ] Logout clears session
- [ ] Protected routes require login

### Features
- [ ] Select talents on signup
- [ ] Send collaboration request
- [ ] Accept/reject requests
- [ ] Send and receive messages
- [ ] View notifications
- [ ] Check leaderboard

## 🚀 Deployment to Firebase Hosting

```bash
firebase init hosting
npm run build
firebase deploy --only hosting
```

## 📚 Documentation

- [Complete Setup Guide](./PROJECT_COMPLETION_GUIDE.md)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Tailwind Docs](https://tailwindcss.com)

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| White screen | Check .env.local Firebase config |
| Auth error | Verify Email/Password enabled in Firebase |
| Messages not loading | Check Firestore security rules |
| Styling looks off | Clear cache, run `npm install` again |

## 📞 Support

1. Check [PROJECT_COMPLETION_GUIDE.md](./PROJECT_COMPLETION_GUIDE.md)
2. Review browser console errors
3. Verify Firebase project setup
4. Check network requests in DevTools

---

**Version**: 2.0.0  
**Last Updated**: 2026-06-07

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
