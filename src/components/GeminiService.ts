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
  type:
    | "product"
    | "combo"
    | "bill"
    | "receipt"
    | "employee"
    | "customer"
    | "sales"
    | "inventory"
    | "unknown";
  subtype?: string;
  filters?: {
    name?: string;
    category?: string;
    employee?: string;
    customer?: string;
    product?: string;
    timeRange?: string;
  };
  aggregation?: "count" | "sum" | "max" | "min" | "list";
  isStoreRelated: boolean;
}

function simplifyStoreData(storeData) {
  // Lọc products
  const products = storeData.products.map((p) => ({
    id: p.id,
    name: p.name,
    quantityAvailable: p.quantityAvailable,
    description: p.description,
    categoryName: p.categoryName?.trim(),
    price: p.price,
    dateExpired: formatDateToVNString(p.dateExpired),
    salePrice: p.salePrice,
    inputPrice: p.inputPrice,
  }));

  // Lọc bills
  const bills = storeData.bills.map((b) => ({
    id: b.id,
    after_discount: b.after_discount,
    customer: {
      id: b.customer?.id,
    },
    employee: {
      id: b.employee?.id,
    },
    billDetails: b.billDetails.map((d) => ({
      productId: d.productId,
      price: d.price,
      afterDiscount: d.afterDiscount,
      quantity: d.quantity,
    })),
    total_cost: b.total_cost,
    isDeleted: b.isDeleted,
    is_error: b.is_error,
    createdAt: formatDateToVNString(b.createdAt),
  }));

  // Lọc customers
  const customers = storeData.customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone_number: c.phone_number,
    score: c.score,
  }));

  // Lọc employees
  const employees = storeData.employees.map((e) => ({
    id: e.id,
    name: e.name,
    phone_number: e.phone_number,
    position: e.position,
  }));

  return { products, bills, customers, employees };
}

// Format date string to dd/mm/yyyy hour:minute in Vietnam timezone
export const formatDateToVNString = (dateString: string): string => {
  if (!dateString) return "";

  // Create date object from input string
  const date = new Date(dateString);

  // Convert to Vietnam timezone (UTC+7)
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // Get date components
  const day = vnDate.getUTCDate().toString().padStart(2, "0");
  const month = (vnDate.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = vnDate.getUTCFullYear();
  const hour = vnDate.getUTCHours().toString().padStart(2, "0");
  const minute = vnDate.getUTCMinutes().toString().padStart(2, "0");

  // Return formatted date string with time
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
  import.meta.env.VITE_GEMINI_API_KEY
}`;

export const generateComboSuggestion = async (
  products: Product[],
  salesData: ProductSales[],
  comboList: ComboList[]
): Promise<CreateComboRequest> => {
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
      "timeEnd": "YYYY-MM-DD", // Must be between ${
        oneWeekLater.toISOString().split("T")[0]
      } and ${twoWeeksLater.toISOString().split("T")[0]}
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
    - Combo expiration date must be between 7-14 days from now (${
      oneWeekLater.toISOString().split("T")[0]
    } to ${twoWeeksLater.toISOString().split("T")[0]})
    - Prioritize products with low sales volume (totalQuantity) to help clear inventory
    - Consider pairing low-selling products with popular products to increase their appeal
    - CRITICAL: The combination of product IDs in your suggestion must not match any existing combo in the comboList
    
    Products: ${JSON.stringify(sliceProducts)}

    Sales Data: ${JSON.stringify(salesData)}

    Existing Combos (DO NOT recreate these combinations): ${JSON.stringify(
      comboList
    )}

    Important rules:
    - Prioritize products with low sales volume (totalQuantity) to help clear inventory

    Existing Combos (DO NOT recreate these combinations): ${JSON.stringify(
      comboList
    )}`;
    console.log(comboList);

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Raw response from Gemini:", data);

    // Parse the response text to get the JSON object
    const responseText = data.candidates[0].content.parts[0].text;
    console.log("Response text from Gemini:", responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const comboData = JSON.parse(jsonMatch[0]);
    console.log("Parsed combo data:", comboData);

    // Validate the response structure and date
    if (!comboData.timeEnd || !Array.isArray(comboData.comboProducts)) {
      throw new Error("Invalid combo structure from Gemini");
    }

    // Validate the expiration date
    const expirationDate = new Date(comboData.timeEnd);
    if (expirationDate < oneWeekLater || expirationDate > twoWeeksLater) {
      throw new Error("Invalid expiration date from Gemini");
    }

    // Validate that the suggested combo doesn't match any existing combo
    const suggestedProductIds = comboData.comboProducts
      .map((p: ComboProduct) => p.productId)
      .sort();
    const isDuplicate = comboList.some((existingCombo) => {
      if (!existingCombo.comboProducts) return false;
      const existingIds = existingCombo.comboProducts.sort();
      return (
        JSON.stringify(suggestedProductIds) === JSON.stringify(existingIds)
      );
    });

    if (isDuplicate) {
      throw new Error("Generated combo matches an existing combo");
    }

    return comboData as CreateComboRequest;
  } catch (error) {
    console.error("Error generating combo suggestion:", error);
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const suggestionData = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(suggestionData.suggestedProducts)) {
      throw new Error("Invalid suggestion structure from Gemini");
    }

    // Convert suggested product IDs to full product objects
    const suggestedProducts = suggestionData.suggestedProducts
      .map((suggestion: { productId: number; reason: string }) =>
        allProducts.find((p) => p.id === suggestion.productId)
      )
      .filter(
        (product: Product | undefined): product is Product =>
          product !== undefined
      );

    return suggestedProducts;
  } catch (error) {
    console.error("Error generating product suggestions:", error);
    throw error;
  }
};

