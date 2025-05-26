# Playwright Test Suite for POS System

This project contains comprehensive end-to-end tests for the Vietnamese Point of Sale (POS) system using Playwright.

## 📋 Test Coverage

The test suite covers all major functionalities of the POS system:

### 🔐 Authentication Tests (`01-authentication.spec.ts`)
- ✅ Login/logout functionality
- ✅ Invalid credentials handling
- ✅ Session management
- ✅ Protected route access control
- ✅ Remember me functionality
- ✅ Password visibility toggle

### 📦 Product Management Tests (`02-product-management.spec.ts`)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Product search and filtering
- ✅ Barcode scanning simulation
- ✅ Image upload functionality
- ✅ Form validation
- ✅ Product details viewing

### 💰 Sales Workflow Tests (`03-sales-workflow.spec.ts`)
- ✅ Product selection and cart management
- ✅ Barcode-based product addition
- ✅ Quantity modification
- ✅ Payment processing
- ✅ Multiple payment methods
- ✅ Invoice generation and printing
- ✅ Discount application
- ✅ Customer selection
- ✅ Order hold/save functionality

### 🧭 Navigation & UI Tests (`04-navigation-ui.spec.ts`)
- ✅ Main navigation functionality
- ✅ Page routing and URL handling
- ✅ Responsive design testing
- ✅ Mobile navigation
- ✅ Breadcrumb navigation
- ✅ User menu/profile access
- ✅ Keyboard navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Browser history (back/forward)

### 👥 Customer Management Tests (`05-customer-management.spec.ts`)
- ✅ Customer CRUD operations
- ✅ Customer search and filtering
- ✅ Contact information validation
- ✅ Purchase history viewing
- ✅ Loyalty points management
- ✅ Data import/export functionality
- ✅ Pagination handling
- ✅ Customer grouping/categories

### ⚡ Performance & Edge Cases Tests (`06-performance-edge-cases.spec.ts`)
- ✅ Page load performance testing
- ✅ Network error handling
- ✅ Large dataset management
- ✅ Rapid user interactions
- ✅ Invalid URL handling
- ✅ Browser compatibility
- ✅ Memory leak prevention
- ✅ Extreme form inputs
- ✅ Concurrent operations
- ✅ Session expiration
- ✅ Offline mode handling
- ✅ File upload edge cases

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Install Playwright dependencies:**
   ```bash
   npm install -D @playwright/test
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Verify installation:**
   ```bash
   npx playwright --version
   ```

## 🚀 Running Tests

### Run All Tests
```bash
npm run test
```

### Run Specific Test Files
```bash
# Authentication tests only
npx playwright test tests/01-authentication.spec.ts

# Product management tests only
npx playwright test tests/02-product-management.spec.ts

# Sales workflow tests only
npx playwright test tests/03-sales-workflow.spec.ts

# Navigation and UI tests only
npx playwright test tests/04-navigation-ui.spec.ts

# Customer management tests only
npx playwright test tests/05-customer-management.spec.ts

# Performance and edge cases tests only
npx playwright test tests/06-performance-edge-cases.spec.ts
```

### Run Tests in Different Browsers
```bash
# Run in Chromium only
npx playwright test --project=chromium

# Run in Firefox only
npx playwright test --project=firefox

# Run in WebKit (Safari) only
npx playwright test --project=webkit

# Run in Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Run Tests in Different Modes
```bash
# Run in headed mode (visible browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run with UI mode
npx playwright test --ui

# Run specific test by name
npx playwright test -g "should login successfully"
```

## 📊 Test Reports

### Generate HTML Report
```bash
npx playwright show-report
```

### Generate JSON Report
```bash
npx playwright test --reporter=json
```

### Generate JUnit Report
```bash
npx playwright test --reporter=junit
```

## ⚙️ Configuration

The tests are configured in `playwright.config.ts` with the following features:

- **Multi-browser testing:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Automatic dev server:** Starts your development server automatically
- **Retry logic:** Failed tests are retried automatically in CI
- **Screenshots:** Captured on test failures
- **Videos:** Recorded for failed tests
- **Trace collection:** Detailed execution traces for debugging

## 🧪 Test Data and Utilities

### Test Data (`tests/test-utils.ts`)
- Pre-defined test users (admin, employee)
- Sample product data
- Sample customer data
- Helper functions for common operations

### Helper Functions
- `login(page, user)` - Automated login
- `logout(page)` - Automated logout
- `navigateToPage(page, pageName)` - Navigation helper
- `waitForToast(page, message)` - Toast notification handling
- `fillForm(page, data)` - Form filling automation

## 🔧 Customization

### Adding New Tests
1. Create a new `.spec.ts` file in the `tests/` directory
2. Import necessary utilities from `test-utils.ts`
3. Follow the existing test structure and naming conventions

### Modifying Test Data
Update the `TEST_DATA` object in `tests/test-utils.ts` to match your application's requirements.

### Environment Configuration
Update the `baseURL` in `playwright.config.ts` to match your development/staging environment.

## 📝 Best Practices

### Test Organization
- Tests are organized by feature/functionality
- Each test file focuses on a specific area of the application
- Tests are independent and can run in any order

### Selector Strategy
- Uses multiple selector strategies for robustness:
  - Text-based selectors for user-facing elements
  - Data-testid attributes for reliable targeting
  - CSS selectors as fallbacks
  - Vietnamese and English text support

### Error Handling
- Tests include comprehensive error handling
- Graceful fallbacks when elements aren't found
- Timeout handling for slow operations

### Maintainability
- Shared utilities reduce code duplication
- Descriptive test names and comments
- Modular test structure for easy updates

## 🐛 Troubleshooting

### Common Issues

1. **Tests failing due to timing issues:**
   ```bash
   # Increase timeout in test
   await page.waitForTimeout(2000);
   ```

2. **Element not found errors:**
   ```bash
   # Use multiple selector strategies
   const element = page.locator('button:has-text("Save")').or(page.locator('[data-testid="save-btn"]'));
   ```

3. **Authentication issues:**
   ```bash
   # Update credentials in test-utils.ts
   export const TEST_USERS = {
     admin: { username: 'your-admin@email.com', password: 'your-password' }
   };
   ```

### Debug Mode
Run tests in debug mode to step through execution:
```bash
npx playwright test --debug
```

### Visual Debugging
Use Playwright's trace viewer for detailed debugging:
```bash
npx playwright show-trace trace.zip
```

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

## ⚖️ License

This test suite is part of the POS system project and follows the same license terms. 

# Chạy tất cả tests
npm run test

# Chạy test theo chức năng
npm run test:auth          # Test đăng nhập
npm run test:products      # Test quản lý sản phẩm  
npm run test:sales         # Test bán hàng
npm run test:customers     # Test khách hàng
npm run test:performance   # Test hiệu suất

# Chạy ở chế độ có giao diện
npm run test:headed

# Chạy debug mode
npm run test:debug 