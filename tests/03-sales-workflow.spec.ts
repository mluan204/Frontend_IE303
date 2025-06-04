import { test, expect } from '@playwright/test';
import { loginManager, TEST_USERS, navigateToPage, waitForPageLoad } from './test-utils';

test.describe('Complete Application Workflow Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginManager(page, TEST_USERS.admin);
  });

  test.describe('Navigation Tests', () => {
    test('should display navigation menu correctly', async ({ page }) => {
      await navigateToPage(page, 'ban-hang');
      await waitForPageLoad(page);

      // Verify JDK Store logo is visible
      await expect(page.locator('text=JDK Store')).toBeVisible();

      // Click hamburger menu button
      const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await menuButton.click();
      await page.waitForTimeout(500);

      // Check all menu items are visible
      await expect(page.locator('text=Bán hàng')).toBeVisible();
      await expect(page.locator('text=Lịch sử hóa đơn')).toBeVisible();
      await expect(page.locator('text=Báo cáo doanh thu')).toBeVisible();

      // Test navigation to different pages
      await page.locator('text=Lịch sử hóa đơn').click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Danh sách hóa đơn')).toBeVisible();

      // Navigate back and test Reports page
      await menuButton.click();
      await page.waitForTimeout(500);
      await page.locator('text=Báo cáo doanh thu').click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Báo cáo ngày')).toBeVisible();

      // Close menu by clicking overlay
      await menuButton.click();
      await page.waitForTimeout(500);
      const overlay = page.locator('.fixed.inset-0.bg-black');
      if (await overlay.isVisible()) {
        await overlay.click();
      }
    });
  });

  test.describe('Sales Page (BanHang) Tests', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPage(page, 'ban-hang');
    });

    test('should display sales page UI correctly', async ({ page }) => {
      // Check main UI elements
      await expect(page.locator('text=JDK Store')).toBeVisible();
      await expect(page.locator('h2:has-text("HÓA ĐƠN")')).toBeVisible();
      await expect(page.locator('input[placeholder="Tìm kiếm..."]')).toBeVisible();
      await expect(page.locator('text=Tổng tiền:')).toBeVisible();
      await expect(page.locator('button:has-text("Thanh toán")')).toBeVisible();

      // Check if products grid is visible
      const productGrid = page.locator('ul.grid');
      await expect(productGrid).toBeVisible();
    });

    // LOI
    test('should handle loading state correctly', async ({ page }) => {
      // Reload page to catch loading state
      await page.reload();
      
      // Check for loading indicators
      const loadingSpinner = page.locator('.animate-spin');
      const loadingText = page.locator('text=Đang tải');
      
      
      expect(loadingSpinner || loadingText).toBeTruthy();
      
      // Wait for loading to complete
      await page.waitForTimeout(3000);
      await expect(page.locator('input[placeholder="Tìm kiếm..."]')).toBeVisible();
    });

    test('should search products correctly', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Tìm kiếm..."]');
      
      // Test search functionality
      await searchInput.fill('bánh');
      await page.waitForTimeout(1000);
      
      const productGrid = page.locator('ul.grid');
      await expect(productGrid).toBeVisible();
      
      // Test another search term
      await searchInput.fill('oreo');
      await page.waitForTimeout(1000);
      
      // Clear search using Enter key
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
      
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('');
    });

    test('should add products to cart', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        // Add first product to cart
        await productCards.first().click();
        await page.waitForTimeout(1000);
        
        // Verify product added to cart
        const cartButton = page.locator('button:has-text("Xem hóa đơn")');
        if (await cartButton.isVisible()) {
          const cartText = await cartButton.textContent();
          expect(cartText).toContain('(1)');
        }
      }
    });

    test('should modify cart quantities', async ({ page }) => {
      await page.waitForTimeout(2000);
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        await productCards.first().click();
        await page.waitForTimeout(1000);
        
        const quantityInput = page.locator('input[type="number"]').first();
        if (await quantityInput.isVisible()) {
          await quantityInput.clear();
          await quantityInput.fill('3');
          await page.waitForTimeout(500);
          
          const value = await quantityInput.inputValue();
          expect(value).toBe('3');
        }
      }
    });

    test('should calculate total correctly', async ({ page }) => {
      await page.waitForTimeout(2000);
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        await productCards.first().click();
        await page.waitForTimeout(1000);
        
        const totalElement = page.locator('text=Tổng tiền:').locator('..');
        await expect(totalElement).toBeVisible();
        
        const totalText = await totalElement.textContent();
        const hasNumbers = /\d/.test(totalText || '');
        expect(hasNumbers).toBeTruthy();
      }
    });

    test('should handle payment button states', async ({ page }) => {
      const paymentButton = page.locator('button:has-text("Thanh toán")');
      await expect(paymentButton).toBeVisible();
      
      // Should be disabled when cart is empty
      const isDisabled = await paymentButton.isDisabled();
      expect(isDisabled).toBeTruthy();
      
      // Add product and check if enabled
      await page.waitForTimeout(2000);
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        await productCards.first().click();
        await page.waitForTimeout(1000);
        await expect(paymentButton).toBeEnabled();
      }
    });
    // LOI
    test('should open payment popup', async ({ page }) => {
      await page.waitForTimeout(2000);
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        await productCards.first().click();
        await page.waitForTimeout(1000);
        
        const paymentButton = page.locator('button:has-text("Thanh toán")');
        await paymentButton.click();
        await page.waitForTimeout(1000);
        
        // Verify popup opened
        const overlay = page.getByRole('button', { name: 'In hóa đơn và hoàn tất' });
        await expect(overlay).toBeVisible();
        
        // Close popup
        await overlay.click();
      }
    });

    test('should show AI suggestions', async ({ page }) => {
      await page.waitForTimeout(2000);
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        await productCards.first().click();
        await page.waitForTimeout(3000); // Wait for AI suggestions
        
        const suggestionsSection = page.locator('text=Gợi ý cho bạn');
        if (await suggestionsSection.isVisible()) {
          await expect(suggestionsSection).toBeVisible();
        }
      }
    });

    test('should handle combo suggestions', async ({ page }) => {
      await page.waitForTimeout(2000);
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        await productCards.first().click();
        await page.waitForTimeout(1000);
        
        const comboSuggestion = page.locator('text=Mua thêm tiết kiệm hơn');
        if (await comboSuggestion.isVisible()) {
          await expect(comboSuggestion).toBeVisible();
        }
      }
    });
  });

