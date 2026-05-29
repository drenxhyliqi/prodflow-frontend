import { MdOutlineBarChart, MdOutlineReceipt, MdOutlineShoppingCart, MdOutlineInventory2 } from 'react-icons/md'

export const REPORT_TYPES = [
    {
        id: 'production',
        label: 'Production Report',
        description: 'Output, efficiency, machines and top products.',
        path: '/productionReport',
        icon: MdOutlineBarChart,
        iconBg: '#eff6ff',
        iconColor: '#2563EB',
    },
    {
        id: 'sales',
        label: 'Sales Report',
        description: 'Revenue, orders, top clients and products.',
        path: '/salesReport',
        icon: MdOutlineShoppingCart,
        iconBg: '#f0fdf4',
        iconColor: '#16a34a',
    },
    {
        id: 'expenses',
        label: 'Expenses Report',
        description: 'Spending totals, trends and expense records.',
        path: '/expensesReport',
        icon: MdOutlineReceipt,
        iconBg: '#fef2f2',
        iconColor: '#dc2626',
    },
    {
        id: 'materials_stock',
        label: 'Materials Stock Report',
        description: 'IN/OUT movements, balance and stock ledger.',
        path: '/materialsStockReport',
        icon: MdOutlineInventory2,
        iconBg: '#faf5ff',
        iconColor: '#7c3aed',
    },
]

export const REPORT_TYPE_IDS = REPORT_TYPES.map((r) => r.id)

export const reportTypeById = (id) => REPORT_TYPES.find((r) => r.id === id)
