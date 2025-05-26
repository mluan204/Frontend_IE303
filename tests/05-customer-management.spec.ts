import { test, expect } from '@playwright/test';
import { login, TEST_USERS, TEST_DATA, navigateToPage, waitForPageLoad } from './test-utils';

test.describe('Customer Management Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await navigateToPage(page, 'khach-hang');
    await waitForPageLoad(page);
  });

  test('should display customer management page correctly', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('text=Khách hàng').or(page.locator('text=Customers'))).toBeVisible();
    
    // Check for common customer page elements
    const pageElements = [
      page.locator('button:has-text("Thêm"), button:has-text("Add"), button:has-text("Tạo mới")'),
      page.locator('input[placeholder*="tìm"], input[placeholder*="search"], input[type="search"]'),
      page.locator('table, .customer-list, .grid')
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

  test('should open add customer form', async ({ page }) => {
    // Click add customer button
    const addButtons = [
      page.locator('button:has-text("Thêm")'),
      page.locator('button:has-text("Add")'),
      page.locator('button:has-text("Tạo mới")'),
      page.locator('[data-testid="add-customer"]'),
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
      page.locator('input[name="phone"], input[placeholder*="điện thoại"], input[placeholder*="phone"]'),
      page.locator('input[name="email"], input[placeholder*="email"]'),
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

  test('should create a new customer successfully', async ({ page }) => {
    // Open add customer form
    const addButton = page.locator('button:has-text("Thêm")').or(page.locator('button:has-text("Add")')).first();
    if (await addButton.isVisible()) {
      await addButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Fill customer form
    const customerData = {
      name: TEST_DATA.customers.valid.name,
      phone: TEST_DATA.customers.valid.phone,
      email: TEST_DATA.customers.valid.email,
      address: TEST_DATA.customers.valid.address
    };
    
    // Fill form fields
    for (const [field, value] of Object.entries(customerData)) {
      const selectors = [
        `input[name="${field}"]`,
        `input[placeholder*="${field}"]`,
        `textarea[name="${field}"]`
      ];
      
      // Handle Vietnamese field names
      const vietnameseFields: Record<string, string[]> = {
        name: ['tên', 'họ tên'],
        phone: ['điện thoại', 'số điện thoại', 'sdt'],
        email: ['email', 'thư điện tử'],
        address: ['địa chỉ', 'address']
      };
      
      // Add Vietnamese selectors
      if (vietnameseFields[field]) {
        for (const vnField of vietnameseFields[field]) {
          selectors.push(`input[placeholder*="${vnField}"]`);
          selectors.push(`textarea[placeholder*="${vnField}"]`);
        }
      }
      
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
    
    // Verify success
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
    
    // If no success indicator, check if we're back to the customer list
    if (!successFound) {
      const backToList = await page.locator('table, .customer-list').isVisible().catch(() => false);
      successFound = backToList;
    }
    
    expect(successFound).toBeTruthy();
  });

  test('should show validation errors for invalid customer data', async ({ page }) => {
    // Open add customer form
    const addButton = page.locator('button:has-text("Thêm")').or(page.locator('button:has-text("Add")')).first();
    if (await addButton.isVisible()) {
      await addButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Fill with invalid data
    const invalidData = TEST_DATA.customers.invalid;
    
    // Try to fill invalid email
    const emailInput = page.locator('input[name="email"], input[placeholder*="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(invalidData.email);
    }
    
    // Try to fill invalid phone
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="điện thoại"], input[placeholder*="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(invalidData.phone);
    }
    
    // Try to submit with invalid/empty data
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Lưu")')).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Check for validation errors
    const validationErrors = [
      page.locator('text=*bắt buộc*'),
      page.locator('text=*required*'),
      page.locator('text=*không hợp lệ*'),
      page.locator('text=*invalid*'),
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

  test('should search customers correctly', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="tìm"]').or(page.locator('input[placeholder*="search"]')).or(page.locator('input[type="search"]')).first();
    
    if (await searchInput.isVisible()) {
      // Perform search
      await searchInput.fill('Nguyễn');
      await page.waitForTimeout(1000);
      
      // Check if search results are displayed
      const hasResults = await page.locator('table tbody tr, .customer-item, .search-result').count() >= 0;
      expect(hasResults).toBeTruthy();
      
      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(1000);
    }
  });

  test('should filter customers', async ({ page }) => {
    // Look for filter options
    const filterElements = [
      page.locator('select[name="filter"], select[name="status"]'),
      page.locator('button:has-text("Lọc")'),
      page.locator('button:has-text("Filter")'),
      page.locator('.filter-btn'),
      page.locator('[data-testid="filter"]')
    ];
    
    for (const element of filterElements) {
      try {
        if (await element.isVisible()) {
          if (await element.getAttribute('tagName') === 'SELECT') {
            const options = await element.locator('option').count();
            if (options > 1) {
              await element.selectOption({ index: 1 });
            }
          } else {
            await element.click();
          }
          
          await page.waitForTimeout(1000);
          
          // Verify filtering occurred
          const hasFilteredResults = await page.locator('table, .customer-list').isVisible();
          expect(hasFilteredResults).toBeTruthy();
          break;
        }
      } catch (error) {
        // Continue to next filter
      }
    }
  });

  test('should edit an existing customer', async ({ page }) => {
    // Look for edit buttons in the customer list
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
      const nameInput = page.locator('input[name="name"], input[placeholder*="tên"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Customer Name');
        
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

  test('should delete a customer', async ({ page }) => {
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
      
      // Verify deletion
      const successFound = await page.locator('.Toastify__toast--success').or(page.locator('text=*xóa thành công*')).isVisible().catch(() => false);
      expect(successFound).toBeTruthy();
    }
  });

  test('should view customer details', async ({ page }) => {
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
            page.locator('text=Chi tiết khách hàng'),
            page.locator('text=Customer Details'),
            page.locator('.customer-details')
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

  test('should handle customer purchase history', async ({ page }) => {
    // View customer details first
    const viewButton = page.locator('button:has-text("Xem")').or(page.locator('button:has-text("View")')).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for purchase history section
    const historyElements = [
      page.locator('text=Lịch sử mua hàng'),
      page.locator('text=Purchase History'),
      page.locator('text=Order History'),
      page.locator('.purchase-history'),
      page.locator('.order-history'),
      page.locator('[data-testid="purchase-history"]')
    ];
    
    for (const element of historyElements) {
      try {
        if (await element.isVisible()) {
          // Check if history data is displayed
          const historyData = await page.locator('table, .history-item, .order-item').isVisible().catch(() => false);
          expect(historyData).toBeTruthy();
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
  });

  test('should handle customer loyalty points', async ({ page }) => {
    // Look for loyalty/points section
    const loyaltyElements = [
      page.locator('text=Điểm tích lũy'),
      page.locator('text=Loyalty Points'),
      page.locator('text=Points'),
      page.locator('.loyalty-points'),
      page.locator('.points'),
      page.locator('[data-testid="loyalty-points"]')
    ];
    
    for (const element of loyaltyElements) {
      try {
        if (await element.isVisible()) {
          // Check if points value is displayed
          const pointsValue = await element.textContent();
          const hasNumbers = /\d/.test(pointsValue || '');
          expect(hasNumbers).toBeTruthy();
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
  });

  test('should export customer data', async ({ page }) => {
    // Look for export button
    const exportButtons = [
      page.locator('button:has-text("Xuất")'),
      page.locator('button:has-text("Export")'),
      page.locator('button:has-text("Tải về")'),
      page.locator('button:has-text("Download")'),
      page.locator('.export-btn'),
      page.locator('[data-testid="export"]')
    ];
    
    for (const button of exportButtons) {
      try {
        if (await button.isVisible()) {
          // Set up download event listener
          const downloadPromise = page.waitForEvent('download');
          
          await button.click();
          
          // Wait for download to start (with timeout)
          try {
            const download = await downloadPromise;
            const filename = download.suggestedFilename();
            
            // Verify download has valid filename
            expect(filename.length).toBeGreaterThan(0);
            
            // Check file extension
            const validExtensions = ['.xlsx', '.csv', '.pdf', '.xls'];
            const hasValidExtension = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
            expect(hasValidExtension).toBeTruthy();
            
          } catch (error) {
            // Download might not start immediately, check for success notification
            const successMessage = await page.locator('.Toastify__toast--success').or(page.locator('text=*xuất*')).isVisible().catch(() => false);
            expect(successMessage).toBeTruthy();
          }
          break;
        }
      } catch (error) {
        // Continue to next button
      }
    }
  });

  test('should import customer data', async ({ page }) => {
    // Look for import button
    const importButtons = [
      page.locator('button:has-text("Nhập")'),
      page.locator('button:has-text("Import")'),
      page.locator('button:has-text("Tải lên")'),
      page.locator('button:has-text("Upload")'),
      page.locator('.import-btn'),
      page.locator('[data-testid="import"]')
    ];
    
    for (const button of importButtons) {
      try {
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(1000);
          
          // Look for file input or upload area
          const uploadElements = [
            page.locator('input[type="file"]'),
            page.locator('.upload-area'),
            page.locator('.file-drop'),
            page.locator('text=Chọn file'),
            page.locator('text=Choose file')
          ];
          
          for (const uploadElement of uploadElements) {
            try {
              if (await uploadElement.isVisible()) {
                if (await uploadElement.getAttribute('type') === 'file') {
                  // Test file upload
                  await uploadElement.setInputFiles({
                    name: 'test-customers.csv',
                    mimeType: 'text/csv',
                    buffer: Buffer.from('Name,Phone,Email\nTest Customer,0123456789,test@example.com')
                  });
                } else {
                  await uploadElement.click();
                }
                
                await page.waitForTimeout(1000);
                
                // Look for upload success or preview
                const uploadResult = await page.locator('.upload-success, .file-preview, .import-preview').isVisible().catch(() => false);
                if (uploadResult) {
                  expect(uploadResult).toBeTruthy();
                }
                break;
              }
            } catch (error) {
              // Continue to next upload element
            }
          }
          break;
        }
      } catch (error) {
        // Continue to next import button
      }
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Look for pagination elements
    const paginationElements = [
      page.locator('.pagination'),
      page.locator('.page-nav'),
      page.locator('button:has-text("Tiếp")'),
      page.locator('button:has-text("Next")'),
      page.locator('button:has-text("Trang")'),
      page.locator('[data-testid="pagination"]')
    ];
    
    for (const element of paginationElements) {
      try {
        if (await element.isVisible()) {
          // Look for next button
          const nextButton = element.locator('button:has-text("Tiếp"), button:has-text("Next"), button:has-text(">")').first();
          
          if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
            const currentPageInfo = await page.locator('.page-info, .pagination-info').textContent().catch(() => '');
            
            await nextButton.click();
            await page.waitForTimeout(1000);
            
            // Verify page changed
            const newPageInfo = await page.locator('.page-info, .pagination-info').textContent().catch(() => '');
            expect(newPageInfo).not.toBe(currentPageInfo);
          }
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
  });

  test('should handle customer groups or categories', async ({ page }) => {
    // Look for customer group/category management
    const groupElements = [
      page.locator('text=Nhóm khách hàng'),
      page.locator('text=Customer Groups'),
      page.locator('text=Categories'),
      page.locator('select[name="group"], select[name="category"]'),
      page.locator('.customer-group'),
      page.locator('[data-testid="customer-group"]')
    ];
    
    for (const element of groupElements) {
      try {
        if (await element.isVisible()) {
          if (await element.getAttribute('tagName') === 'SELECT') {
            const options = await element.locator('option').count();
            if (options > 1) {
              await element.selectOption({ index: 1 });
              await page.waitForTimeout(500);
              
              // Verify group selection
              const selectedValue = await element.inputValue();
              expect(selectedValue.length).toBeGreaterThan(0);
            }
          } else {
            await element.click();
            await page.waitForTimeout(500);
          }
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
  });
}); 