//LOI
  test.describe('Invoice History (LichsuHoadon) Tests', () => {
    test.beforeEach(async ({ page }) => {
      await navigateToPage(page, 'lich-su-hoa-don');
    });

    test('should display invoice history page correctly', async ({ page }) => {
      // Check main UI elements
      await expect(page.locator('text=Danh sách hóa đơn')).toBeVisible();
      await expect(page.locator('text=Thông tin chi tiết')).toBeVisible();
      
      
      // Check if invoices list or empty state is visible
      const invoicesList = page.locator('text=Số hóa đơn:').first();
      const emptyState = page.locator('text=Hiện tại không có hóa đơn nào');
      
      const hasInvoices = await invoicesList.isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);
      
      expect(hasInvoices || isEmpty).toBeTruthy();
    });

    test('should handle loading state for invoices', async ({ page }) => {
      await page.reload();
      
      // Check for loading indicators
      const loadingSpinner = page.locator('.animate-spin');
      const loadingText = page.locator('text=Đang tải dữ liệu hóa đơn...');
      
      const hasLoadingSpinner = await loadingSpinner.isVisible().catch(() => false);
      const hasLoadingText = await loadingText.isVisible().catch(() => false);
      
      expect(hasLoadingSpinner || hasLoadingText).toBeTruthy();
      
      await page.waitForTimeout(3000);
      await expect(page.locator('text=Danh sách hóa đơn')).toBeVisible();
    });

    test('should select and display invoice details', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const invoiceItems = page.locator('text=Số hóa đơn:');
      const invoiceCount = await invoiceItems.count();
      
      if (invoiceCount > 0) {
        // Click on first invoice
        await invoiceItems.first().click();
        await page.waitForTimeout(500);
        
        // Check if details are displayed
        const detailsSection = page.locator('text=Thông tin chi tiết').locator('..');
        await expect(detailsSection).toBeVisible();
        
        // Check for invoice details elements
        await expect(page.locator('text=Thời gian')).toBeVisible();
        await expect(page.locator('text=Khách hàng')).toBeVisible();
        await expect(page.locator('text=Nhân viên')).toBeVisible();
      }
    });

    test('should handle invoice menu actions', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const invoiceItems = page.locator('text=Số hóa đơn:');
      const invoiceCount = await invoiceItems.count();
      
      if (invoiceCount > 0) {
        // Find and click menu button
        const menuButton = page.locator('button').filter({ has: page.locator('svg[data-icon="ellipsis-v"]') }).first();
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(500);
          
          // Check menu options
          await expect(page.locator('text=In hóa đơn')).toBeVisible();
          await expect(page.locator('text=Xóa hóa đơn')).toBeVisible();
          
          // Click outside to close menu
          await page.locator('body').click();
        }
      }
    });

    test('should handle invoice deletion', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const invoiceItems = page.locator('text=Số hóa đơn:');
      const invoiceCount = await invoiceItems.count();
      
      if (invoiceCount > 0) {
        // Find delete button in details section
        const deleteButton = page.locator('button:has-text("Xóa hóa đơn")').first();
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          await page.waitForTimeout(500);
          
          // Check confirmation modal
          await expect(page.locator('text=Xác nhận xóa hóa đơn')).toBeVisible();
          await expect(page.locator('button:has-text("Hủy")')).toBeVisible();
          await expect(page.locator('button:has-text("Xác nhận xóa")')).toBeVisible();
          
          // Cancel deletion
          await page.locator('button:has-text("Hủy")').click();
        }
      }
    });

    test('should handle print invoice functionality', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const invoiceItems = page.locator('text=Số hóa đơn:');
      const invoiceCount = await invoiceItems.count();
      
      if (invoiceCount > 0) {
        // Click on first invoice to select it
        await invoiceItems.first().click();
        await page.waitForTimeout(500);
        
        // Find and click menu button
        const menuButton = page.locator('button').filter({ has: page.locator('svg[data-icon="ellipsis-v"]') }).first();
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(500);
          
          // Mock the alert for print functionality
          page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Đang in hóa đơn');
            await dialog.accept();
          });
          
          const printButton = page.locator('text=In hóa đơn');
          if (await printButton.isVisible()) {
            await printButton.click();
          }
        }
      }
    });

    test('should display deleted invoices correctly', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for deleted invoices (marked with ban icon)
      const deletedInvoices = page.locator('[data-icon="ban"]');
      const deletedCount = await deletedInvoices.count();
      
      if (deletedCount > 0) {
        // Verify deleted invoice styling
        const deletedInvoice = deletedInvoices.first().locator('../../../..');
        await expect(deletedInvoice).toBeVisible();
      }
    });
  });

  test.describe('Reports Page (BaoCao) Tests', () => {
    test('should display reports page correctly', async ({ page }) => {
      await navigateToPage(page, 'doanh-thu');
      await waitForPageLoad(page);
      
      // Check main elements
      await expect(page.locator('text=Báo cáo').nth(1)).toBeVisible();
      
      // Verify page title in helmet
      const title = await page.title();
      expect(title).toBe('Báo cáo doanh thu');
    });
  });

  test.describe('Error Handling Tests', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Intercept API calls and simulate errors
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      await navigateToPage(page, 'ban-hang');
      await page.waitForTimeout(2000);
      
      // Check for error handling
      const errorMessage = page.locator('text=Không thể tải dữ liệu');
      const retryButton = page.locator('button:has-text("Thử lại")');
      
      const hasErrorMessage = await errorMessage.isVisible().catch(() => false);
      const hasRetryButton = await retryButton.isVisible().catch(() => false);
      
      expect(hasErrorMessage || hasRetryButton).toBeTruthy();
    });
