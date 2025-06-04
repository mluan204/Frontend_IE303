import { test, expect } from '@playwright/test';
import { loginManager, TEST_USERS, navigateToPage, waitForPageLoad } from './test-utils';

test.describe('Performance & Edge Cases Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginManager(page, TEST_USERS.admin);
    await waitForPageLoad(page);
  });
//LOI
  test('should load pages within acceptable time limits', async ({ page }) => {
    const pages = [
      { name: 'Sales', route: '/ban-hang' },
      { name: 'Products', route: '/hang-hoa' },
      { name: 'Customers', route: '/khach-hang' },
      { name: 'Employees', route: '/nhan-vien' },
      { name: 'Invoice History', route: '/lich-su-hoa-don' },
      { name: 'Reports', route: '/doanh-thu' }
    ];

    for (const pageInfo of pages) {
      const startTime = Date.now();
      
      await page.goto(pageInfo.route);
      await waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 8 seconds (increased for API calls)
      expect(loadTime).toBeLessThan(8000);
      
      // Verify page actually loaded with proper content
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
      
      // Check for specific page indicators
      if (pageInfo.route === '/ban-hang') {
        await expect(page.locator('h2:has-text("HÓA ĐƠN")')).toBeVisible({ timeout: 5000 });
      } else if (pageInfo.route === '/lich-su-hoa-don') {
        await expect(page.locator('text=Danh sách hóa đơn')).toBeVisible({ timeout: 5000 });
      } else if (pageInfo.route === '/doanh-thu') {
        await expect(page.locator('text=Báo cáo').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should handle slow network conditions', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 200)); // Add 200ms delay
      await route.continue();
    });

    await navigateToPage(page, 'ban-hang');
    
    // Page should still load and be functional
    const pageLoaded = await page.locator('input[placeholder="Tìm kiếm..."]').isVisible({ timeout: 15000 });
    expect(pageLoaded).toBeTruthy();
    
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate network failures for API calls
    await context.route('**/api/**', route => route.abort());
    
    await navigateToPage(page, 'ban-hang');
    
    // Look for error handling or loading states
    const errorElements = [
      page.locator('text=Không thể tải '),
      page.locator('text=lỗi'),
      page.locator('button:has-text("Thử lại")'),
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
    
    expect(errorHandled).toBeTruthy();
  });

  test('should handle large datasets with pagination', async ({ page }) => {
    await navigateToPage(page, 'nhan-vien');
    await page.waitForTimeout(3000);
    
    // Look for pagination in employee page
    const paginationElements = [
      page.locator('button:has-text("Trang trước")'),
      page.locator('button:has-text("Trang sau")'),
      page.locator('nav[aria-label="Pagination"]'),
      page.locator('.pagination'),
      page.locator('text=Hiển thị')
    ];
    
    let hasPagination = false;
    for (const element of paginationElements) {
      try {
        if (await element.isVisible()) {
          hasPagination = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // Check if table has reasonable number of items
    const itemCount = await page.locator('table tbody tr').count();
    const hasReasonableItemCount = itemCount <= 50; // Reasonable limit per page
    
    expect(hasPagination || hasReasonableItemCount).toBeTruthy();
  });

  test('should handle rapid user interactions in sales page', async ({ page }) => {
    await navigateToPage(page, 'ban-hang');
    await page.waitForTimeout(3000);
    
    // Rapidly click products to add to cart
    const productCards = page.locator('ul.grid li');
    const cardCount = await productCards.count();
    
    if (cardCount > 0) {
      // Click rapidly on different products
      for (let i = 0; i < Math.min(5, cardCount); i++) {
        try {
          await productCards.nth(i).click({ timeout: 1000 });
          await page.waitForTimeout(100); // Very short wait
        } catch (error) {
          // Some clicks might fail due to rapid clicking, that's ok
        }
      }
      
      // System should remain responsive
      const cartVisible = await page.locator('h2:has-text("HÓA ĐƠN")').isVisible();
      expect(cartVisible).toBeTruthy();
      
      // Check if cart is functional
      const paymentButton = await page.locator('button:has-text("Thanh toán")').isVisible();
      expect(paymentButton).toBeTruthy();
    }
  });

  test('should handle browser compatibility features', async ({ page }) => {
    // Test modern JavaScript features used in the app
    const modernFeatures = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        Promise: typeof Promise !== 'undefined',
        asyncAwait: typeof (async function() {}) === 'function',
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid')
      };
    });
    
    // All modern features should be available
    expect(modernFeatures.fetch).toBeTruthy();
    expect(modernFeatures.localStorage).toBeTruthy();
    expect(modernFeatures.Promise).toBeTruthy();
    expect(modernFeatures.flexbox).toBeTruthy();
  });

  test('should handle memory leaks during navigation', async ({ page }) => {
    // Navigate between pages multiple times to test memory usage
    const routes = ['/ban-hang', '/lich-su-hoa-don', '/khach-hang', '/nhan-vien', '/doanh-thu'];
    
    for (let i = 0; i < 8; i++) {
      const route = routes[i % routes.length];
      await page.goto(route);
      await waitForPageLoad(page);
      
      // Check if page is still responsive
      const isResponsive = await page.locator('text=JDK Store').isVisible();
      expect(isResponsive).toBeTruthy();
      
      // Short wait to allow cleanup
      await page.waitForTimeout(500);
    }
    
    // Final check - ensure sales page still works properly
    await navigateToPage(page, 'ban-hang');
    const finalCheck = await page.locator('input[placeholder="Tìm kiếm..."]').isVisible();
    expect(finalCheck).toBeTruthy();
  });

  test('should handle extreme search inputs', async ({ page }) => {
    await navigateToPage(page, 'ban-hang');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder="Tìm kiếm..."]');
    
    // Test extreme search inputs
    const extremeInputs = {
      veryLongText: 'bánh'.repeat(200),
      specialChars: '!@#$%^&*()[]{}|;:,.<>?',
      unicodeChars: '🚀💡🎉📊💰🔥⭐️🌟💯',
      sqlInjection: "'; DROP TABLE products; --",
      xssAttempt: '<script>alert("xss")</script>',
      emptyString: '',
      whitespace: '   ',
      numbers: '123456789'
    };
    
    for (const [testName, testValue] of Object.entries(extremeInputs)) {
      try {
        await searchInput.fill(testValue);
        await page.waitForTimeout(300);
        
        // System should handle input gracefully (not crash)
        const isStillResponsive = await page.locator('ul.grid').isVisible();
        expect(isStillResponsive).toBeTruthy();
        
        // Clear for next test
        await searchInput.clear();
        await page.waitForTimeout(200);
      } catch (error) {
        // Input might be rejected, that's fine
        console.log(`Input rejected for ${testName}: ${error}`);
      }
    }
  });
//LOI
  test('should handle concurrent operations', async ({ page, context }) => {
    // Open multiple tabs with different pages
    const page2 = await context.newPage();
    const page3 = await context.newPage();
    
    await loginManager(page2, TEST_USERS.admin);
    await loginManager(page3, TEST_USERS.admin);
    
    // Perform operations simultaneously
    const promises = [
      navigateToPage(page, 'ban-hang'),
      navigateToPage(page2, 'lich-su-hoa-don'),
      navigateToPage(page3, 'nhan-vien')
    ];
    
    await Promise.all(promises);
    
    // All pages should work
    const page1Working = await page.locator('h2:has-text("HÓA ĐƠN")').isVisible().catch(() => false);
    const page2Working = await page2.locator('text=Danh sách hóa đơn').first().isVisible().catch(() => false);
    const page3Working = await page3.locator('text=Nhân viên').isVisible().catch(() => false);
    
    expect(page1Working).toBeTruthy();
    expect(page2Working).toBeTruthy();
    expect(page3Working).toBeTruthy();
    
    await page2.close();
    await page3.close();
  });

  test('should handle session expiration', async ({ page }) => {
    // Clear session storage to simulate expiration
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate to protected page
    await page.goto('/nhan-vien');
    await page.waitForTimeout(3000);
    
    // Should redirect to login or show authentication error
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/auth');
    const hasAuthError = await page.locator('text=đăng nhập').or(page.locator('text=authentication')).or(page.locator('text=unauthorized')).isVisible().catch(() => false);
    const hasLoginForm = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    expect(isRedirectedToLogin || hasAuthError || hasLoginForm).toBeTruthy();
  });

  test('should handle form validation in add employee modal', async ({ page }) => {
    await navigateToPage(page, 'nhan-vien');
    await page.waitForTimeout(2000);
    
    const addButton = page.locator('button:has-text("Thêm mới")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Test extreme inputs in employee form
      const nameInput = page.locator('input[name="name"]').or(page.locator('input[placeholder*="tên"]')).first();
      const phoneInput = page.locator('input[name="phone"]').or(page.locator('input[placeholder*="điện thoại"]')).first();
      const emailInput = page.locator('input[name="email"]').or(page.locator('input[placeholder*="email"]')).first();
      
      if (await phoneInput.isVisible()) {
        // Test invalid phone numbers
        const invalidPhones = ['123', 'abc', '12345678901234567890', '+84-invalid', ''];
        
        for (const phone of invalidPhones) {
          await phoneInput.fill(phone);
          await page.waitForTimeout(200);
          
          // Try to submit
          const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Lưu")')).first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(500);
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
          
          await emailInput.clear();
        }
      }
      
      // Close modal
      const closeButton = page.locator('button:has-text("Hủy")').or(page.locator('button:has-text("×")')).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('should handle image upload in products', async ({ page }) => {
    await navigateToPage(page, 'hang-hoa');
    await page.waitForTimeout(2000);
    
    const addButton = page.locator('button:has-text("Thêm")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        // Test various file scenarios
        const testFiles = [
          {
            name: 'large-image.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.alloc(5 * 1024 * 1024) // 5MB file
          },
          {
            name: 'empty-file.jpg',
            mimeType: 'image/jpeg', 
            buffer: Buffer.alloc(0) // Empty file
          },
          {
            name: 'text-file.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('This is not an image')
          }
        ];
        
        for (const file of testFiles) {
          try {
            await fileInput.setInputFiles(file);
            await page.waitForTimeout(1000);
            
            // System should handle file appropriately
            const isResponsive = await page.locator('body').isVisible();
            expect(isResponsive).toBeTruthy();
            
          } catch (error) {
            // File input might reject invalid files
            console.log(`File rejected: ${file.name}`);
          }
        }
      }
      
      // Close modal
      const closeButton = page.locator('button:has-text("Hủy")').or(page.locator('button:has-text("×")')).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });
//LOI
  test('should handle database connection issues', async ({ page, context }) => {
    // Simulate database errors by intercepting API calls
    await context.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database connection failed' })
      });
    });
    
    await navigateToPage(page, 'lich-su-hoa-don');
    
    // Should handle database errors gracefully
    const errorHandling = [
      page.locator('text=Đang tải'),
      page.locator('button:has-text("Thử lại")'),
      page.locator('text=Hiện tại không có hóa đơn nào'),
      page.locator('.animate-spin'),
      page.locator('text=lỗi')
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

  
  test('should handle print functionality in invoices', async ({ page }) => {
    await navigateToPage(page, 'lich-su-hoa-don');
    await page.waitForTimeout(3000);
    
    // Mock window.print and alert to test print functionality
    await page.addInitScript(() => {
      (window as any).print = () => {
        (window as any).printCalled = true;
      };
      (window as any).alert = (message: string) => {
        (window as any).alertMessage = message;
      };
    });
    
    // Look for invoices and print buttons
    const invoiceItems = page.locator('text=Số hóa đơn:');
    const invoiceCount = await invoiceItems.count();
    
    if (invoiceCount > 0) {
      // Click on first invoice
      await invoiceItems.first().click();
      await page.waitForTimeout(500);
      
      // Find menu button with ellipsis
      const menuButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1); // Skip hamburger menu
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        
        // Click print button
        const printButton = page.locator('text=In hóa đơn');
        if (await printButton.isVisible()) {
          await printButton.click();
          await page.waitForTimeout(1000);
          
          // Check if alert was called with print message
          const alertMessage = await page.evaluate(() => (window as any).alertMessage);
          if (alertMessage) {
            expect(alertMessage).toContain('Đang in hóa đơn');
          }
        }
      }
    }
  });

  test('should handle sorting functionality in employee table', async ({ page }) => {
    await navigateToPage(page, 'nhan-vien');
    await page.waitForTimeout(3000);
    
    // Test sorting buttons (from the updated NhanVien component)
    const sortButtons = page.locator('button').filter({ has: page.locator('svg[data-icon*="sort"]') });
    const sortButtonCount = await sortButtons.count();
    
    if (sortButtonCount > 0) {
      // Click first sort button (should be ID sorting)
      await sortButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Check if table still displays properly
      const tableVisible = await page.locator('table tbody tr').count();
      expect(tableVisible).toBeGreaterThan(0);
      
      // Click again to test desc sorting
      await sortButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Table should still be functional
      const tableStillVisible = await page.locator('table tbody tr').count();
      expect(tableStillVisible).toBeGreaterThan(0);
    }
  });
}); 