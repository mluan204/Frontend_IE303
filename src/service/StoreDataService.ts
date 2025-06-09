import { chatbotAI } from '../components/GeminiService';
import { getAllProduct } from './productApi';
import { getAllComboList } from './comboApi';
import { getProductQuantity } from './billApi';
import { searchReceipts } from './receiptApi';
import { getAllEmployees } from './employeeApi';
import { getAllCustomer } from './customerApi';

export interface StoreData {
  products: any[];
  combos: any[];
  bills: any[];
  receipts: any[];
  employees: any[];
  customers: any[];
}

export async function fetchStoreData(): Promise<StoreData> {
  try {
    const [products, combos, bills, receipts, employees, customers] = await Promise.all([
      getAllProduct(),
      getAllComboList(),
      getProductQuantity(),
      searchReceipts({}),
      getAllEmployees(),
      getAllCustomer(),
    ]);

    return {
      products,
      combos,
      bills,
      receipts,
      employees,
      customers,
    };
  } catch (error) {
    console.error('Error fetching store data:', error);
    throw new Error('Failed to fetch store data');
  }
} 