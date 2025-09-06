
import React, { useMemo } from 'react';
import type { InventoryItem } from '../types';

interface DashboardProps {
    items: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
    const stats = useMemo(() => {
        const totalItems = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const lowStockCount = items.filter(item => item.quantity < 5).length;
        return { totalItems, totalQuantity, lowStockCount };
    }, [items]);

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="fas fa-box" title="Total Items" value={stats.totalItems} color="pink" />
            <StatCard icon="fas fa-boxes-stacked" title="Total Quantity" value={stats.totalQuantity} color="purple" />
            <StatCard icon="fas fa-exclamation-triangle" title="Low Stock Alerts" value={stats.lowStockCount} color="red" />
        </section>
    );
};

interface StatCardProps {
    icon: string;
    title: string;
    value: number;
    color: 'pink' | 'purple' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
    const colorClasses = {
        pink: 'bg-pink-100 text-pink-800',
        purple: 'bg-purple-100 text-purple-800',
        red: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4">
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                <i className={`${icon} text-xl`}></i>
            </div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};


export default Dashboard;
