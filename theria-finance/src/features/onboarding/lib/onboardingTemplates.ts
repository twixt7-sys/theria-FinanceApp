/**
 * Starter templates Terry offers during guided setup. Every template carries a
 * stable id so accounts/streams can reference their category before anything
 * is written to the database; `popular` items start pre-selected.
 */

export interface CategoryTemplate {
  id: string;
  name: string;
  scope: 'account' | 'stream';
  iconName: string;
  color: string;
  popular?: boolean;
}

export interface AccountTemplate {
  id: string;
  name: string;
  categoryId: string;
  iconName: string;
  color: string;
  isSavings?: boolean;
  cardType?: 'debit' | 'credit' | 'checking' | 'savings';
  popular?: boolean;
}

export interface StreamTemplate {
  id: string;
  name: string;
  type: 'income' | 'expense';
  categoryId?: string;
  iconName: string;
  color: string;
  popular?: boolean;
}

export const ACCOUNT_CATEGORY_TEMPLATES: CategoryTemplate[] = [
  { id: 'ob-ac-cash', name: 'Cash & Bank', scope: 'account', iconName: 'Wallet', color: '#10B981', popular: true },
  { id: 'ob-ac-savings', name: 'Savings', scope: 'account', iconName: 'PiggyBank', color: '#6366F1', popular: true },
  { id: 'ob-ac-cards', name: 'Cards', scope: 'account', iconName: 'CreditCard', color: '#06B6D4', popular: true },
  { id: 'ob-ac-ewallet', name: 'E-Wallets', scope: 'account', iconName: 'Smartphone', color: '#3B82F6', popular: true },
  { id: 'ob-ac-invest', name: 'Investments', scope: 'account', iconName: 'TrendingUp', color: '#8B5CF6' },
  { id: 'ob-ac-emergency', name: 'Emergency', scope: 'account', iconName: 'Shield', color: '#F59E0B' },
  { id: 'ob-ac-business', name: 'Business', scope: 'account', iconName: 'Building2', color: '#14B8A6' },
  { id: 'ob-ac-travel', name: 'Travel', scope: 'account', iconName: 'Plane', color: '#EC4899' },
];

export const STREAM_CATEGORY_TEMPLATES: CategoryTemplate[] = [
  { id: 'ob-sc-salary', name: 'Salary & Work', scope: 'stream', iconName: 'Briefcase', color: '#10B981', popular: true },
  { id: 'ob-sc-business', name: 'Business', scope: 'stream', iconName: 'Building2', color: '#22C55E' },
  { id: 'ob-sc-food', name: 'Food', scope: 'stream', iconName: 'Utensils', color: '#F59E0B', popular: true },
  { id: 'ob-sc-transport', name: 'Transport', scope: 'stream', iconName: 'Car', color: '#3B82F6', popular: true },
  { id: 'ob-sc-housing', name: 'Housing & Bills', scope: 'stream', iconName: 'Home', color: '#A855F7', popular: true },
  { id: 'ob-sc-lifestyle', name: 'Lifestyle', scope: 'stream', iconName: 'Sparkles', color: '#EF4444', popular: true },
  { id: 'ob-sc-health', name: 'Health', scope: 'stream', iconName: 'HeartPulse', color: '#BE123C' },
  { id: 'ob-sc-education', name: 'Education', scope: 'stream', iconName: 'GraduationCap', color: '#0EA5E9' },
  { id: 'ob-sc-family', name: 'Family & Pets', scope: 'stream', iconName: 'Users', color: '#D946EF' },
];

