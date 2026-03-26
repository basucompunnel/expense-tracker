# Expense Tracker & Budget Manager

A full-stack personal finance management application built with modern web technologies. This project demonstrates proficiency in full-stack development, system design, and creating intuitive user experiences for financial data management.

## 🎯 Project Overview

Expense Tracker is a production-ready web application that helps users manage their personal finances through:
- **Expense Tracking**: Record, categorize, and analyze spending across 14 expense categories
- **Budget Management**: Set monthly budgets (overall and per-category) with visual progress indicators
- **Financial Reporting**: Generate detailed reports with category breakdowns and visual insights
- **Bulk Operations**: Efficiently manage multiple expenses with batch operations

## ✨ Key Features Implemented

### Expense Management
- Create, read, update, and delete expenses with real-time validation
- Categorize expenses across 14 predefined categories (Groceries, Transport, Entertainment, etc.)
- Bulk selection and batch deletion of expenses
- Responsive card-based UI with interactive selection
- Real-time expense filtering and sorting

### Budget Management
- Set monthly overall spending budgets
- Configure individual category-specific budgets
- Visual progress bars with color-coded status indicators:
  - 🟢 Green (0-70% utilization)
  - 🟡 Yellow (70-90% utilization)
  - 🟠 Orange (90-100% utilization)
  - 🔴 Red (exceeds budget)
- Quick-generate default budgets with editable amounts
- Full CRUD operations with edit mode support

### Financial Reporting
- Generate comprehensive expense reports with 6 key metrics:
  - Total spending, expense count, average expense
  - Highest/lowest/range analysis
- Category-wise spending breakdown with pie chart visualization
- Server-side aggregation for performance optimization

### Authentication & Security
- JWT-based authentication system
- Protected routes with role-based access
- Secure API endpoints with middleware-based authorization
- Token-based API requests

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.2.1** - React framework with SSR and API routes
- **TypeScript** - Full type safety with strict mode enabled
- **Tailwind CSS 4** - Utility-first styling with dark mode support
- **shadcn/ui** - High-quality React component library
- **Recharts 1.0.1** - Responsive charting library
- **Lucide React 1.0.1** - Icon library

### Backend
- **Node.js + Next.js API Routes** - Serverless backend architecture
- **MongoDB** - NoSQL database for flexible document storage
- **Mongoose** - Object modeling and schema validation
- **Date-fns 4.1.0** - Date manipulation and formatting

### Architecture Highlights
- **Client/Server Separation** - Clear React Client Components and API route handlers
- **Service Layer Pattern** - Abstracted API calls with type-safe wrappers
- **Middleware-based Auth** - Reusable authentication middleware for route protection
- **Component Composition** - Subcomponent architecture for maintainability
- **Upsert Pattern** - Efficient MongoDB operations for create/update scenarios

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd expense-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env.local file with:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── models/          # Mongoose schemas (Expense, User, Budget)
├── types/           # TypeScript interfaces and types
├── services/        # API service wrappers (expenses, budgets, reports)
├── middleware/      # Authentication and route middleware
└── utils/           # Helper functions and utilities

components/
├── expense/         # Expense-related components
├── budget/          # Budget management components
├── common/          # Shared UI components
├── ui/              # Reusable UI primitives
└── layouts/         # Layout wrappers

app/
├── api/             # API routes (expenses, budgets, auth, reports)
├── auth/            # Authentication pages
├── budgets/         # Budget management page
└── page.tsx         # Dashboard
```

## 💡 Technical Decisions & Trade-offs

### API Architecture
- **Upsert Pattern**: Leverages MongoDB's unique indexes to handle create/update operations atomically
- **Server-side Aggregation**: Report calculations happen on backend for security and performance
- **Middleware Pattern**: Centralized auth logic reduces code duplication

### Data Modeling
- **Unique Indexes**: Budget table uses unique index on (userId, type, category, month, year) for efficient lookups
- **Expense Categories**: Enum-based approach prevents invalid data entry
- **Flexible Schema**: Mongoose allows optional fields for category-specific budgets

### Frontend Patterns
- **Subcomponent Composition**: Large components split into focused, reusable pieces
- **Service Layer**: API calls abstracted to allow easy mocking and testing
- **Form State Management**: React hooks for clean, predictable form behavior

## 📊 Code Quality

- **TypeScript (Strict Mode)** - Comprehensive type safety across frontend and backend
- **ESLint Configuration** - Consistent code style and best practices
- **Component Architecture** - Modular, testable, and maintainable codebase
- **Error Handling** - Robust error boundaries and user feedback
- **Dark Mode Support** - Tailwind CSS dark mode on all components

## 🔐 Security Features

- JWT-based authentication with Bearer tokens
- Protected API routes with middleware validation
- Input validation on both client and server
- Secure password handling
- User data isolation by userId

## 🎓 Skills Demonstrated

✅ **Full-Stack Development** - Frontend to backend implementation  
✅ **TypeScript & Type Safety** - Strict mode configuration  
✅ **Database Design** - MongoDB schema design with indexes  
✅ **API Design** - RESTful endpoints with proper error handling  
✅ **React Patterns** - Hooks, composition, state management  
✅ **UI/UX** - Responsive design, dark mode, accessibility  
✅ **Component Architecture** - Subcomponent pattern, props drilling management  
✅ **Authentication & Authorization** - JWT-based security  
✅ **Performance Optimization** - Server-side aggregation, efficient queries  
✅ **Problem Solving** - Color-coded budgets, bulk operations, modal workflows

## 📈 Future Enhancement Ideas

- Budget alerts and notifications
- Expense trends and forecasting
- Multi-currency support
- Receipt image uploads and OCR
- Recurring expense templates
- Export reports to PDF/CSV
- Mobile app (React Native)
- Advanced analytics dashboard

## 👨‍💻 About This Project

This project was built as a demonstration of modern full-stack web development practices. It showcases ability to:
- Design and implement complete features from requirements to production
- Make informed technical decisions and trade-offs
- Write clean, maintainable, and type-safe code
- Create intuitive user experiences
- Implement real-world patterns and best practices

## 📝 License

This project is open source and available under the MIT License.

---

**Questions or feedback?** Feel free to reach out!
