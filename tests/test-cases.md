# Test Cases Documentation

## Overview
This document provides a comprehensive overview of all test cases implemented in the JDK Store application. The tests are organized into four main categories:
1. Authentication Tests
2. Navigation & UI Tests
3. Sales Workflow Tests
4. Performance & Edge Cases Tests

## 1. Authentication Tests (`01-authentication.spec.ts`)

### 1.1 Login Page Display
- **Test**: `should display login page correctly`
- **Description**: Verifies that the login page displays all required elements
- **Checks**:
  - Page title contains "Login" or "Đăng nhập"
  - Username input field is visible
  - Password input field is visible
  - Manager login button is visible
  - Sales login button is visible

### 1.2 Login Functionality
- **Test**: `should login successfully with valid credentials manager`
- **Description**: Tests successful login with valid manager credentials
- **Checks**:
  - Redirects to dashboard after login
  - Dashboard elements are visible
  - Navigation menu is present

### 1.3 Invalid Login
- **Test**: `should show error with invalid credentials`
- **Description**: Verifies error handling for invalid login attempts
- **Checks**:
  - Stays on login page
  - Shows error message
  - Handles invalid username/password combinations

### 1.4 Form Validation
- **Test**: `should show validation errors for empty fields`
- **Description**: Tests form validation for empty fields
- **Checks**:
  - Shows validation errors for empty fields
  - Prevents submission with empty fields
  - Displays appropriate error messages

### 1.5 Logout
- **Test**: `should logout successfully`
- **Description**: Verifies logout functionality
- **Checks**:
  - Successfully logs out
  - Redirects to login page
  - Clears session

### 1.6 Protected Routes
- **Test**: `should redirect to login when accessing protected routes without authentication`
- **Description**: Tests access control for protected routes
- **Checks**:
  - Redirects to login for unauthenticated access
  - Covers all protected routes (products, inventory, sales, customers, employees, revenue)

### 1.7 Session Management
- **Test**: `should maintain session after page refresh`
- **Description**: Verifies session persistence
- **Checks**:
  - Maintains login state after refresh
  - Preserves user session

### 1.8 Concurrent Sessions
- **Test**: `should handle concurrent login sessions`
- **Description**: Tests handling of multiple sessions
- **Checks**:
  - Handles multiple tabs/windows
  - Maintains session across tabs

## 2. Navigation & UI Tests (`02-navigation-ui.spec.ts`)

### 2.1 Navigation Menu
- **Test**: `should display main navigation correctly`
- **Description**: Verifies navigation menu elements
- **Checks**:
  - All menu items are visible
  - Correct menu structure
  - Proper menu item labels

### 2.2 Page Navigation
- **Test**: `should click and navigate to all main pages`
- **Description**: Tests navigation to all main pages
- **Checks**:
  - Navigation to Overview
  - Navigation to Products
  - Navigation to Inventory
  - Navigation to Invoices
  - Navigation to Customers
  - Navigation to Employees

### 2.3 Page Titles
- **Test**: `should display correct page titles`
- **Description**: Verifies page titles across the application
- **Checks**:
  - Correct titles for all pages
  - Proper heading display
  - Title consistency

### 2.4 Responsive Design
- **Test**: `should be responsive on different screen sizes`
- **Description**: Tests responsive design
- **Checks**:
  - Mobile viewport (375x667)
  - Tablet viewport (768x1024)
  - Desktop viewport (1920x1080)
  - Mobile menu functionality
  - Navigation adaptation

### 2.5 User Menu
- **Test**: `should display user menu/profile`
- **Description**: Tests user profile menu
- **Checks**:
  - Profile icon visibility
  - Menu dropdown functionality
  - Logout option

### 2.6 Keyboard Navigation
- **Test**: `should handle keyboard navigation`
- **Description**: Tests keyboard accessibility
- **Checks**:
  - Tab navigation
  - Focus management
  - Enter key functionality

### 2.7 Loading States
- **Test**: `should display loading states`
- **Description**: Verifies loading indicators
- **Checks**:
  - Loading spinners
  - Loading text
  - Transition states

### 2.8 Page Refresh
- **Test**: `should handle page refresh correctly`
- **Description**: Tests page refresh behavior
- **Checks**:
  - State preservation
  - Content reloading
  - URL maintenance

### 2.9 Browser Navigation
- **Test**: `should handle browser back/forward buttons`
- **Description**: Tests browser navigation
- **Checks**:
  - Back button functionality
  - Forward button functionality
  - History state management

## 3. Sales Workflow Tests (`03-sales-workflow.spec.ts`)

### 3.1 Sales Page Navigation
- **Test**: `should display navigation menu correctly`
- **Description**: Tests sales page navigation
- **Checks**:
  - JDK Store logo visibility
  - Menu button functionality
  - Menu items visibility
  - Navigation between sales pages

### 3.2 Sales Page UI
- **Test**: `should display sales page UI correctly`
- **Description**: Verifies sales page interface
- **Checks**:
  - Invoice section visibility
  - Search functionality
  - Total amount display
  - Payment button
  - Product grid

### 3.3 Loading States
- **Test**: `should handle loading state correctly`
- **Description**: Tests loading states in sales page
- **Checks**:
  - Loading indicators
  - Loading text
  - Page load completion

### 3.4 Product Search
- **Test**: `should search products correctly`
- **Description**: Tests product search functionality
- **Checks**:
  - Search input functionality
  - Search results display
  - Search clearing