export const ACCOUNT_TEMPLATES: AccountTemplate[] = [
  { id: 'ob-acc-wallet', name: 'Cash Wallet', categoryId: 'ob-ac-cash', iconName: 'Wallet', color: '#10B981', popular: true },
  { id: 'ob-acc-bank', name: 'Bank Account', categoryId: 'ob-ac-cash', iconName: 'Landmark', color: '#22C55E', popular: true },
  { id: 'ob-acc-payroll', name: 'Payroll Account', categoryId: 'ob-ac-cash', iconName: 'BadgeDollarSign', color: '#16A34A' },
  { id: 'ob-acc-joint', name: 'Joint Account', categoryId: 'ob-ac-cash', iconName: 'Users', color: '#059669' },
  { id: 'ob-acc-savings', name: 'Savings Account', categoryId: 'ob-ac-savings', iconName: 'PiggyBank', color: '#6366F1', popular: true, isSavings: true },
  { id: 'ob-acc-emergency', name: 'Emergency Fund', categoryId: 'ob-ac-emergency', iconName: 'Shield', color: '#F59E0B', isSavings: true },
  { id: 'ob-acc-vault', name: 'Family Savings', categoryId: 'ob-ac-savings', iconName: 'Home', color: '#818CF8', isSavings: true },
  { id: 'ob-acc-debit', name: 'Debit Card', categoryId: 'ob-ac-cards', iconName: 'CreditCard', color: '#06B6D4', popular: true, cardType: 'debit' },
  { id: 'ob-acc-credit', name: 'Credit Card', categoryId: 'ob-ac-cards', iconName: 'CreditCard', color: '#0891B2', cardType: 'credit' },
  { id: 'ob-acc-gcash', name: 'GCash', categoryId: 'ob-ac-ewallet', iconName: 'Smartphone', color: '#3B82F6', popular: true },
  { id: 'ob-acc-maya', name: 'Maya', categoryId: 'ob-ac-ewallet', iconName: 'Smartphone', color: '#22C55E' },
  { id: 'ob-acc-paypal', name: 'PayPal', categoryId: 'ob-ac-ewallet', iconName: 'Globe', color: '#2563EB' },
  { id: 'ob-acc-wise', name: 'Wise', categoryId: 'ob-ac-ewallet', iconName: 'Send', color: '#84CC16' },
  { id: 'ob-acc-stocks', name: 'Stock Portfolio', categoryId: 'ob-ac-invest', iconName: 'TrendingUp', color: '#8B5CF6' },
  { id: 'ob-acc-crypto', name: 'Crypto Wallet', categoryId: 'ob-ac-invest', iconName: 'Coins', color: '#A855F7' },
  { id: 'ob-acc-retirement', name: 'Retirement Fund', categoryId: 'ob-ac-invest', iconName: 'Sunrise', color: '#7C3AED' },
  { id: 'ob-acc-business', name: 'Business Account', categoryId: 'ob-ac-business', iconName: 'Building2', color: '#14B8A6' },
  { id: 'ob-acc-travel', name: 'Travel Fund', categoryId: 'ob-ac-travel', iconName: 'Plane', color: '#EC4899', isSavings: true },
];