// Hàm chính: Chatbot AI
export const chatbotAI = async (
  userQuestion: string,
  storeData: StoreData,
  conversationContext?: string
): Promise<string> => {
  // Lấy dữ liệu đã rút gọn
  const simplifiedData = simplifyStoreData(storeData);
  const contextData = JSON.stringify(simplifiedData);
  try {
    console.log("storeData", simplifiedData);
    const prompt = `Bạn là trợ lý AI của cửa hàng tiện lợi. Dựa vào dữ liệu cửa hàng sau, hãy trả lời câu hỏi của khách hàng một cách ngắn gọn và chính xác:
    Lưu ý hãy trả lời tiếp tục câu chuyện dựa trên ngữ cảnh mà khách hàng đã hỏi và bạn đã trả lời trước đó.
    ${
      conversationContext
        ? `Ngữ cảnh cuộc trò chuyện trước đó của bạn và khách hàng:\n${conversationContext}\n\n`
        : ""
    }

    Hãy trả lời ngắn gọn các câu hỏi tiếp theo dựa trên dữ liệu này.\n
    Dữ liệu của cửa hàng để tham khảo: ${contextData}\n
    Hãy nhớ map các thông tin theo id để lấy chi tiết\n

    Câu hỏi của khách hàng: "${userQuestion}"\n
 
    Đầu tiên, hãy phân tích xem câu hỏi sau có liên quan đến cửa hàng tiện lợi không (ví dụ: sản phẩm, combo, hóa đơn, nhân viên, khách hàng, doanh số, tồn kho), câu lời chào vẫn được chấp nhận như Hi, Xin chào, Chào bạn, ...\n
    Chỉ trả về "Xin lỗi, tôi không thể trả lời câu hỏi này." nếu không liên quan.\n

    Nếu liên quan, Hãy trả lời chính xác dựa trên dữ liệu trên. Nếu không có thông tin trong dữ liệu, hãy nói "Xin lỗi, tôi không có thông tin về điều này."\n
    Quan trọng:\n
    - Thông tin về thời gian hiện tại: ${formatDateToVNString(
      new Date().toISOString()
    )}\n
    - Hãy trả lời ngắn gọn, không cần nói lời chào, không cần nói lời tạm biệt.\n
    - Nếu khách hàng liên quan đến thời gian cố định (ví dụ: Hôm nay có bao nhiêu hóa đơn). Nếu truy xuất dữ liệu không thấy có hóa đơn ngày đó thì trả về cho hợp lý.\n
    - Định dạng lại câu trả lời cho đẹp mắt và dễ nhìn, format lại câu trả lời cho đẹp mắt và dễ nhìn, gạch đầu dòng (-), lưu ý không bôi đậm.\n
    - Format lại thời gian nếu có vì hiện tại thời gian đang có dạng sau 2025-12-31T15:00:00.000+00:00, format lại thời gian thành dạng dd/mm/yyyy.\n
    - Nếu có số thập phân thì làm tròn đến 2 chữ số thập phân.\n
    - Nếu có số nguyên thì không cần làm tròn.\n
    `;
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Lỗi trong chatbotAI:", error);
    return "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.";
  }
};
