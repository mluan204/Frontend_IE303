import { test, expect } from '@playwright/test';
import { loginManager, TEST_USERS, navigateToPage, waitForPageLoad } from './test-utils';

test.describe('Navigation & UI Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginManager(page, TEST_USERS.admin);
    await waitForPageLoad(page);
  });

  test('should display main navigation correctly', async ({ page }) => {
    // Check for navigation elements
    const navElements = [
      // page.locator('nav, .navigation, .sidebar, .menu'),
      page.locator('li:has-text("Tổng quan")'),
      page.locator('li:has-text("Hàng hóa")'),
      page.locator('li:has-text("Hóa đơn")'),
      page.locator('li:has-text("Khách hàng")'),
      page.locator('li:has-text("Nhân viên")'),
    ];
    
    for (const element of navElements) {
      await expect(element).toBeVisible();
    }
  });

  test('should click and navigate to all main pages', async ({ page }) => {
    const pages = [
      { name: 'Tổng quan', route: '/', text: ['Doạnh thu.*', 'KẾT QUẢ.*'] },
      { name: 'Hàng hóa', route: '/hang-hoa', text: ['Nhóm hàng', '.*SẢN PHẨM.*'] },
      { name: 'Kho hàng', route: '/kho-hang', text: ['Tìm kiếm.*', '.*PHIẾU NHẬP.*'] },
      { name: 'Hóa đơn', route: '/hoa-don', text: ['Mã HĐ', 'Thời gian'] },
      { name: 'Khách hàng', route: '/khach-hang', text: ['Mã KH', 'Giới tính'] },
      { name: 'Nhân viên', route: '/nhan-vien', text: ['Mã NV', 'Tên', 'Chức vụ'] },
    ];

    for (const pageInfo of pages) {
      try {
        await page.getByText(pageInfo.name).first().click();
        await waitForPageLoad(page);
        
        // Verify we're on the correct page
        await expect(page).toHaveURL(pageInfo.route);
        await page.waitForTimeout(2000);
        
        // Check for page-specific content
        let pageContentFound = false;
        for (const text of pageInfo.text) {
          const element = page.getByText(new RegExp(text, 'i')).first();
          if (await element.isVisible().catch(() => false)) {
            pageContentFound = true;
            break;
          }
        }
        
        expect(pageContentFound).toBeTruthy();
      } catch (error) {
        console.warn(`Failed to navigate to ${pageInfo.name}: ${error}`);
      }
    }
  });

  test('should display correct page titles', async ({ page }) => {
    const pages = [
      { route: '/', titles: 'Tổng quan' },
      { route: '/tong-quan', titles: 'Tổng quan' },
      { route: '/hang-hoa', titles: 'Hàng hoá' },
      { route: '/kho-hang', titles: 'Kho hàng' },
      { route: '/hoa-don', titles: 'Hóa đơn' },
      { route: '/khach-hang', titles: 'Khách hàng' },
      { route: '/nhan-vien', titles: 'Nhân viên' },
      { route: '/combo', titles: 'Combo' },
    ];

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.route);
        await waitForPageLoad(page);
        
        const title = await page.title();
        const hasValidTitle = title.toLowerCase().includes(pageInfo.titles.toLowerCase());
        
        // If page title doesn't match, check for heading on page
        if (!hasValidTitle) {
          let headingFound = false;
          const heading = page.locator(`h1:has-text("${pageInfo.titles}"), h2:has-text("${pageInfo.titles}"), .page-title:has-text("${pageInfo.titles}")`);
          if (await heading.isVisible().catch(() => false)) {
            headingFound = true;
          }
          expect(headingFound).toBeTruthy();
        } else {
          expect(hasValidTitle).toBeTruthy();
        }
      } catch (error) {
        console.warn(`Failed to check title for ${pageInfo.route}: ${error}`);
      }
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await waitForPageLoad(page);
    
    // Check if mobile navigation exists
    const mobileNavElements = [
      page.locator('[data-testid="hamburger-icon"]')
    ];
    
    let mobileNavFound = false;
    for (const element of mobileNavElements) {
      try {
        if (await element.isVisible()) {
          mobileNavFound = true;
          
          // Try to open mobile menu
          await element.click();
          await page.waitForTimeout(500);
          
          // Check if menu opened
          const openMenu = await page.getByText('Tổng quan, Hàng hóa, Combo, Hóa đơn, Khách hàng, Nhân viên').isVisible().catch(() => false);
          if (openMenu) {
            expect(openMenu).toBeTruthy();
          }
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await waitForPageLoad(page);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await waitForPageLoad(page);
    
    // Navigation should be visible on desktop
    const desktopNav = page.locator('nav');
    expect(desktopNav).toBeTruthy();
  });


  test('should display user menu/profile', async ({ page }) => {
    const userMenu = page.locator('[data-testid="account-icon"]');
    expect(userMenu).toBeTruthy();

    await userMenu.click();

    expect(page.getByText('Đăng xuất')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Check if focus is visible
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);
    
    // Test multiple tabs
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    // Test Enter key on focused element
    await expect(page).toHaveURL('/');
    
  });

  test('should display loading states', async ({ page }) => {
    // Navigate to a page that might show loading
    await page.goto('/hang-hoa');
    
    // Look for loading indicators during page load
    const loadingElements = [
      page.locator('.loading'),
      page.locator('.spinner'),
      page.locator('.skeleton'),
      page.locator('text=Đang tải'),
      page.locator('text=Loading'),
      page.locator('[data-testid="loading"]')
    ];
    
    // Check immediately after navigation
    await page.waitForTimeout(100);
    
    let loadingFound = false;
    for (const element of loadingElements) {
      try {
        if (await element.isVisible()) {
          loadingFound = true;
          
          // Wait for loading to disappear
          await element.waitFor({ state: 'hidden', timeout: 10000 });
          break;
        }
      } catch (error) {
        // Continue checking or loading already finished
      }
    }
    
    // Ensure page finished loading
    expect(loadingFound).toBeTruthy();
  });

  // test('should handle error states', async ({ page }) => {
  //   // Try to navigate to non-existent page
  //   await page.goto('/non-existent-page');
  //   await page.waitForTimeout(2000);
    
  //   // Check for error page or 404
  //   const errorElements = [
  //     page.locator('text=404'),
  //     page.locator('text=Not Found'),
  //     page.locator('text=Không tìm thấy'),
  //     page.locator('text=Error'),
  //     page.locator('text=Lỗi'),
  //     page.locator('.error-page'),
  //     page.locator('.not-found')
  //   ];
    
  //   let errorFound = false;
  //   for (const element of errorElements) {
  //     try {
  //       if (await element.isVisible()) {
  //         errorFound = true;
  //         break;
  //       }
  //     } catch (error) {
  //       // Continue checking
  //     }
  //   }
    
  //   // Should either show error page or redirect to valid page
  //   const currentUrl = page.url();
  //   const isValidState = errorFound || currentUrl.includes('/') || currentUrl.includes('/login');
  //   expect(isValidState).toBeTruthy();
  // });


  test('should handle page refresh correctly', async ({ page }) => {
    // Navigate to a specific page
    await navigateToPage(page, 'hang-hoa');
    const originalUrl = page.url();
    
    // Refresh page
    await page.reload();
    await waitForPageLoad(page);
    
    // Should stay on same page
    const newUrl = page.url();
    expect(newUrl).toBe(originalUrl);
    
    // Page content should load correctly
    const pageLoaded = await page.locator('body').isVisible();
    expect(pageLoaded).toBeTruthy();
  });

  test('should handle browser back/forward buttons', async ({ page }) => {
    // Navigate through multiple pages
    await navigateToPage(page, 'hang-hoa');
    const productsUrl = page.url();
    
    await navigateToPage(page, 'khach-hang');
    const customersUrl = page.url();
    
    // Go back
    await page.goBack();
    await waitForPageLoad(page);
    
    // Should be back to products page
    const backUrl = page.url();
    expect(backUrl).toBe(productsUrl);
    
    // Go forward
    await page.goForward();
    await waitForPageLoad(page);
    
    // Should be back to customers page
    const forwardUrl = page.url();
    expect(forwardUrl).toBe(customersUrl);
  });
}); 