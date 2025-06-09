interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  suppliers: string | null;
  quantityAvailable: number;
  dateExpired: string | null;
  salePrice: number | null;
  inputPrice: number;
  price: number;
  categoryId: number;
  categoryName: string;
}

interface ComboProduct {
  productId: number;
  price: number;
  quantity: number;
}

interface CreateComboRequest {
  timeEnd: string;
  comboProducts: ComboProduct[];
}

interface ProductSales {
  productId: number;
  totalQuantity: number;
}

interface CartItem {
  productId: number;
  quantity: number;
}

interface ComboList {
  id: number;
  comboProducts: number[];
}

// Thêm interfaces cho dữ liệu cửa hàng
interface Employee {
  id: number;
  created_at: string | null;
  name: string;
  gender: boolean;
  birthday: string | null;
  image: string | null;
  salary: number;
  phone_number: string;
  email: string | null;
  address: string | null;
  position: string | null;
  employeeShifts: number[];
  bills: number[];
  receipts: number[];
}

interface Customer {
  id: number;
  created_at: string | null;
  name: string;
  gender: boolean;
  score: number;
  phone_number: string;
  bills: number[];
}

interface BillDetail {
  productId: number;
  productName: string;
  price: number;
  afterDiscount: number;
  quantity: number;
}

interface Bill {
  id: number;
  total_cost: number;
  after_discount: number;
  customer: Customer;
  employee: Employee;
  billDetails: BillDetail[];
  pointsToUse: number | null;
  isDeleted: boolean;
  is_error: boolean;
  createdAt: string;
  totalQuantity: number;
  notes: string;
}

interface ReceiptDetail {
  productId: number;
  supplier: string | null;
  quantity: number;
  input_price: number;
  productName: string;
  check: boolean;
}

interface Receipt {
  id: number;
  created_at: string;
  total_cost: number;
  note: string;
  employee_name: string;
  receipt_details: ReceiptDetail[];
}

interface StoreData {
  products: Product[];
  combos: number[][];
  bills: Bill[];
  receipts: Receipt[];
  employees: Employee[];
  customers: Customer[];
}

