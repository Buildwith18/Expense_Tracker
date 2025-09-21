/**
 * Indian Currency Formatting Utilities
 * Handles Indian numbering system (lakhs, crores) and proper formatting
 */

export const formatIndianCurrency = (amount: number): string => {
  if (amount === 0) return '₹0';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

export const formatIndianNumber = (amount: number): string => {
  if (amount === 0) return '0';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

export const parseIndianCurrency = (value: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  return parseFloat(cleanValue) || 0;
};

export const getCurrencySymbol = (currency: string = 'INR'): string => {
  const symbols: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
  };
  return symbols[currency] || '₹';
};

export const formatCurrencyWithSymbol = (amount: number, currency: string = 'INR'): string => {
  const symbol = getCurrencySymbol(currency);
  
  if (currency === 'INR') {
    return formatIndianCurrency(amount);
  }
  
  // For other currencies, use standard formatting
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

// Helper function to convert amount to words (Indian system)
export const amountToWords = (amount: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertLessThanOneThousand = (num: number): string => {
    if (num === 0) return '';
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanOneThousand(num % 100) : '');
    
    return '';
  };
  
  if (amount === 0) return 'Zero Rupees';
  
  let rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  if (rupees >= 10000000) { // Crores
    const crores = Math.floor(rupees / 10000000);
    result += convertLessThanOneThousand(crores) + ' Crore ';
    rupees %= 10000000;
  }
  
  if (rupees >= 100000) { // Lakhs
    const lakhs = Math.floor(rupees / 100000);
    result += convertLessThanOneThousand(lakhs) + ' Lakh ';
    rupees %= 100000;
  }
  
  if (rupees > 0) {
    result += convertLessThanOneThousand(rupees);
  }
  
  result = result.trim() + ' Rupee' + (rupees !== 1 ? 's' : '');
  
  if (paise > 0) {
    result += ' and ' + convertLessThanOneThousand(paise) + ' Paise';
  }
  
  return result;
}; 