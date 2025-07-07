# Ֆիզիկայի վարժություններ - Physics Exercise Platform

A comprehensive web application for creating, solving, and reviewing physics exercises with mathematical content support.

## Features

### For Students

- **Dashboard**: View all available exercises with status indicators
- **Exercise Solving**: Interactive math editor for entering given data and solution steps
- **Answer Checking**: Automatic verification of final answers against encrypted correct answers
- **Progress Tracking**: View attempt history and admin feedback
- **Real-time Feedback**: Immediate feedback on answer correctness

### For Admins & Superadmins

- **Exercise Management**: Create, edit, and delete physics exercises
- **Math Content Editor**: Rich mathematical content creation with Milkdown editor
- **Answer Encryption**: Secure storage of correct answers
- **Solution Review**: Comprehensive review system with status updates
- **Student Management**: View and manage student submissions
- **Feedback System**: Provide detailed feedback to students

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Math Editor**: Milkdown with KaTeX support
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query (React Query)
- **Encryption**: AES-256-CBC for answer security

## User Roles

### Student

- Access to exercise dashboard
- Submit solutions with math content
- View feedback and progress
- Automatic answer checking

### Admin

- All student capabilities
- Create and edit exercises
- Review student solutions
- Provide feedback and status updates

### Superadmin

- All admin capabilities
- User management
- System configuration

## Database Schema

### Core Models

- **User**: Authentication and role management
- **Exercise**: Problem definitions with encrypted answers
- **Solution**: Student submissions with review status
- **ExerciseAnswer**: Encrypted correct answers and solution steps

### Key Features

- Encrypted answer storage for security
- Attempt tracking for multiple submissions
- Comprehensive status management (PENDING, APPROVED, REJECTED, NEEDS_WORK)
- Admin feedback system

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/register-admin` - Admin registration
- `GET /api/auth/[...nextauth]` - NextAuth.js endpoints

### Exercises

- `GET /api/exercises` - List all exercises
- `POST /api/exercises` - Create new exercise
- `GET /api/exercises/[id]` - Get specific exercise
- `PUT /api/exercises/[id]` - Update exercise
- `DELETE /api/exercises/[id]` - Delete exercise

### Solutions

- `GET /api/solutions` - List all solutions (admin only)
- `POST /api/solutions` - Submit solution (student only)
- `PUT /api/solutions/[id]/status` - Update solution status (admin only)

## Security Features

- **Answer Encryption**: All correct answers are encrypted using AES-256-CBC
- **Role-based Access**: Strict role-based route protection
- **Input Validation**: Comprehensive validation on all endpoints
- **Session Management**: Secure session handling with NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd physics-exercises
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/physics_exercises"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"
```

## Usage

### For Students

1. Register or login at `/register` or `/login`
2. Access the dashboard at `/dashboard`
3. Click on any exercise to start solving
4. Use the math editor to enter given data and solution steps
5. Submit your final answer
6. View feedback and status updates

### For Admins

1. Register as admin or login with admin credentials
2. Access admin panel at `/admin`
3. Create exercises using the math editor
4. Review student solutions at `/admin/solutions`
5. Provide feedback and update solution status

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin pages
│   ├── dashboard/         # Student dashboard
│   ├── exercises/         # Exercise solving pages
│   └── api/              # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── math-editor.tsx   # Math editor component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── types/                # TypeScript type definitions
```

### Key Components

- **MathEditor**: Milkdown-based math content editor
- **AdminNav**: Navigation component for admin pages
- **AuthProvider**: NextAuth.js provider wrapper
- **QueryProvider**: TanStack Query provider

### Adding New Features

1. **New API Endpoint**: Add route in `src/app/api/`
2. **New Hook**: Add to `src/hooks/use-api.ts`
3. **New Component**: Add to `src/components/`
4. **New Page**: Add to appropriate directory in `src/app/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