export const INCOME_STREAM_TEMPLATES: StreamTemplate[] = [
  { id: 'ob-in-salary', name: 'Salary', type: 'income', categoryId: 'ob-sc-salary', iconName: 'Briefcase', color: '#10B981', popular: true },
  { id: 'ob-in-13th', name: '13th Month / Bonus', type: 'income', categoryId: 'ob-sc-salary', iconName: 'Gift', color: '#22C55E' },
  { id: 'ob-in-overtime', name: 'Overtime Pay', type: 'income', categoryId: 'ob-sc-salary', iconName: 'Clock', color: '#16A34A' },
  { id: 'ob-in-tips', name: 'Tips & Commissions', type: 'income', categoryId: 'ob-sc-salary', iconName: 'HandCoins', color: '#65A30D' },
  { id: 'ob-in-freelance', name: 'Freelance', type: 'income', categoryId: 'ob-sc-business', iconName: 'Laptop', color: '#84CC16', popular: true },
  { id: 'ob-in-business', name: 'Business Sales', type: 'income', categoryId: 'ob-sc-business', iconName: 'Store', color: '#4D7C0F' },
  { id: 'ob-in-sidehustle', name: 'Side Hustle', type: 'income', categoryId: 'ob-sc-business', iconName: 'Rocket', color: '#0EA5E9' },
  { id: 'ob-in-online', name: 'Online Selling', type: 'income', categoryId: 'ob-sc-business', iconName: 'ShoppingBag', color: '#06B6D4' },
  { id: 'ob-in-rental', name: 'Rental Income', type: 'income', categoryId: 'ob-sc-business', iconName: 'Building', color: '#14B8A6' },
  { id: 'ob-in-dividends', name: 'Dividends', type: 'income', categoryId: 'ob-sc-business', iconName: 'TrendingUp', color: '#8B5CF6' },
  { id: 'ob-in-interest', name: 'Bank Interest', type: 'income', categoryId: 'ob-sc-business', iconName: 'Percent', color: '#6366F1' },
  { id: 'ob-in-allowance', name: 'Allowance', type: 'income', categoryId: 'ob-sc-family', iconName: 'Wallet', color: '#D946EF' },
  { id: 'ob-in-remittance', name: 'Remittance', type: 'income', categoryId: 'ob-sc-family', iconName: 'Send', color: '#EC4899' },
  { id: 'ob-in-pension', name: 'Pension', type: 'income', categoryId: 'ob-sc-family', iconName: 'Sunrise', color: '#F97316' },
  { id: 'ob-in-refunds', name: 'Refunds & Cashback', type: 'income', categoryId: 'ob-sc-lifestyle', iconName: 'RotateCcw', color: '#F59E0B' },
  { id: 'ob-in-gifts', name: 'Gifts Received', type: 'income', categoryId: 'ob-sc-family', iconName: 'PartyPopper', color: '#EF4444' },
];

