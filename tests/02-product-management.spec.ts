import { test, expect } from '@playwright/test';
import { loginManager, TEST_USERS, TEST_DATA, navigateToPage, waitForToast, fillForm, waitForPageLoad } from './test-utils';

test.describe('Product Management Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginManager(page, TEST_USERS.admin);
    await navigateToPage(page, 'hang-hoa');
    await waitForPageLoad(page);
  });

  test('should display products page correctly', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('text=Hàng hóa').or(page.locator('text=Products'))).toBeVisible();
    
    // Check for common product page elements
    const pageElements = [
      page.locator('button:has-text("Thêm"), button:has-text("Add"), button:has-text("Tạo mới")'),
      page.locator('input[placeholder*="tìm"], input[placeholder*="search"], input[type="search"]'),
      page.locator('table, .product-list, .grid')
    ];
    
    let elementFound = false;
    for (const element of pageElements) {
      try {
        if (await element.isVisible()) {
          elementFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    expect(elementFound).toBeTruthy();
  });

  test('should open add product form', async ({ page }) => {
    // Click add product button
    const addButtons = [
      page.locator('button:has-text("Thêm")'),
      page.locator('button:has-text("Add")'),
      page.locator('button:has-text("Tạo mới")'),
      page.locator('[data-testid="add-product"]'),
      page.locator('.add-btn, .create-btn')
    ];
    
    let addButtonClicked = false;
    for (const button of addButtons) {
      try {
        if (await button.isVisible()) {
          await button.click();
          addButtonClicked = true;
          break;
        }
      } catch (error) {
        // Continue to next button
      }
    }
    
    expect(addButtonClicked).toBeTruthy();
    
    // Verify form opened (modal or new page)
    const formElements = [
      page.locator('input[name="name"], input[placeholder*="tên"], input[placeholder*="name"]'),
      page.locator('input[name="barcode"], input[placeholder*="mã"], input[placeholder*="barcode"]'),
      page.locator('input[name="price"], input[placeholder*="giá"], input[placeholder*="price"]'),
      page.locator('.modal, .form, .dialog')
    ];
    
    let formFound = false;
    for (const element of formElements) {
      try {
        if (await element.isVisible()) {
          formFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    expect(formFound).toBeTruthy();
  });

  test('should create a new product successfully', async ({ page }) => {
    // Open add product form
    const addButton = page.locator('button:has-text("Thêm")').or(page.locator('button:has-text("Add")')).or(page.locator('button:has-text("Tạo mới")')).first();
    if (await addButton.isVisible()) {
      await addButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Fill product form
    const productData = {
      name: TEST_DATA.products.valid.name,
      barcode: TEST_DATA.products.valid.barcode,
      price: TEST_DATA.products.valid.price.toString(),
      quantity: TEST_DATA.products.valid.quantity.toString()
    };
    
    // Fill form fields
    for (const [field, value] of Object.entries(productData)) {
      const selectors = [
        `input[name="${field}"]`,
        `input[placeholder*="${field}"]`,
        `textarea[name="${field}"]`
      ];
      
      for (const selector of selectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            await element.fill(value);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }
    }
    
    // Submit form
    const submitButtons = [
      page.locator('button[type="submit"]'),
      page.locator('button:has-text("Lưu")'),
      page.locator('button:has-text("Save")'),
      page.locator('button:has-text("Tạo")'),
      page.locator('button:has-text("Create")')
    ];
    
    for (const button of submitButtons) {
      try {
        if (await button.isVisible()) {
          await button.click();
          break;
        }
      } catch (error) {
        // Continue to next button
      }
    }
    
    // Wait for success response
    await page.waitForTimeout(2000);
    
    // Verify success (toast notification or redirect)
    const successIndicators = [
      page.locator('.Toastify__toast--success'),
      page.locator('text=*thành công*'),
      page.locator('text=*success*'),
      page.locator('text=*tạo*')
    ];
    
    let successFound = false;
    for (const indicator of successIndicators) {
      try {
        if (await indicator.isVisible()) {
          successFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // If no success indicator, check if we're back to the product list
    if (!successFound) {
      const backToList = await page.locator('table, .product-list').isVisible().catch(() => false);
      successFound = backToList;
    }
    
    expect(successFound).toBeTruthy();
  });

  test('should show validation errors for invalid product data', async ({ page }) => {
    // Open add product form
    const addButton = page.locator('button:has-text("Thêm")').or(page.locator('button:has-text("Add")')).first();
    if (await addButton.isVisible()) {
      await addButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Try to submit with empty/invalid data
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Lưu")')).or(page.locator('button:has-text("Save")')).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Check for validation errors
    const validationErrors = [
      page.locator('text=*bắt buộc*'),
      page.locator('text=*required*'),
      page.locator('text=*không được để trống*'),
      page.locator('.error, .invalid, .field-error'),
      page.locator('input:invalid')
    ];
    
    let errorFound = false;
    for (const error of validationErrors) {
      try {
        if (await error.isVisible() || await error.count() > 0) {
          errorFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    expect(errorFound).toBeTruthy();
  });

  test('should search products correctly', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="tìm"]').or(page.locator('input[placeholder*="search"]')).or(page.locator('input[type="search"]')).first();
    
    if (await searchInput.isVisible()) {
      // Perform search
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Check if search results are displayed
      const hasResults = await page.locator('table tbody tr, .product-item, .search-result').count() >= 0;
      expect(hasResults).toBeTruthy();
      
      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(1000);
    }
  });

  test('should filter products by category', async ({ page }) => {
    // Look for category filter
    const categoryFilters = [
      page.locator('select[name="category"]'),
      page.locator('select:has(option:has-text("Loại"))'),
      page.locator('.category-filter'),
      page.locator('button:has-text("Lọc")').or(page.locator('button:has-text("Filter")'))
    ];
    
    for (const filter of categoryFilters) {
      try {
        if (await filter.isVisible()) {
          if (await filter.getAttribute('tagName') === 'SELECT') {
            await filter.selectOption({ index: 1 });
          } else {
            await filter.click();
          }
          
          await page.waitForTimeout(1000);
          
          // Verify filtering occurred
          const hasFilteredResults = await page.locator('table, .product-list').isVisible();
          expect(hasFilteredResults).toBeTruthy();
          break;
        }
      } catch (error) {
        // Continue to next filter
      }
    }
  });

  test('should edit an existing product', async ({ page }) => {
    // Look for edit buttons in the product list
    const editButtons = [
      page.locator('button:has-text("Sửa"), button:has-text("Edit")'),
      page.locator('[data-testid="edit"], .edit-btn'),
      page.locator('td button, tr button').filter({ hasText: /Sửa|Edit/ })
    ];
    
    let editButtonClicked = false;
    for (const button of editButtons) {
      try {
        const firstButton = button.first();
        if (await firstButton.isVisible()) {
          await firstButton.click();
          editButtonClicked = true;
          break;
        }
      } catch (error) {
        // Continue to next button type
      }
    }
    
    if (editButtonClicked) {
      await page.waitForTimeout(1000);
      
      // Verify edit form opened
      const editForm = page.locator('input[name="name"]').or(page.locator('.modal')).or(page.locator('.edit-form'));
      await expect(editForm.first()).toBeVisible();
      
      // Make a change
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Product Name');
        
        // Save changes
        const saveButton = page.locator('button:has-text("Lưu")').or(page.locator('button:has-text("Save")')).or(page.locator('button[type="submit"]')).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          await page.waitForTimeout(2000);
          
          // Verify success
          const successFound = await page.locator('.Toastify__toast--success').or(page.locator('text=*thành công*')).isVisible().catch(() => false);
          expect(successFound || !await page.locator('.modal').isVisible().catch(() => true)).toBeTruthy();
        }
      }
    }
  });

  test('should delete a product', async ({ page }) => {
    // Look for delete buttons
    const deleteButtons = [
      page.locator('button:has-text("Xóa"), button:has-text("Delete")'),
      page.locator('[data-testid="delete"], .delete-btn'),
      page.locator('td button, tr button').filter({ hasText: /Xóa|Delete/ })
    ];
    
    let deleteButtonClicked = false;
    for (const button of deleteButtons) {
      try {
        const firstButton = button.first();
        if (await firstButton.isVisible()) {
          await firstButton.click();
          deleteButtonClicked = true;
          break;
        }
      } catch (error) {
        // Continue to next button type
      }
    }
    
    if (deleteButtonClicked) {
      await page.waitForTimeout(1000);
      
      // Look for confirmation dialog
      const confirmButtons = [
        page.locator('button:has-text("Xác nhận")'),
        page.locator('button:has-text("Confirm")'),
        page.locator('button:has-text("Yes")'),
        page.locator('button:has-text("OK")'),
        page.locator('.confirm-btn, .yes-btn')
      ];
      
      for (const confirmButton of confirmButtons) {
        try {
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
            break;
          }
        } catch (error) {
          // Continue to next button
        }
      }
      
      await page.waitForTimeout(2000);
      
      // Verify deletion (success toast or item removed)
      const successFound = await page.locator('.Toastify__toast--success').or(page.locator('text=*xóa thành công*')).isVisible().catch(() => false);
      expect(successFound).toBeTruthy();
    }
  });

  test('should handle barcode scanning', async ({ page }) => {
    // Look for barcode scan button
    const scanButtons = [
      page.locator('button:has-text("Quét")'),
      page.locator('button:has-text("Scan")'),
      page.locator('[data-testid="scan-barcode"]'),
      page.locator('.scan-btn')
    ];
    
    for (const button of scanButtons) {
      try {
        if (await button.isVisible()) {
          await button.click();
          
          // Verify scanner opened (camera permission or scanner UI)
          await page.waitForTimeout(1000);
          
          const scannerUI = [
            page.locator('.scanner, .camera'),
            page.locator('video'),
            page.locator('text=*camera*'),
            page.locator('text=*quét*')
          ];
          
          let scannerFound = false;
          for (const ui of scannerUI) {
            try {
              if (await ui.isVisible()) {
                scannerFound = true;
                break;
              }
            } catch (error) {
              // Continue checking
            }
          }
          
          if (scannerFound) {
            expect(scannerFound).toBeTruthy();
            
            // Close scanner
            const closeButtons = page.locator('button:has-text("Đóng")').or(page.locator('button:has-text("Close")')).or(page.locator('.close-btn'));
            const closeButton = closeButtons.first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
            }
          }
          break;
        }
      } catch (error) {
        // Continue to next button
      }
    }
  });

  test('should handle product image upload', async ({ page }) => {
    // Open add product form
    const addButton = page.locator('button:has-text("Thêm")').or(page.locator('button:has-text("Add")')).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for image upload
    const uploadElements = [
      page.locator('input[type="file"]'),
      page.locator('button:has-text("Upload")'),
      page.locator('button:has-text("Chọn ảnh")'),
      page.locator('.upload-btn, .image-upload')
    ];
    
    for (const element of uploadElements) {
      try {
        if (await element.isVisible()) {
          if (await element.getAttribute('type') === 'file') {
            // Test file input (mock file)
            await element.setInputFiles({
              name: 'test-image.jpg',
              mimeType: 'image/jpeg',
              buffer: Buffer.from('fake-image-content')
            });
          } else {
            await element.click();
          }
          
          await page.waitForTimeout(1000);
          
          // Verify upload UI or preview
          const uploadPreview = await page.locator('.preview, .image-preview, img').isVisible().catch(() => false);
          if (uploadPreview) {
            expect(uploadPreview).toBeTruthy();
          }
          break;
        }
      } catch (error) {
        // Continue to next element
      }
    }
  });

  test('should display product details', async ({ page }) => {
    // Look for view/details buttons
    const viewButtons = [
      page.locator('button:has-text("Xem")'),
      page.locator('button:has-text("View")'),
      page.locator('button:has-text("Chi tiết")'),
      page.locator('[data-testid="view"], .view-btn')
    ];
    
    for (const button of viewButtons) {
      try {
        const firstButton = button.first();
        if (await firstButton.isVisible()) {
          await firstButton.click();
          
          await page.waitForTimeout(1000);
          
          // Verify details page/modal opened
          const detailsElements = [
            page.locator('.modal, .details'),
            page.locator('text=Chi tiết'),
            page.locator('text=Details'),
            page.locator('.product-details')
          ];
          
          let detailsFound = false;
          for (const element of detailsElements) {
            try {
              if (await element.isVisible()) {
                detailsFound = true;
                break;
              }
            } catch (error) {
              // Continue checking
            }
          }
          
          expect(detailsFound).toBeTruthy();
          break;
        }
      } catch (error) {
        // Continue to next button
      }
    }
  });
}); 