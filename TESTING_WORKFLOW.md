# Physics Exercise Platform - Testing Workflow

## Overview

This document outlines the complete testing workflow for the physics exercise platform with courses, hints, and student interaction features.

## Prerequisites

- Development server running on http://localhost:3001
- Prisma Studio running on http://localhost:5556
- Database migrated and seeded

## Test Workflow

### 1. Admin Authentication & Course Management

#### 1.1 Login as Admin

1. Navigate to http://localhost:3001/login
2. Login with admin credentials
3. Verify redirect to admin dashboard

#### 1.2 Create Courses

1. Navigate to Admin → Courses (Թեմաներ)
2. Click "Նոր թեմա" (New Course)
3. Create test courses:
   - **Մեխանիկա** (Mechanics) - URL: https://example.com/mechanics
   - **Էլեկտրամագնիսականություն** (Electromagnetism) - URL: https://example.com/electromagnetism
   - **Քվանտային ֆիզիկա** (Quantum Physics) - URL: https://example.com/quantum

#### 1.3 Edit/Delete Courses

1. Test editing course names and URLs
2. Test deleting courses (with confirmation)
3. Verify course count statistics

### 2. Exercise Creation with Courses and Hints

#### 2.1 Create Exercise with Course

1. Navigate to Admin → Exercises → Create
2. Fill in exercise details:
   - **Title**: "Հեծանիվի շարժում" (Bicycle Motion)
   - **Given Data**: Text or image describing the problem
   - **Correct Answer**: "15"
   - **Solution**: Text or image with solution steps
   - **Course**: Select "Մեխանիկա"
   - **Tags**: Add relevant tags

#### 2.2 Add Hints

1. Add 3 progressive hints:

   - **Hint 1**: "Օգտագործեք կինեմատիկայի հավասարումները" (Use kinematic equations)
   - **Hint 2**: "Հիշեք v = v₀ + at բանաձևը" (Remember v = v₀ + at formula)
   - **Hint 3**: "Փոխարինեք t = 3 վայրկյան" (Substitute t = 3 seconds)

2. Add hint images if needed

#### 2.3 Create Multiple Exercises

Create exercises for different courses:

- **Մեխանիկա**: 2-3 exercises
- **Էլեկտրամագնիսականություն**: 2-3 exercises
- **Քվանտային ֆիզիկա**: 1-2 exercises

### 3. Student Experience Testing

#### 3.1 Student Login

1. Login as student user
2. Verify dashboard shows exercises
3. Check exercise status indicators

#### 3.2 Exercise Attempt - Correct Answer

1. Click on an exercise
2. Submit correct answer immediately
3. Verify:
   - Success message appears
   - Exercise marked as completed
   - Solution becomes available
   - Correct answer is displayed

#### 3.3 Exercise Attempt - Wrong Answer with Hints

1. Click on another exercise
2. Submit wrong answer
3. Verify:
   - Error message appears
   - Hints section becomes visible
   - Request hint button is available
4. Request hints progressively:
   - Click "Պահանջել առաջին հուշումը"
   - Verify hint 1 appears with blue styling
   - Submit wrong answer again
   - Click "Պահանջել երկրորդ հուշումը"
   - Verify hint 2 appears with orange styling
   - Continue until all hints are revealed
5. Submit correct answer
6. Verify completion and solution access

### 4. Admin Exercise Management

#### 4.1 Edit Exercise

1. Navigate to Admin → Exercises
2. Click edit on an exercise
3. Modify:
   - Course selection
   - Hints content
   - Solution steps
4. Save and verify changes

#### 4.2 Exercise List View

1. Verify exercises show:
   - Title
   - Associated courses
   - Tags
   - Creation date
2. Test filtering and sorting

### 5. Data Validation Testing

#### 5.1 Required Fields

1. Try creating exercise without:
   - Title
   - Given data (text or image)
   - Solution (text or image)
   - Correct answer
2. Verify appropriate error messages

#### 5.2 Course Validation

1. Try creating exercise without selecting course
2. Verify course is required
3. Test course deletion with existing exercises

#### 5.3 Hint Validation

1. Test exercise with:
   - No hints
   - Partial hints (1-2 only)
   - All 3 hints
2. Verify student experience in each case

### 6. Security Testing

#### 6.1 Authentication

1. Try accessing admin pages without login
2. Try accessing student pages without login
3. Verify proper redirects

#### 6.2 Authorization

1. Login as student, try accessing admin pages
2. Login as admin, verify access to all features
3. Test API endpoints with different user roles

#### 6.3 Answer Encryption

1. Check database to verify correct answers are encrypted
2. Verify only admins can see decrypted answers
3. Test answer comparison works correctly

### 7. UI/UX Testing

#### 7.1 Responsive Design

1. Test on different screen sizes
2. Verify mobile navigation
3. Check form layouts on small screens

#### 7.2 Accessibility

1. Test keyboard navigation
2. Verify proper ARIA labels
3. Check color contrast

#### 7.3 Error Handling

1. Test network errors
2. Verify loading states
3. Check error message display

### 8. Performance Testing

#### 8.1 Load Testing

1. Create 50+ exercises
2. Test dashboard loading
3. Verify pagination if implemented

#### 8.2 Image Handling

1. Test with large images
2. Verify proper compression
3. Check loading states

## Expected Results

### Success Criteria

- ✅ Courses can be created, edited, and deleted
- ✅ Exercises can be created with courses and hints
- ✅ Students can attempt exercises and see hints
- ✅ Correct answers are encrypted in database
- ✅ Admin can manage all content
- ✅ UI is responsive and accessible
- ✅ Error handling works properly

### Database State

- Courses table populated with test data
- Exercises table with course relationships
- Solutions table with encrypted answers
- Tags and course-exercise relationships intact

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check .env file and restart server
2. **Authentication issues**: Verify session configuration
3. **Image upload problems**: Check file size limits and storage
4. **Encryption errors**: Verify crypto configuration

### Debug Steps

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check Prisma Studio for data integrity
4. Review server logs for backend issues

## Next Steps

After successful testing:

1. Deploy to staging environment
2. Conduct user acceptance testing
3. Performance optimization if needed
4. Production deployment