interface QueryIntent {
  type: 'product' | 'combo' | 'bill' | 'receipt' | 'employee' | 'customer' | 'sales' | 'inventory' | 'unknown';
  subtype?: string;
  filters?: {
    name?: string;
    category?: string;
    employee?: string;
    customer?: string;
    product?: string;
    timeRange?: string;
  };
  aggregation?: 'count' | 'sum' | 'max' | 'min' | 'list';
  isStoreRelated: boolean;
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY }`;   

export const generateComboSuggestion = async (products: Product[], salesData: ProductSales[], comboList: ComboList[]): Promise<CreateComboRequest> => {
  const sliceProducts = products.slice(0, 10);
  
  try {
    // Get current date and calculate dates
    const now = new Date();
    const oneWeekLater = new Date(now);
    oneWeekLater.setDate(now.getDate() + 7);
    const twoWeeksLater = new Date(now);
    twoWeeksLater.setDate(now.getDate() + 14);

    const prompt = `You are a retail expert. Your task is to create an attractive combo deal that includes products that are about to expire and logical product combination.
    Analyze the following products and their sales data to create a combo that:
    1. Prioritizes products with approaching expiration dates
    2. Pairs them with complementary products that customers would likely buy together
    3. Sets attractive prices that encourage quick sales while maintaining profitability
    4. Suggests reasonable quantities based on typical customer purchase patterns
    5. Focuses on products with low sales volume to help clear inventory
    6. IMPORTANT: Do not create a combo that already exists in the comboList

    Return the response in this exact JSON format:
    {
      "timeEnd": "YYYY-MM-DD", // Must be between ${oneWeekLater.toISOString().split('T')[0]} and ${twoWeeksLater.toISOString().split('T')[0]}
      "comboProducts": [
        {
          "productId": number, // Must be one of the product IDs from the input
          "price": number, // Should be lower than original price but still profitable
          "quantity": number // Suggest reasonable quantities (1-2)
        }
      ]
    }

    Important rules:
    - Include at least one product that's about to expire
    - Maximum 2-3 products per combo
    - Price should be 10-30% lower than original price
    - Quantities should be practical (1-2 items)
    - Combo expiration date must be between 7-14 days from now (${oneWeekLater.toISOString().split('T')[0]} to ${twoWeeksLater.toISOString().split('T')[0]})
    - Prioritize products with low sales volume (totalQuantity) to help clear inventory
    - Consider pairing low-selling products with popular products to increase their appeal
    - CRITICAL: The combination of product IDs in your suggestion must not match any existing combo in the comboList
    
    Products: ${JSON.stringify(sliceProducts)}
    

    Existing Combos (DO NOT recreate these combinations): ${JSON.stringify(comboList)}`;
    console.log(comboList);

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    console.log("Raw response from Gemini:", data);
    
    // Parse the response text to get the JSON object
    const responseText = data.candidates[0].content.parts[0].text;
    console.log("Response text from Gemini:", responseText);
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const comboData = JSON.parse(jsonMatch[0]);
    console.log("Parsed combo data:", comboData);
    
    // Validate the response structure and date
    if (!comboData.timeEnd || !Array.isArray(comboData.comboProducts)) {
      throw new Error('Invalid combo structure from Gemini');
    }

    // Validate the expiration date
    const expirationDate = new Date(comboData.timeEnd);
    if (expirationDate < oneWeekLater || expirationDate > twoWeeksLater) {
      throw new Error('Invalid expiration date from Gemini');
    }

    // Validate that the suggested combo doesn't match any existing combo
    const suggestedProductIds = comboData.comboProducts.map((p: ComboProduct) => p.productId).sort();
    const isDuplicate = comboList.some(existingCombo => {
      if (!existingCombo.comboProducts) return false;
      const existingIds = existingCombo.comboProducts.sort();
      return JSON.stringify(suggestedProductIds) === JSON.stringify(existingIds);
    });

    if (isDuplicate) {
      throw new Error('Generated combo matches an existing combo');
    }

    return comboData as CreateComboRequest;
  } catch (error) {
    console.error('Error generating combo suggestion:', error);
    throw error;
  }
}; 

export const generateProductSuggestions = async (
  currentCartItems: CartItem[],
  allProducts: Product[],
  salesData: ProductSales[]
): Promise<Product[]> => {
  try {
    const prompt = `You are a retail expert. Your task is to suggest complementary products that would go well with what the customer is currently buying.
    Analyze the following cart items and suggest products that:
    1. Are currently on sale or have good discounts
    2. Would complement the current purchase
    3. Have reasonable prices
    4. Are in stock
    5. Have good sales potential

    Return the response in this exact JSON format:
    {
      "suggestedProducts": [
        {
          "productId": number, // Must be one of the product IDs from allProducts
          "reason": string // Brief explanation why this product is suggested
        }
      ]
    }

    Important rules:
    - Suggest 2-3 complementary products
    - Prioritize products that are on sale
    - Consider typical customer purchase patterns
    - Avoid suggesting products that are already in the cart
    - Focus on products that would enhance the customer's current purchase
    
    Current Cart Items:
    ${JSON.stringify(currentCartItems, null, 2)}

    Available Products:
    ${JSON.stringify(allProducts, null, 2)}

    Sales Data:
    ${JSON.stringify(salesData, null, 2)}`;

    console.log(currentCartItems);
    console.log(allProducts);
    console.log(salesData);

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const suggestionData = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(suggestionData.suggestedProducts)) {
      throw new Error('Invalid suggestion structure from Gemini');
    }

    // Convert suggested product IDs to full product objects
    const suggestedProducts = suggestionData.suggestedProducts
      .map((suggestion: { productId: number; reason: string }) => allProducts.find(p => p.id === suggestion.productId))
      .filter((product: Product | undefined): product is Product => product !== undefined);

    return suggestedProducts;
  } catch (error) {
    console.error('Error generating product suggestions:', error);
    throw error;
  }
}; 

// Hàm phân tích ý định từ câu hỏi của người dùng
const analyzeUserIntent = async (userQuestion: string): Promise<QueryIntent> => {
  try {
    const prompt = `Bạn là một AI chuyên phân tích ý định câu hỏi về dữ liệu cửa hàng tiện lợi.
    Phân tích câu hỏi sau và xác định xem nó có liên quan đến cửa hàng không:

    Câu hỏi: "${userQuestion}"

    Trước tiên, hãy xác định xem câu hỏi có liên quan đến cửa hàng không. Nếu không liên quan, trả về:
    {
      "type": "unknown",
      "isStoreRelated": false
    }

    Nếu liên quan đến cửa hàng, trả về kết quả theo định dạng JSON chính xác sau:
    {
      "type": "product|combo|bill|receipt|employee|customer|sales|inventory",
      "isStoreRelated": true,
      "subtype": "mô tả chi tiết hơn về loại truy vấn",
      "filters": {
        "name": "tên cụ thể nếu có",
        "category": "danh mục sản phẩm nếu có",
        "employee": "tên nhân viên nếu có", 
        "customer": "tên khách hàng nếu có",
        "product": "tên sản phẩm nếu có",
        "timeRange": "khoảng thời gian nếu có"
      },
      "aggregation": "count|sum|max|min|list"
    }

    Quy tắc phân loại:
    - Chỉ trả lời các câu hỏi liên quan đến: sản phẩm, combo, hóa đơn, phiếu nhập kho, nhân viên, khách hàng, doanh số, tồn kho
    - Các câu hỏi không liên quan đến cửa hàng (ví dụ: thời tiết, tin tức, đời sống cá nhân) phải được đánh dấu là "isStoreRelated": false
    - "product": câu hỏi về sản phẩm, hàng hóa
    - "combo": câu hỏi về combo sản phẩm  
    - "bill": câu hỏi về hóa đơn, đơn hàng
    - "receipt": câu hỏi về phiếu nhập kho
    - "employee": câu hỏi về nhân viên
    - "customer": câu hỏi về khách hàng
    - "sales": câu hỏi về doanh số, bán hàng
    - "inventory": câu hỏi về tồn kho

    Ví dụ:
    - "Hôm nay ăn gì?" → { "type": "unknown", "isStoreRelated": false }
    - "Loại sữa nào đang bán?" → { "type": "product", "isStoreRelated": true, "filters": { "category": "sữa" } }
    - "Ai là khách hàng mua nhiều nhất?" → { "type": "customer", "isStoreRelated": true, "aggregation": "max" }`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    return JSON.parse(jsonMatch[0]) as QueryIntent;
  } catch (error) {
    console.error('Error analyzing user intent:', error);
    return { type: 'unknown', isStoreRelated: false };
  }
};

// Hàm xử lý truy vấn sản phẩm
const handleProductQuery = (intent: QueryIntent, storeData: StoreData): string => {
  let products = storeData.products;
  
  // Lọc theo danh mục
  if (intent.filters?.category) {
    const categoryFilter = intent.filters.category.toLowerCase();
    products = products.filter(p => 
      p.categoryName.toLowerCase().includes(categoryFilter)
    );
  }
  
  // Lọc theo tên sản phẩm
  if (intent.filters?.name) {
    const nameFilter = intent.filters.name.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(nameFilter)
    );
  }
  
  if (products.length === 0) {
    return "Không tìm thấy sản phẩm phù hợp với yêu cầu.";
  }
  
  // Trả về danh sách sản phẩm
  if (intent.aggregation === 'list' || !intent.aggregation) {
    const productList = products.map(p => 
      `- ${p.name} (${p.categoryName}): ${p.price.toLocaleString()}đ - Còn lại: ${p.quantityAvailable}`
    ).join('\n');
    return `Danh sách sản phẩm:\n${productList}`;
  }
  
  // Đếm số lượng
  if (intent.aggregation === 'count') {
    return `Có ${products.length} sản phẩm phù hợp.`;
  }
  
  return `Tìm thấy ${products.length} sản phẩm phù hợp.`;
};

// Hàm xử lý truy vấn combo
const handleComboQuery = (intent: QueryIntent, storeData: StoreData): string => {
  if (intent.filters?.product) {
    const productName = intent.filters.product.toLowerCase();
    
    // Tìm sản phẩm theo tên
    const product = storeData.products.find(p => 
      p.name.toLowerCase().includes(productName)
    );
    
    if (!product) {
      return `Không tìm thấy sản phẩm "${intent.filters.product}".`;
    }
    
    // Tìm combo chứa sản phẩm này
    const combosWithProduct = storeData.combos.filter(combo => 
      combo.includes(product.id)
    );
    
    if (combosWithProduct.length === 0) {
      return `Không có combo nào chứa sản phẩm "${product.name}".`;
    }
    
    const comboDetails = combosWithProduct.map((combo, index) => {
      const productNames = combo.map(productId => {
        const p = storeData.products.find(prod => prod.id === productId);
        return p ? p.name : `ID: ${productId}`;
      });
      return `Combo ${index + 1}: ${productNames.join(' + ')}`;
    }).join('\n');
    
    return `Có ${combosWithProduct.length} combo chứa "${product.name}":\n${comboDetails}`;
  }
  
  // Liệt kê tất cả combo
  if (storeData.combos.length === 0) {
    return "Hiện tại không có combo nào.";
  }
  
  const allCombos = storeData.combos.map((combo, index) => {
    const productNames = combo.map(productId => {
      const p = storeData.products.find(prod => prod.id === productId);
      return p ? p.name : `ID: ${productId}`;
    });
    return `Combo ${index + 1}: ${productNames.join(' + ')}`;
  }).join('\n');
  
  return `Danh sách ${storeData.combos.length} combo hiện có:\n${allCombos}`;
};

// Hàm xử lý truy vấn khách hàng
const handleCustomerQuery = (intent: QueryIntent, storeData: StoreData): string => {
  if (intent.aggregation === 'max' && intent.subtype?.includes('mua nhiều')) {
    // Tìm khách hàng mua nhiều nhất
    const customerPurchases = storeData.customers.map(customer => {
      const totalBills = customer.bills.length;
      const totalSpent = customer.bills.reduce((total, billId) => {
        const bill = storeData.bills.find(b => b.id === billId);
        return total + (bill ? bill.after_discount : 0);
      }, 0);
      
      return {
        customer,
        totalBills,
        totalSpent
      };
    });
    
    const topCustomer = customerPurchases.reduce((max, current) => 
      current.totalSpent > max.totalSpent ? current : max
    );
    
    return `Khách hàng mua nhiều nhất là "${topCustomer.customer.name}" với ${topCustomer.totalBills} đơn hàng, tổng chi tiêu: ${topCustomer.totalSpent.toLocaleString()}đ`;
  }
  
  // Tìm khách hàng theo tên
  if (intent.filters?.customer || intent.filters?.name) {
    const customerName = (intent.filters?.customer || intent.filters?.name || '').toLowerCase();
    const customer = storeData.customers.find(c => 
      c.name.toLowerCase().includes(customerName)
    );
    
    if (!customer) {
      return `Không tìm thấy khách hàng "${customerName}".`;
    }
    
    return `Thông tin khách hàng "${customer.name}": ${customer.bills.length} đơn hàng, ${customer.score} điểm tích lũy, SĐT: ${customer.phone_number}`;
  }
  
  return `Có tổng cộng ${storeData.customers.length} khách hàng.`;
};

// Hàm xử lý truy vấn nhân viên và doanh số
const handleEmployeeSalesQuery = (intent: QueryIntent, storeData: StoreData): string => {
  if (intent.filters?.employee) {
    const employeeName = intent.filters.employee.toLowerCase();
    const employee = storeData.employees.find(e => 
      e.name.toLowerCase().includes(employeeName)
    );
    
    if (!employee) {
      return `Không tìm thấy nhân viên "${intent.filters.employee}".`;
    }
    
    // Đếm số đơn hàng của nhân viên
    if (intent.aggregation === 'count') {
      const billCount = employee.bills.length;
      const totalRevenue = employee.bills.reduce((total, billId) => {
        const bill = storeData.bills.find(b => b.id === billId);
        return total + (bill ? bill.after_discount : 0);
      }, 0);
      
      return `Nhân viên "${employee.name}" đã bán ${billCount} đơn hàng với tổng doanh thu: ${totalRevenue.toLocaleString()}đ`;
    }
    
    return `Thông tin nhân viên "${employee.name}": ${employee.bills.length} đơn hàng, chức vụ: ${employee.position || 'Chưa xác định'}`;
  }
  
  return `Có tổng cộng ${storeData.employees.length} nhân viên.`;
};

// Hàm xử lý truy vấn kho hàng/nhập hàng
const handleReceiptQuery = (intent: QueryIntent, storeData: StoreData): string => {
  if (intent.filters?.employee) {
    const employeeName = intent.filters.employee.toLowerCase();
    const receipts = storeData.receipts.filter(r => 
      r.employee_name.toLowerCase().includes(employeeName)
    );
    
    if (receipts.length === 0) {
      return `Không tìm thấy phiếu nhập nào của nhân viên "${intent.filters.employee}".`;
    }
    
    const totalCost = receipts.reduce((sum, r) => sum + r.total_cost, 0);
    return `Nhân viên "${intent.filters.employee}" đã nhập ${receipts.length} phiếu với tổng giá trị: ${totalCost.toLocaleString()}đ`;
  }
  
  const totalReceipts = storeData.receipts.length;
  const totalValue = storeData.receipts.reduce((sum, r) => sum + r.total_cost, 0);
  return `Có tổng cộng ${totalReceipts} phiếu nhập kho với tổng giá trị: ${totalValue.toLocaleString()}đ`;
};

// Hàm chính: Chatbot AI
export const chatbotAI = async (userQuestion: string, storeData: StoreData, conversationContext?: string): Promise<string> => {
  try {
    const prompt = `Bạn là trợ lý AI của cửa hàng tiện lợi. Dựa vào dữ liệu cửa hàng sau, hãy trả lời câu hỏi của khách hàng một cách ngắn gọn và chính xác:

    ${conversationContext ? `Ngữ cảnh cuộc trò chuyện trước đó:\n${conversationContext}\n\n` : ''}

    Dữ liệu cửa hàng:
    - Số sản phẩm: ${storeData.products.length}
    - Số combo: ${storeData.combos.length}
    - Số hóa đơn: ${storeData.bills.length}
    - Số phiếu nhập: ${storeData.receipts.length}
    - Số nhân viên: ${storeData.employees.length}
    - Số khách hàng: ${storeData.customers.length}

    Chi tiết sản phẩm: ${JSON.stringify(storeData.products)}
    Chi tiết combo: ${JSON.stringify(storeData.combos)}
    Chi tiết hóa đơn: ${JSON.stringify(storeData.bills)}
    Chi tiết phiếu nhập: ${JSON.stringify(storeData.receipts)}
    Chi tiết nhân viên: ${JSON.stringify(storeData.employees)}
    Chi tiết khách hàng: ${JSON.stringify(storeData.customers)}

    Câu hỏi của khách hàng: "${userQuestion}"
    Đầu tiên, hãy phân tích xem câu hỏi sau có liên quan đến cửa hàng tiện lợi không (ví dụ: sản phẩm, combo, hóa đơn, nhân viên, khách hàng, doanh số, tồn kho).
    Chỉ trả về "Xin lỗi, tôi không thể trả lời câu hỏi này." nếu không liên quan.

    Nếu liên quan, Hãy trả lời ngắn gọn và chính xác dựa trên dữ liệu trên. Nếu không có thông tin trong dữ liệu, hãy nói "Xin lỗi, tôi không có thông tin về điều này."`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Lỗi trong chatbotAI:', error);
    return "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.";
  }
};



