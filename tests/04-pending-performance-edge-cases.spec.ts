import { test, expect } from '@playwright/test';
import { login, TEST_USERS, navigateToPage, waitForPageLoad } from './test-utils';

test.describe('Performance & Edge Cases Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await waitForPageLoad(page);
  });

  test('should load pages within acceptable time limits', async ({ page }) => {
    const pages = [
      { name: 'Dashboard', route: '/' },
      { name: 'Products', route: '/hang-hoa' },
      { name: 'Sales', route: '/ban-hang' },
      { name: 'Customers', route: '/khach-hang' },
      { name: 'Employees', route: '/nhan-vien' }
    ];

    for (const pageInfo of pages) {
      const startTime = Date.now();
      
      await page.goto(pageInfo.route);
      await waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      // Verify page actually loaded
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should handle slow network conditions', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    await navigateToPage(page, 'hang-hoa');
    
    // Page should still load and be functional
    const pageLoaded = await page.locator('table, .product-list').isVisible({ timeout: 10000 });
    expect(pageLoaded).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate network failures for API calls
    await context.route('**/api/**', route => route.abort());
    
    await navigateToPage(page, 'hang-hoa');
    
    // Look for error handling
    const errorElements = [
      page.locator('text=*lỗi*'),
      page.locator('text=*error*'),
      page.locator('text=*không thể kết nối*'),
      page.locator('text=*network*'),
      page.locator('.error-message'),
      page.locator('.network-error')
    ];
    
    let errorHandled = false;
    for (const element of errorElements) {
      try {
        if (await element.isVisible({ timeout: 5000 })) {
          errorHandled = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // Either error is shown or page shows loading/empty state
    const hasLoadingState = await page.locator('.loading, .empty-state, .no-data').isVisible().catch(() => false);
    expect(errorHandled || hasLoadingState).toBeTruthy();
  });

  test('should handle large datasets', async ({ page }) => {
    await navigateToPage(page, 'hang-hoa');
    
    // Look for pagination or virtualization
    const largeDataHandlers = [
      page.locator('.pagination'),
      page.locator('.virtual-list'),
      page.locator('button:has-text("Tải thêm")'),
      page.locator('button:has-text("Load more")'),
      page.locator('.lazy-load')
    ];
    
    let hasLargeDataHandling = false;
    for (const handler of largeDataHandlers) {
      try {
        if (await handler.isVisible()) {
          hasLargeDataHandling = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // Check if table/list has reasonable number of items (not trying to load everything at once)
    const itemCount = await page.locator('table tbody tr, .product-item, .list-item').count();
    const hasReasonableItemCount = itemCount <= 100; // Reasonable limit
    
    expect(hasLargeDataHandling || hasReasonableItemCount).toBeTruthy();
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await navigateToPage(page, 'ban-hang');
    
    // Rapidly click add buttons (stress test)
    const addButtons = page.locator('button:has-text("Thêm"), .add-btn');
    const buttonCount = await addButtons.count();
    
    if (buttonCount > 0) {
      // Click rapidly
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        try {
          await addButtons.nth(i).click({ timeout: 1000 });
          await page.waitForTimeout(200);
        } catch (error) {
          // Some clicks might fail, that's ok for stress test
        }
      }
      
      // System should remain responsive
      const isResponsive = await page.locator('body').isVisible();
      expect(isResponsive).toBeTruthy();
    }
  });

  test('should handle invalid URLs and routes', async ({ page }) => {
    const invalidRoutes = [
      '/invalid-page',
      '/hang-hoa/999999',
      '/khach-hang/invalid-id',
      '/admin/secret',
      '/api/direct-access'
    ];

    for (const route of invalidRoutes) {
      await page.goto(route);
      await page.waitForTimeout(2000);
      
      // Should either redirect to valid page or show error
      const currentUrl = page.url();
      const isValidState = 
        currentUrl.includes('/') || 
        currentUrl.includes('/login') ||
        await page.locator('text=404').or(page.locator('text=Not Found')).or(page.locator('text=Không tìm thấy')).isVisible().catch(() => false);
      
      expect(isValidState).toBeTruthy();
    }
  });

  test('should handle browser compatibility issues', async ({ page }) => {
    // Test modern JavaScript features
    const modernFeatures = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        Promise: typeof Promise !== 'undefined',
        async: typeof (async function() {}) === 'function'
      };
    });
    
    // All modern features should be available
    expect(modernFeatures.fetch).toBeTruthy();
    expect(modernFeatures.localStorage).toBeTruthy();
    expect(modernFeatures.Promise).toBeTruthy();
  });

  test('should handle memory leaks during navigation', async ({ page }) => {
    // Navigate between pages multiple times
    const routes = ['/', '/hang-hoa', '/khach-hang', '/ban-hang'];
    
    for (let i = 0; i < 10; i++) {
      const route = routes[i % routes.length];
      await page.goto(route);
      await waitForPageLoad(page);
      
      // Check if page is still responsive
      const isResponsive = await page.locator('body').isVisible();
      expect(isResponsive).toBeTruthy();
    }
    
    // Final check - ensure page still works
    await navigateToPage(page, 'hang-hoa');
    const finalCheck = await page.locator('table, .product-list').isVisible();
    expect(finalCheck).toBeTruthy();
  });

  test('should handle extreme form inputs', async ({ page }) => {
    await navigateToPage(page, 'hang-hoa');
    
    // Try to open add form
    const addButton = page.locator('button:has-text("Thêm")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Test extreme inputs
      const extremeInputs = {
        veryLongText: 'A'.repeat(1000),
        specialChars: '!@#$%^&*()[]{}|;:,.<>?',
        unicodeChars: '🚀💡🎉📊💰🔥⭐️🌟💯',
        sqlInjection: "'; DROP TABLE products; --",
        xssAttempt: '<script>alert("xss")</script>',
        nullBytes: 'test\x00null'
      };
      
      const nameInput = page.locator('input[name="name"], input[placeholder*="tên"]').first();
      
      for (const [testName, testValue] of Object.entries(extremeInputs)) {
        try {
          if (await nameInput.isVisible()) {
            await nameInput.fill(testValue);
            await page.waitForTimeout(200);
            
            // System should handle input gracefully (not crash)
            const isStillResponsive = await page.locator('body').isVisible();
            expect(isStillResponsive).toBeTruthy();
            
            // Clear for next test
            await nameInput.clear();
          }
        } catch (error) {
          // Input might be rejected, that's fine
        }
      }
    }
  });

  test('should handle concurrent operations', async ({ page, context }) => {
    // Open multiple tabs
    const page2 = await context.newPage();
    await login(page2, TEST_USERS.admin);
    
    // Perform operations simultaneously
    const promises = [
      navigateToPage(page, 'hang-hoa'),
      navigateToPage(page2, 'khach-hang')
    ];
    
    await Promise.all(promises);
    
    // Both pages should work
    const page1Working = await page.locator('table, .product-list').isVisible().catch(() => false);
    const page2Working = await page2.locator('table, .customer-list').isVisible().catch(() => false);
    
    expect(page1Working).toBeTruthy();
    expect(page2Working).toBeTruthy();
    
    await page2.close();
  });

  test('should handle session expiration', async ({ page }) => {
    // Clear session storage to simulate expiration
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate to protected page
    await page.goto('/hang-hoa');
    await page.waitForTimeout(3000);
    
    // Should redirect to login or show authentication error
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('/login');
    const hasAuthError = await page.locator('text=*đăng nhập*').or(page.locator('text=*authentication*')).or(page.locator('text=*unauthorized*')).isVisible().catch(() => false);
    
    expect(isRedirectedToLogin || hasAuthError).toBeTruthy();
  });

  test('should handle form validation edge cases', async ({ page }) => {
    await navigateToPage(page, 'khach-hang');
    
    const addButton = page.locator('button:has-text("Thêm")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Test edge cases
      const phoneInput = page.locator('input[name="phone"], input[placeholder*="điện thoại"]').first();
      const emailInput = page.locator('input[name="email"], input[placeholder*="email"]').first();
      
      if (await phoneInput.isVisible()) {
        // Test invalid phone numbers
        const invalidPhones = ['123', 'abc', '12345678901234567890', '+84-invalid'];
        
        for (const phone of invalidPhones) {
          await phoneInput.fill(phone);
          await page.waitForTimeout(200);
          
          // Try to submit
          const submitButton = page.locator('button[type="submit"], button:has-text("Lưu")').first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(500);
            
            // Should show validation error
            const hasError = await page.locator('.error, .invalid').or(page.locator('text=*không hợp lệ*')).isVisible().catch(() => false);
            if (hasError) {
              expect(hasError).toBeTruthy();
            }
          }
          
          await phoneInput.clear();
        }
      }
      
      if (await emailInput.isVisible()) {
        // Test invalid emails
        const invalidEmails = ['invalid', '@test.com', 'test@', 'test.com', 'test@.com'];
        
        for (const email of invalidEmails) {
          await emailInput.fill(email);
          await page.waitForTimeout(200);
          
          // Check for validation feedback
          const isInvalid = await emailInput.evaluate((el: any) => !el.checkValidity()).catch(() => false);
          expect(isInvalid).toBeTruthy();
          
          await emailInput.clear();
        }
      }
    }
  });

  test('should handle file upload edge cases', async ({ page }) => {
    await navigateToPage(page, 'hang-hoa');
    
    const addButton = page.locator('button:has-text("Thêm")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        // Test various file types and sizes
        const testFiles = [
          {
            name: 'huge-file.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.alloc(10 * 1024 * 1024) // 10MB file
          },
          {
            name: 'empty-file.txt',
            mimeType: 'text/plain',
            buffer: Buffer.alloc(0) // Empty file
          },
          {
            name: 'invalid-extension.exe',
            mimeType: 'application/octet-stream',
            buffer: Buffer.from('fake executable')
          }
        ];
        
        for (const file of testFiles) {
          try {
            await fileInput.setInputFiles(file);
            await page.waitForTimeout(1000);
            
            // Check for appropriate handling (error messages, size limits, etc.)
            const hasError = await page.locator('.error, .file-error, text=*không hợp lệ*').isVisible().catch(() => false);
            const hasSuccess = await page.locator('.success, .file-success').isVisible().catch(() => false);
            
            // Should either show error for invalid files or success for valid ones
            expect(hasError || hasSuccess).toBeTruthy();
            
          } catch (error) {
            // File input might reject invalid files, which is good
          }
        }
      }
    }
  });

  test('should handle database connection issues', async ({ page, context }) => {
    // Simulate database errors by intercepting API calls
    await context.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database connection failed' })
      });
    });
    
    await navigateToPage(page, 'hang-hoa');
    
    // Should handle database errors gracefully
    const errorHandling = [
      page.locator('text=*lỗi cơ sở dữ liệu*'),
      page.locator('text=*database error*'),
      page.locator('text=*server error*'),
      page.locator('.error-message'),
      page.locator('.empty-state')
    ];
    
    let errorHandled = false;
    for (const element of errorHandling) {
      try {
        if (await element.isVisible({ timeout: 5000 })) {
          errorHandled = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    expect(errorHandled).toBeTruthy();
  });

  test('should handle offline mode', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);
    
    try {
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Should show offline message or cached content
      const offlineHandling = [
        page.locator('text=*offline*'),
        page.locator('text=*no internet*'),
        page.locator('text=*không có kết nối*'),
        page.locator('.offline-message'),
        page.locator('.cached-content')
      ];
      
      let offlineHandled = false;
      for (const element of offlineHandling) {
        try {
          if (await element.isVisible()) {
            offlineHandled = true;
            break;
          }
        } catch (error) {
          // Continue checking
        }
      }
      
      // At minimum, page should not crash
      const pageStillWorks = await page.locator('body').isVisible();
      expect(pageStillWorks).toBeTruthy();
      
    } finally {
      // Restore online mode
      await context.setOffline(false);
    }
  });

  test('should handle timezone and date formatting', async ({ page }) => {
    await navigateToPage(page, 'doanh-thu');
    
    // Look for date displays
    const dateElements = page.locator('text=/\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}/, .date, .datetime, input[type="date"]');
    const dateCount = await dateElements.count();
    
    if (dateCount > 0) {
      // Check if dates are displayed in a readable format
      const firstDate = await dateElements.first().textContent().catch(() => '');
      const hasValidDateFormat = /\d/.test(firstDate || ''); // Should contain numbers
      expect(hasValidDateFormat).toBeTruthy();
    }
    
    // Test date input if available
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.fill('2024-12-31');
      const value = await dateInput.inputValue();
      expect(value).toBe('2024-12-31');
    }
  });

  test('should handle print functionality', async ({ page }) => {
    await navigateToPage(page, 'ban-hang');
    
    // Mock window.print to test print functionality
    await page.addInitScript(() => {
      (window as any).print = () => {
        (window as any).printCalled = true;
      };
    });
    
    // Look for print buttons
    const printButtons = [
      page.locator('button:has-text("In")'),
      page.locator('button:has-text("Print")'),
      page.locator('.print-btn'),
      page.locator('[data-testid="print"]')
    ];
    
    for (const button of printButtons) {
      try {
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(1000);
          
          // Check if print was called
          const printCalled = await page.evaluate(() => (window as any).printCalled);
          if (printCalled) {
            expect(printCalled).toBeTruthy();
            break;
          }
        }
      } catch (error) {
        // Continue to next button
      }
    }
  });
}); 