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

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY }`;   

export const generateComboSuggestion = async (products: Product[], salesData: ProductSales[]): Promise<CreateComboRequest> => {
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
    
    Products:
    ${JSON.stringify(products, null, 2)}
    

    Sales Data:
    ${JSON.stringify(salesData, null, 2)}`;
    console.log(products);
    console.log(salesData);

    // console.log("Sending prompt to Gemini:", prompt);

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

