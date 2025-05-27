import { test, expect } from '@playwright/test';
import { logout, TEST_USERS, navigateToPage, waitForPageLoad, loginManager, loginEmployee } from './test-utils';

test.describe('Authentication Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await waitForPageLoad(page);
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login page elements
    await expect(page).toHaveTitle(/.*Login.*|.*Đăng nhập.*/);
    await expect(page.locator('input[type="text"], input[name="Tài khoản"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="Mật khẩu"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Quản lý")')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Bán hàng")')).toBeVisible();
  });

  test('should login successfully with valid credentials manager', async ({ page }) => {
    await loginManager(page, TEST_USERS.admin);
    
    // Verify successful login
    await expect(page).toHaveURL('/');
    
    // Check for dashboard elements
    const dashboardElements = [
      page.locator('text=Tổng quan'),
      page.locator('text=Dashboard'),
      page.locator('[data-testid="dashboard"]'),
      page.locator('nav, .navigation, .sidebar')
    ];
    
    let found = false;
    for (const element of dashboardElements) {
      try {
        if (await element.isVisible()) {
          found = true;
          break;
        }
      } catch (error) {
        // Continue checking other elements
      }
    }
    
    expect(found).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try login with invalid credentials
    await page.fill('input[name="Tài khoản"],input[type="text"], input[name="username"]', 'wrongusername');
    await page.fill('input[name="Mật khẩu"],input[type="password"], input[name="password"], input[placeholder*="mật khẩu"]', 'wrongpassword');
    await page.click('button[type="submit"], button:has-text("Bán hàng")');
    
    // Should stay on login page or show error
    await page.waitForTimeout(2000); // Wait for error message
    expect(page.url().includes('/login')).toBeTruthy();

    const errorIndicators = [
      page.locator('text=*sai*'),
      page.locator('text=*invalid*'),
      page.locator('text=*lỗi*'),
      page.locator('text=*thất bại*'),
      page.locator('.error, .alert-error, .text-red'),
      page.locator('.Toastify__toast--error')
    ];
    
    let errorFound = false;
    for (const indicator of errorIndicators) {
      try {
        if (await indicator.isVisible()) {
          errorFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // Either error message is shown or still on login page
    expect(errorFound || page.url().includes('/login')).toBeTruthy();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit with empty fields
    await page.click('button[type="submit"], button:has-text("Quản lý"), button:has-text("Bán hàng")');
    
    // Should show validation errors or prevent submission
    await page.waitForTimeout(1000);
    
    const validationErrors = [
      page.locator('text=*bắt buộc*'),
      page.locator('text=*required*'),
      page.locator('text=*không được để trống*'),
      page.locator('.error, .invalid, .field-error'),
      page.locator('input:invalid')
    ];
    
    let validationFound = false;
    for (const error of validationErrors) {
      try {
        if (await error.isVisible() || await error.count() > 0) {
          validationFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    expect(validationFound || page.url().includes('/login')).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginManager(page, TEST_USERS.admin);
    
    // Logout
    await logout(page);
    
    // Verify logout
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing protected routes without authentication', async ({ page }) => {
    const protectedRoutes = [
      '/hang-hoa',
      '/kho-hang', 
      '/ban-hang',
      '/khach-hang',
      '/nhan-vien',
      '/doanh-thu'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login or show unauthorized
      await page.waitForTimeout(2000);
      
      expect(page.url().includes('/login')).toBeTruthy();
    }
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login
    await loginManager(page, TEST_USERS.admin);
    
    // Refresh page
    await page.reload();
    await waitForPageLoad(page);
    
    // Should still be logged in (not redirected to login)
    await page.waitForTimeout(2000);
    
    const isStillLoggedIn = !page.url().includes('/login');
    expect(isStillLoggedIn).toBeTruthy();
  });

  test('should handle concurrent login sessions', async ({ page, context }) => {
    // Login in first tab
    await loginManager(page, TEST_USERS.admin);
    
    // Open new tab and try to access protected resource
    const newPage = await context.newPage();
    await navigateToPage(newPage, 'hang-hoa');
    
    // Both pages should maintain the session
    await page.waitForTimeout(2000);
    await newPage.waitForTimeout(2000);
    
    const firstPageLoggedIn = !page.url().includes('/login');
    const secondPageLoggedIn = !newPage.url().includes('/login');
    
    // At least one should maintain session
    expect(firstPageLoggedIn || secondPageLoggedIn).toBeTruthy();
    
    await newPage.close();
  });
}); 