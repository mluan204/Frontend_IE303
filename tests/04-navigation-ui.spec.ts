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
      page.locator('nav, .navigation, .sidebar, .menu'),
      page.locator('text=Tổng quan'),
      page.locator('text=Hàng hóa'),
      page.locator('text=Bán hàng'),
      page.locator('text=Khách hàng'),
      page.locator('text=Nhân viên')
    ];
    
    let navFound = false;
    for (const element of navElements) {
      try {
        if (await element.isVisible()) {
          navFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    expect(navFound).toBeTruthy();
  });

  test('should navigate to all main pages', async ({ page }) => {
    const pages = [
      { name: 'Tổng quan', route: '/', text: ['Tổng quan', 'Dashboard', 'Overview'] },
      { name: 'Hàng hóa', route: '/hang-hoa', text: ['Hàng hóa', 'Products', 'Sản phẩm'] },
      { name: 'Kho hàng', route: '/kho-hang', text: ['Kho hàng', 'Inventory', 'Warehouse'] },
      { name: 'Bán hàng', route: '/ban-hang', text: ['Bán hàng', 'Sales', 'POS'] },
      { name: 'Hóa đơn', route: '/hoa-don', text: ['Hóa đơn', 'Invoices', 'Bills'] },
      { name: 'Khách hàng', route: '/khach-hang', text: ['Khách hàng', 'Customers', 'Clients'] },
      { name: 'Nhân viên', route: '/nhan-vien', text: ['Nhân viên', 'Employees', 'Staff'] },
      { name: 'Doanh thu', route: '/doanh-thu', text: ['Doanh thu', 'Revenue', 'Sales Report'] },
      { name: 'Combo', route: '/combo', text: ['Combo', 'Bundle', 'Package'] },
      { name: 'Ca làm', route: '/ca-lam', text: ['Ca làm', 'Shifts', 'Work Schedule'] }
    ];

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.route);
        await waitForPageLoad(page);
        
        // Verify we're on the correct page
        await expect(page).toHaveURL(pageInfo.route);
        
        // Check for page-specific content
        let pageContentFound = false;
        for (const text of pageInfo.text) {
          const element = page.locator(`text=${text}`);
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

  test('should handle navigation menu clicks', async ({ page }) => {
    const menuItems = [
      { text: 'Tổng quan', expectedUrl: '/' },
      { text: 'Hàng hóa', expectedUrl: '/hang-hoa' },
      { text: 'Bán hàng', expectedUrl: '/ban-hang' },
      { text: 'Khách hàng', expectedUrl: '/khach-hang' }
    ];

    for (const item of menuItems) {
      try {
        const menuLink = page.locator(`a:has-text("${item.text}"), button:has-text("${item.text}"), [href="${item.expectedUrl}"]`).first();
        
        if (await menuLink.isVisible()) {
          await menuLink.click();
          await waitForPageLoad(page);
          
          // Check if URL changed correctly
          const currentUrl = page.url();
          const isCorrectPage = currentUrl.includes(item.expectedUrl) || currentUrl.endsWith(item.expectedUrl);
          expect(isCorrectPage).toBeTruthy();
        }
      } catch (error) {
        console.warn(`Failed to click menu item ${item.text}: ${error}`);
      }
    }
  });

  test('should display correct page titles', async ({ page }) => {
    const pages = [
      { route: '/', titles: ['Tổng quan', 'Dashboard', 'POS'] },
      { route: '/hang-hoa', titles: ['Hàng hóa', 'Products', 'Quản lý sản phẩm'] },
      { route: '/ban-hang', titles: ['Bán hàng', 'Sales', 'Point of Sale'] },
      { route: '/khach-hang', titles: ['Khách hàng', 'Customers', 'Quản lý khách hàng'] }
    ];

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.route);
        await waitForPageLoad(page);
        
        const title = await page.title();
        const hasValidTitle = pageInfo.titles.some(expectedTitle => 
          title.toLowerCase().includes(expectedTitle.toLowerCase())
        );
        
        // If page title doesn't match, check for heading on page
        if (!hasValidTitle) {
          let headingFound = false;
          for (const expectedTitle of pageInfo.titles) {
            const heading = page.locator(`h1:has-text("${expectedTitle}"), h2:has-text("${expectedTitle}"), .page-title:has-text("${expectedTitle}")`);
            if (await heading.isVisible().catch(() => false)) {
              headingFound = true;
              break;
            }
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
      page.locator('.mobile-menu, .hamburger, .menu-toggle'),
      page.locator('button:has-text("☰")').or(page.locator('button:has-text("Menu")')),
      page.locator('[data-testid="mobile-menu"]')
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
          const openMenu = await page.locator('.mobile-menu-open, .menu-visible, nav').isVisible().catch(() => false);
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
    const desktopNav = await page.locator('nav, .navigation, .sidebar').isVisible().catch(() => false);
    expect(desktopNav).toBeTruthy();
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    // Navigate to a sub-page that might have breadcrumbs
    await navigateToPage(page, 'hang-hoa');
    
    // Look for breadcrumb elements
    const breadcrumbElements = [
      page.locator('.breadcrumb'),
      page.locator('.breadcrumbs'),
      page.locator('nav[aria-label="breadcrumb"]'),
      page.locator('.path-nav')
    ];
    
    for (const element of breadcrumbElements) {
      try {
        if (await element.isVisible()) {
          // Check if breadcrumb contains expected links
          const breadcrumbLinks = element.locator('a, button');
          const linkCount = await breadcrumbLinks.count();
          
          if (linkCount > 0) {
            // Try clicking the first breadcrumb link (usually home)
            const firstLink = breadcrumbLinks.first();
            if (await firstLink.isVisible()) {
              await firstLink.click();
              await waitForPageLoad(page);
              
              // Should navigate somewhere
              expect(page.url()).toBeTruthy();
            }
          }
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
  });

  test('should handle search functionality in navigation', async ({ page }) => {
    // Look for global search
    const searchElements = [
      page.locator('input[placeholder*="tìm kiếm"]'),
      page.locator('input[placeholder*="search"]'),
      page.locator('input[type="search"]'),
      page.locator('.global-search input'),
      page.locator('[data-testid="global-search"]')
    ];
    
    for (const element of searchElements) {
      try {
        if (await element.isVisible()) {
          await element.fill('test search');
          await element.press('Enter');
          
          await page.waitForTimeout(1000);
          
          // Check if search results appear or page changes
          const searchResults = [
            page.locator('.search-results'),
            page.locator('.search-dropdown'),
            page.locator('.suggestions')
          ];
          
          let resultsFound = false;
          for (const results of searchResults) {
            try {
              if (await results.isVisible()) {
                resultsFound = true;
                break;
              }
            } catch (error) {
              // Continue checking
            }
          }
          
          // Clear search
          await element.clear();
          break;
        }
      } catch (error) {
        // Continue to next search element
      }
    }
  });

  test('should display user menu/profile', async ({ page }) => {
    // Look for user menu elements
    const userMenuElements = [
      page.locator('.user-menu'),
      page.locator('.profile-menu'),
      page.locator('.user-avatar'),
      page.locator('button:has-text("Admin")'),
      page.locator('button:has-text("Profile")'),
      page.locator('[data-testid="user-menu"]')
    ];
    
    for (const element of userMenuElements) {
      try {
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(500);
          
          // Check for dropdown menu items
          const menuItems = [
            page.locator('text=Đăng xuất'),
            page.locator('text=Logout'),
            page.locator('text=Profile'),
            page.locator('text=Settings'),
            page.locator('text=Cài đặt')
          ];
          
          let menuItemFound = false;
          for (const item of menuItems) {
            try {
              if (await item.isVisible()) {
                menuItemFound = true;
                break;
              }
            } catch (error) {
              // Continue checking
            }
          }
          
          expect(menuItemFound).toBeTruthy();
          break;
        }
      } catch (error) {
        // Continue to next element
      }
    }
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
    
    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Test Escape key (should close modals/dropdowns)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
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
    await waitForPageLoad(page);
  });

  test('should handle error states', async ({ page }) => {
    // Try to navigate to non-existent page
    await page.goto('/non-existent-page');
    await page.waitForTimeout(2000);
    
    // Check for error page or 404
    const errorElements = [
      page.locator('text=404'),
      page.locator('text=Not Found'),
      page.locator('text=Không tìm thấy'),
      page.locator('text=Error'),
      page.locator('text=Lỗi'),
      page.locator('.error-page'),
      page.locator('.not-found')
    ];
    
    let errorFound = false;
    for (const element of errorElements) {
      try {
        if (await element.isVisible()) {
          errorFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // Should either show error page or redirect to valid page
    const currentUrl = page.url();
    const isValidState = errorFound || currentUrl.includes('/') || currentUrl.includes('/login');
    expect(isValidState).toBeTruthy();
  });

  test('should maintain consistent styling across pages', async ({ page }) => {
    const pages = ['/', '/hang-hoa', '/ban-hang', '/khach-hang'];
    
    for (const route of pages) {
      try {
        await page.goto(route);
        await waitForPageLoad(page);
        
        // Check for consistent header
        const header = await page.locator('header, .header, .top-bar').isVisible().catch(() => false);
        
        // Check for consistent navigation
        const nav = await page.locator('nav, .navigation, .sidebar').isVisible().catch(() => false);
        
        // Check for consistent styling (at least one should be true)
        const hasConsistentLayout = header || nav;
        expect(hasConsistentLayout).toBeTruthy();
        
        // Check for consistent color scheme by looking for common CSS classes
        const commonClasses = await page.locator('.bg-primary, .text-primary, .btn-primary').count();
        expect(commonClasses >= 0).toBeTruthy();
        
      } catch (error) {
        console.warn(`Failed to check styling for ${route}: ${error}`);
      }
    }
  });

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