export const EXPENSE_STREAM_TEMPLATES: StreamTemplate[] = [
  { id: 'ob-ex-groceries', name: 'Groceries', type: 'expense', categoryId: 'ob-sc-food', iconName: 'ShoppingCart', color: '#F59E0B', popular: true },
  { id: 'ob-ex-dining', name: 'Dining Out', type: 'expense', categoryId: 'ob-sc-food', iconName: 'Utensils', color: '#FB923C', popular: true },
  { id: 'ob-ex-coffee', name: 'Coffee & Snacks', type: 'expense', categoryId: 'ob-sc-food', iconName: 'Coffee', color: '#F97316' },
  { id: 'ob-ex-delivery', name: 'Food Delivery', type: 'expense', categoryId: 'ob-sc-food', iconName: 'Bike', color: '#EA580C' },
  { id: 'ob-ex-rent', name: 'Rent', type: 'expense', categoryId: 'ob-sc-housing', iconName: 'Home', color: '#A855F7', popular: true },
  { id: 'ob-ex-utilities', name: 'Electricity & Water', type: 'expense', categoryId: 'ob-sc-housing', iconName: 'Lightbulb', color: '#9333EA', popular: true },
  { id: 'ob-ex-internet', name: 'Internet & Phone', type: 'expense', categoryId: 'ob-sc-housing', iconName: 'Wifi', color: '#7E22CE', popular: true },
  { id: 'ob-ex-household', name: 'Household Items', type: 'expense', categoryId: 'ob-sc-housing', iconName: 'Sofa', color: '#6B21A8' },
  { id: 'ob-ex-fuel', name: 'Fuel', type: 'expense', categoryId: 'ob-sc-transport', iconName: 'Fuel', color: '#3B82F6' },
  { id: 'ob-ex-commute', name: 'Commute & Transit', type: 'expense', categoryId: 'ob-sc-transport', iconName: 'Train', color: '#2563EB', popular: true },
  { id: 'ob-ex-rideshare', name: 'Ride Sharing', type: 'expense', categoryId: 'ob-sc-transport', iconName: 'Car', color: '#1D4ED8' },
  { id: 'ob-ex-parking', name: 'Parking & Tolls', type: 'expense', categoryId: 'ob-sc-transport', iconName: 'CircleParking', color: '#1E40AF' },
  { id: 'ob-ex-shopping', name: 'Shopping', type: 'expense', categoryId: 'ob-sc-lifestyle', iconName: 'ShoppingBag', color: '#EF4444', popular: true },
  { id: 'ob-ex-entertainment', name: 'Entertainment', type: 'expense', categoryId: 'ob-sc-lifestyle', iconName: 'Film', color: '#DC2626' },
  { id: 'ob-ex-subscriptions', name: 'Subscriptions', type: 'expense', categoryId: 'ob-sc-lifestyle', iconName: 'Receipt', color: '#B91C1C', popular: true },
  { id: 'ob-ex-hobbies', name: 'Hobbies', type: 'expense', categoryId: 'ob-sc-lifestyle', iconName: 'Gamepad2', color: '#F43F5E' },
  { id: 'ob-ex-beauty', name: 'Beauty & Self-care', type: 'expense', categoryId: 'ob-sc-lifestyle', iconName: 'Scissors', color: '#EC4899' },
  { id: 'ob-ex-travel', name: 'Travel & Vacations', type: 'expense', categoryId: 'ob-sc-lifestyle', iconName: 'Plane', color: '#DB2777' },
  { id: 'ob-ex-health', name: 'Medical & Pharmacy', type: 'expense', categoryId: 'ob-sc-health', iconName: 'Pill', color: '#BE123C' },
  { id: 'ob-ex-fitness', name: 'Gym & Fitness', type: 'expense', categoryId: 'ob-sc-health', iconName: 'Dumbbell', color: '#9F1239' },
  { id: 'ob-ex-insurance', name: 'Insurance', type: 'expense', categoryId: 'ob-sc-health', iconName: 'ShieldCheck', color: '#881337' },
  { id: 'ob-ex-education', name: 'Tuition & Courses', type: 'expense', categoryId: 'ob-sc-education', iconName: 'GraduationCap', color: '#0EA5E9' },
  { id: 'ob-ex-books', name: 'Books & Supplies', type: 'expense', categoryId: 'ob-sc-education', iconName: 'BookOpen', color: '#0284C7' },
  { id: 'ob-ex-kids', name: 'Kids & Family', type: 'expense', categoryId: 'ob-sc-family', iconName: 'Baby', color: '#D946EF' },
  { id: 'ob-ex-pets', name: 'Pets', type: 'expense', categoryId: 'ob-sc-family', iconName: 'PawPrint', color: '#C026D3' },
  { id: 'ob-ex-gifts', name: 'Gifts & Donations', type: 'expense', categoryId: 'ob-sc-family', iconName: 'Gift', color: '#A21CAF' },
  { id: 'ob-ex-debt', name: 'Loans & Debt', type: 'expense', categoryId: 'ob-sc-housing', iconName: 'Banknote', color: '#78716C' },
  { id: 'ob-ex-taxes', name: 'Taxes & Fees', type: 'expense', categoryId: 'ob-sc-housing', iconName: 'FileText', color: '#57534E' },
];

/* ── "About you" survey options (all optional) ─────────────────────────── */

export const AGE_RANGE_OPTIONS = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'];

export const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export const WORK_OPTIONS = [
  'Student',
  'Employed',
  'Self-employed',
  'Freelancer',
  'Business owner',
  'Homemaker',
  'Retired',
  'Between jobs',
];

export const USE_CASE_OPTIONS = [
  { id: 'track-spending', label: 'Track daily spending', iconName: 'ReceiptText' },
  { id: 'budgeting', label: 'Stick to a budget', iconName: 'Target' },
  { id: 'save-goal', label: 'Save for a goal', iconName: 'PiggyBank' },
  { id: 'debt', label: 'Pay off debt', iconName: 'Banknote' },
  { id: 'business', label: 'Manage a business', iconName: 'Store' },
  { id: 'family', label: 'Family finances', iconName: 'Users' },
  { id: 'invest', label: 'Grow investments', iconName: 'TrendingUp' },
  { id: 'curious', label: 'Just exploring', iconName: 'Compass' },
];