### 3.5 Cart Management
- **Test**: `should add products to cart`
- **Description**: Tests cart functionality
- **Checks**:
  - Product addition
  - Cart updates
  - Cart display

### 3.6 Quantity Management
- **Test**: `should modify cart quantities`
- **Description**: Tests quantity modification
- **Checks**:
  - Quantity input
  - Quantity updates
  - Input validation

### 3.7 Total Calculation
- **Test**: `should calculate total correctly`
- **Description**: Verifies total amount calculation
- **Checks**:
  - Total display
  - Calculation accuracy
  - Updates with quantity changes

### 3.8 Payment Process
- **Test**: `should handle payment button states`
- **Description**: Tests payment button behavior
- **Checks**:
  - Button state management
  - Disabled state
  - Enabled state
  - Payment popup

### 3.9 AI Suggestions
- **Test**: `should show AI suggestions`
- **Description**: Tests AI recommendation system
- **Checks**:
  - Suggestion display
  - Suggestion relevance
  - Suggestion timing

### 3.10 Combo Suggestions
- **Test**: `should handle combo suggestions`
- **Description**: Tests combo product suggestions
- **Checks**:
  - Combo display
  - Combo relevance
  - Savings indication

### 3.11 Invoice History
- **Test**: `should display invoice history page correctly`
- **Description**: Tests invoice history page
- **Checks**:
  - Invoice list display
  - Empty state handling
  - Invoice details
  - Loading states
  - Invoice actions

### 3.12 Error Handling
- **Test**: `should handle API errors gracefully`
- **Description**: Tests error handling
- **Checks**:
  - API error display
  - Retry functionality
  - Error messages
  - Network timeout handling

## 4. Performance & Edge Cases Tests (`04-performance-edge-cases.spec.ts`)

### 4.1 Page Load Performance
- **Test**: `should load pages within acceptable time limits`
- **Description**: Tests page load performance
- **Checks**:
  - Load time limits
  - Content visibility
  - Page indicators
  - Performance across all pages

### 4.2 Network Conditions
- **Test**: `should handle slow network conditions`
- **Description**: Tests application under slow network
- **Checks**:
  - 3G network simulation
  - Page functionality
  - Loading states
  - Error handling

### 4.3 Network Errors
- **Test**: `should handle network errors gracefully`
- **Description**: Tests network error handling
- **Checks**:
  - API failure handling
  - Error messages
  - Retry options
  - User feedback

### 4.4 Large Data Handling
- **Test**: `should handle large datasets with pagination`
- **Description**: Tests large data management
- **Checks**:
  - Pagination functionality
  - Data display
  - Page navigation
  - Item count limits

### 4.5 Rapid Interactions
- **Test**: `should handle rapid user interactions in sales page`
- **Description**: Tests system under rapid user input
- **Checks**:
  - Multiple product additions
  - System responsiveness
  - Cart updates
  - UI stability

### 4.6 Browser Compatibility
- **Test**: `should handle browser compatibility features`
- **Description**: Tests browser feature support
- **Checks**:
  - Modern JavaScript features
  - CSS features
  - Browser APIs
  - Feature detection

### 4.7 Memory Management
- **Test**: `should handle memory leaks during navigation`
- **Description**: Tests memory usage
- **Checks**:
  - Multiple page navigation
  - Memory cleanup
  - System responsiveness
  - Resource management

### 4.8 Input Validation
- **Test**: `should handle extreme search inputs`
- **Description**: Tests input handling
- **Checks**:
  - Long text inputs
  - Special characters
  - Unicode characters
  - SQL injection attempts
  - XSS attempts
  - Empty inputs
  - Whitespace
  - Numeric inputs

### 4.9 Concurrent Operations
- **Test**: `should handle concurrent operations`
- **Description**: Tests concurrent user sessions
- **Checks**:
  - Multiple tab handling
  - Session management
  - Page functionality
  - Resource sharing

### 4.10 Session Management
- **Test**: `should handle session expiration`
- **Description**: Tests session handling
- **Checks**:
  - Session clearing
  - Authentication redirects
  - Error messages
  - Login form display

### 4.11 Form Validation
- **Test**: `should handle form validation in add employee modal`
- **Description**: Tests form validation
- **Checks**:
  - Input validation
  - Error messages
  - Form submission
  - Modal handling

### 4.12 File Upload
- **Test**: `should handle image upload in products`
- **Description**: Tests file upload functionality
- **Checks**:
  - Large file handling
  - Empty file handling
  - Invalid file types
  - Upload feedback

### 4.13 Database Connection
- **Test**: `should handle database connection issues`
- **Description**: Tests database error handling
- **Checks**:
  - Connection failure handling
  - Error messages
  - Loading states
  - Retry options

### 4.14 Print Functionality
- **Test**: `should handle print functionality in invoices`
- **Description**: Tests invoice printing
- **Checks**:
  - Print dialog
  - Print preview
  - Print completion
  - Error handling

### 4.15 Table Sorting
- **Test**: `should handle sorting functionality in employee table`
- **Description**: Tests table sorting
- **Checks**:
  - Sort button functionality
  - Ascending/descending sort
  - Table updates
  - Data display

## Conclusion
This test suite provides comprehensive coverage of the JDK Store application's functionality, including:
- Authentication and authorization
- User interface and navigation
- Sales workflow and business logic
- Performance and edge cases
- Error handling and recovery
- Data management and validation

The tests ensure the application's reliability, performance, and user experience across different scenarios and conditions. 