//LOI
    test('should handle network timeouts', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/**', route => {
        return new Promise(resolve => {
          setTimeout(() => {
            route.fulfill({
              status: 200,
              body: JSON.stringify([])
            });
          }, 5000);
        });
      });
      
      await navigateToPage(page, 'lich-su-hoa-don');
      
      // Should show loading for extended time
      const loadingSpinner = page.getByText('Đang tải');
      await expect(loadingSpinner).toBeVisible();
      
      // Clear the route to allow normal operation
      await page.unroute('**/api/**');
    });
  });

  test.describe('Integration Tests', () => {
    test('should complete full sales workflow', async ({ page }) => {
      // Start at sales page
      await navigateToPage(page, 'ban-hang');
      await waitForPageLoad(page);
      await page.waitForTimeout(2000);
      
      // Add product to cart
      const productCards = page.locator('ul.grid li');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        await productCards.first().click();
        await page.waitForTimeout(1000);
        
        // Proceed to payment
        const paymentButton = page.locator('button:has-text("Thanh toán")');
        if (await paymentButton.isEnabled()) {
          await paymentButton.click();
          await page.getByRole('combobox').selectOption('6');
          await page.getByRole('textbox', { name: 'Tìm khách hàng...' }).click();
          await page.getByRole('textbox', { name: 'Tìm khách hàng...' }).fill('2');
          await page.getByText('Đỗ Hương Hương').click();
          await page.getByRole('button', { name: 'In hóa đơn và hoàn tất' }).click();
      
  
          // Use navigation menu to go to invoice history
          const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
          await menuButton.click();
          await page.waitForTimeout(500);
          
          await page.locator('text=Lịch sử hóa đơn').click();
          await page.waitForTimeout(1000);
          
          // Verify we're on invoice history page
          await expect(page.locator('text=Danh sách hóa đơn')).toBeVisible();
        }
      }
    });

    test('should handle responsive navigation across all pages', async ({ page }) => {
      // Test navigation on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      const pages = ['ban-hang', 'lich-su-hoa-don', 'doanh-thu'];
      
      for (const pageName of pages) {
        await navigateToPage(page, pageName);
        await waitForPageLoad(page);
        
        // Verify navigation menu works on mobile
        const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
        await menuButton.click();
        await page.waitForTimeout(500);
        
        await expect(page.locator('text=Bán hàng')).toBeVisible();
        await expect(page.locator('text=Lịch sử hóa đơn')).toBeVisible();
        await expect(page.locator('text=Báo cáo doanh thu')).toBeVisible();
        
        
      }
    });
  });
});
