import { Page, expect } from '@playwright/test';

export interface TestUser {
  username: string;
  password: string;
}

export const TEST_USERS = {
  admin: {
    username: 'phuongdo',
    password: '123123'
  },
  employee: {
    username: 'employee@test.com', 
    password: 'employee123'
  }
};

export const TEST_DATA = {
  products: {
    valid: {
      name: 'Test Product',
      barcode: 'TEST001',
      price: 50000,
      quantity: 100,
      category: 'Test Category'
    },
    invalid: {
      name: '',
      barcode: '',
      price: -1,
      quantity: -1
    }
  },
  customers: {
    valid: {
      name: 'Nguyễn Văn Test',
      phone: '0123456789',
      email: 'test@example.com',
      address: '123 Test Street, Ho Chi Minh City'
    },
    invalid: {
      name: '',
      phone: 'invalid-phone',
      email: 'invalid-email'
    }
  },
  employees: {
    valid: {
      name: 'Trần Thị Test',
      phone: '0987654321',
      email: 'employee@test.com',
      position: 'Nhân viên bán hàng'
    }
  }
};

/**
 * Login helper function
 */
export async function loginManager(page: Page, user: TestUser) {
  await page.goto('/login');
  await page.fill('input[name="Tài khoản"],input[type="text"], input[name="username"]', user.username);
  await page.fill('input[name="Mật khẩu"],input[type="password"], input[name="password"], input[name="password"]', user.password);
  await page.click('button[type="submit"], button:has-text("Quản lý")');
  
  // Wait for successful login and redirect
  await page.waitForURL('/');
  await expect(page).toHaveURL('/');
}

export async function loginEmployee(page: Page, user: TestUser) {
  await page.goto('/login');
  await page.fill('input[name="Tài khoản"],input[type="text"], input[name="username"]', user.username);
  await page.fill('input[name="Mật khẩu"],input[type="password"], input[name="password"], input[placeholder*="mật khẩu"]', user.password);
  await page.click('button[type="submit"], button:has-text("Bán hàng")');
  
  // Wait for successful login and redirect
  await page.waitForURL('/');
  await expect(page).toHaveURL('/');
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  await page.locator('button[data-testid="account-icon"]').click();

  // Look for logout button or menu
  const logoutSelectors = [
    'button:has-text("Đăng xuất")',
    'button:has-text("Logout")',
    '[data-testid="logout"]',
    'a:has-text("Đăng xuất")'
  ];

  for (const selector of logoutSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        break;
      }
    } catch (error) {
      // Continue to next selector
    }
  }

  // Wait for redirect to login page
  await page.waitForURL('/login');
}

/**
 * Navigate to a specific page in the application
 */
export async function navigateToPage(page: Page, pageName: string) {
  const routes: Record<string, string> = {
    'dashboard': '/',
    'tong-quan': '/',
    'hang-hoa': '/hang-hoa',
    'products': '/hang-hoa',
    'kho-hang': '/kho-hang',
    'inventory': '/kho-hang',
    'ban-hang': '/ban-hang',
    'sales': '/ban-hang',
    'hoa-don': '/hoa-don',
    'invoices': '/hoa-don',
    'khach-hang': '/khach-hang',
    'customers': '/khach-hang',
    'nhan-vien': '/nhan-vien',
    'employees': '/nhan-vien',
    'doanh-thu': '/doanh-thu',
    'revenue': '/doanh-thu',
    'combo': '/combo',
    'ca-lam': '/ca-lam',
    'shifts': '/ca-lam',
    'bao-cao': '/bao-cao',
    'reports': '/bao-cao',
    'lich-su-hoa-don': '/lich-su-hoa-don',
    'invoice-history': '/lich-su-hoa-don'
  };

  const route = routes[pageName.toLowerCase()];
  if (!route) {
    throw new Error(`Unknown page: ${pageName}`);
  }

  await page.goto(route);
}

/**
 * Wait for toast notification and verify message
 */
export async function waitForToast(page: Page, expectedMessage?: string) {
  const toast = page.locator('.Toastify__toast');
  await expect(toast).toBeVisible();
  
  if (expectedMessage) {
    await expect(toast).toContainText(expectedMessage);
  }
  
  return toast;
}

/**
 * Fill form fields based on data object
 */
export async function fillForm(page: Page, data: Record<string, any>) {
  for (const [field, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      // Try multiple selector strategies for each field
      const selectors = [
        `input[name="${field}"]`,
        `input[placeholder*="${field}"]`,
        `textarea[name="${field}"]`,
        `select[name="${field}"]`,
        `[data-testid="${field}"]`
      ];

      let filled = false;
      for (const selector of selectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            if (await element.getAttribute('type') === 'checkbox') {
              if (value) await element.check();
              else await element.uncheck();
            } else {
              await element.fill(String(value));
            }
            filled = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!filled) {
        console.warn(`Could not fill field: ${field}`);
      }
    }
  }
}

/**
 * Wait for page to load completely
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
} 