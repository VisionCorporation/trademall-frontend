export const NAV_ITEMS = [
    { label: 'Overview', route: '/vendor/overview', icon: 'overview', activeColor: '#26C34D' },
    { label: 'Orders', route: '/vendor/orders', icon: 'orders', activeColor: '#FF860D' },
    { label: 'Products', route: '/vendor/products', icon: 'products', activeColor: '#1B5DD7' },
    { label: 'Reports', route: '/vendor/reports', icon: 'reports', activeColor: '#FBBB0D' },
];

export const ROUTE_TITLE_MAP: Record<string, string> = {
    'overview': 'Overview',
    'orders': 'Orders',
    'products': 'Products',
    'reports': 'Reports',
    'add-product': 'New Product',
};

export const PRODUCTS_FILTERS = [
    { label: 'All', value: 'all', activeColor: '#1B5DD7' },
    { label: 'Approved', value: 'approved', activeColor: '#26C34D' },
    { label: 'Pending', value: 'pending', activeColor: '#FF860D' },
    { label: 'Rejected', value: 'rejected', activeColor: '#FF0000' },
]

export const ORDERS_FILTERS = [
    { label: 'All Orders', value: 'all-orders', activeColor: '#1B5DD7' },
    { label: 'Delivered', value: 'delivered', activeColor: '#26C34D' },
    { label: 'Unfulfilled', value: 'unfulfilled', activeColor: '#FF860D' },
    { label: 'Rejected', value: 'rejected', activeColor: '#FF0000' },
]

export const PRODUCT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    approved: { label: 'Approved', color: '#26C34D' },
    pending: { label: 'Pending', color: '#FF860D' },
    rejected: { label: 'Rejected', color: '#FF0000' },
};

export const ORDERS_STATUS_CONFIG: Record<string, { label: string; color: string, bgColor: string }> = {
    delivered: { label: 'Delivered', color: '#26C34D', bgColor: '#E8F5E9' },
    unfulfilled: { label: 'Unfulfilled', color: '#FF860D', bgColor: '#FFF3E0' },
    rejected: { label: 'Rejected', color: '#FF0000', bgColor: '#FFEbee' },
};

export const PERIODS = ['Weekly', 'Monthly', 'Yearly'];

export const REVENUE: Record<string, number> = {
    Weekly: 4320,
    Monthly: 17750,
    Yearly: 213000,
};

export const ORDERS = [
    { orderNumber: 'ORDE - 1358 - 9742', total: 'GHS 15,082.45', customer: 'Oppong Michael', status: 'delivered', date: 'April 11, 2026' },
    { orderNumber: 'ORDE - 2468 - 1357', total: 'GHS 12,345.67', customer: 'Jeffery Asante', status: 'delivered', date: 'April 2, 2026' },
    { orderNumber: 'ORDE - 3691 - 2458', total: 'GHS 9,876.54', customer: 'Vanessa Amoako', status: 'unfulfilled', date: 'March 28, 2026' },
    { orderNumber: 'ORDE - 9876 - 4321', total: 'GHS 18,901.23', customer: 'Amexo Leticia', status: 'rejected', date: 'March 15, 2026' },
    { orderNumber: 'ORDE - 5432 - 1098', total: 'GHS 7,654.32', customer: 'Kwame Nkrumah', status: 'delivered', date: 'March 10, 2026' },
    { orderNumber: 'ORDE - 6789 - 3210', total: 'GHS 14,321.09', customer: 'Abena Serwaa', status: 'unfulfilled', date: 'March 5, 2026' },
    { orderNumber: 'ORDE - 4321 - 8765', total: 'GHS 11,234.56', customer: 'Kofi Annan', status: 'delivered', date: 'March 1, 2026' },
    { orderNumber: 'ORDE - 2109 - 6543', total: 'GHS 8,765.43', customer: 'Esi Mensah', status: 'rejected', date: 'February 25, 2026' },
    { orderNumber: 'ORDE - 8765 - 4321', total: 'GHS 16,543.21', customer: 'Yaw Boateng', status: 'delivered', date: 'February 20, 2026' },
    { orderNumber: 'ORDE - 6543 - 2109', total: 'GHS 13,210.98', customer: 'Akosua Agyapong', status: 'unfulfilled', date: 'February 15, 2026' },
    { orderNumber: 'ORDE - 3210 - 9876', total: 'GHS 10,987.65', customer: 'Kwabena Osei', status: 'rejected', date: 'February 10, 2026' },
    { orderNumber: 'ORDE - 1098 - 5432', total: 'GHS 9,876.54', customer: 'Abigail Boateng', status: 'rejected', date: 'February 5, 2026' },
    { orderNumber: 'ORDE - 7654 - 3210', total: 'GHS 17,654.32', customer: 'Kwame Asante', status: 'unfulfilled', date: 'February 1, 2026' },
    { orderNumber: 'ORDE - 4321 - 8765', total: 'GHS 12,345.67', customer: 'Ama Serwaa', status: 'rejected', date: 'January 25, 2026' },
]

export const ORDER_PERIODS = [
    { label: 'All Orders', value: 'all-orders' },
    { label: 'Last Week', value: 'last-week' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'Last Year', value: 'last-year' },
];