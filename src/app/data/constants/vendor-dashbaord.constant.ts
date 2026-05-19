export const NAV_ITEMS = [
    { label: 'Overview', route: '/vendor/overview', icon: 'overview', activeColor: '#26C34D' },
    { label: 'Orders', route: '/vendor/orders', icon: 'orders', activeColor: '#FF860D' },
    { label: 'Products', route: '/vendor/products', icon: 'products', activeColor: '#1B5DD7' },
    { label: 'Reports', route: '/vendor/reports', icon: 'reports', activeColor: '#FBBB0D' },
];

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

export const PERIODS = ['Weekly', 'Monthly', 'Yearly'];

export const REVENUE: Record<string, number> = {
    Weekly: 4320,
    Monthly: 17750,
    Yearly: 213000,
};