
import type { InventoryItem } from '../types';

export const exportToCSV = (items: InventoryItem[], filename: string) => {
    if (items.length === 0) {
        alert("No items to export.");
        return;
    }

    const headers = ['ID', 'Name', 'Quantity', 'Category', 'Date Added'];
    const rows = items.map(item => 
        [
            item.id,
            `"${item.name.replace(/"/g, '""')}"`, // Handle quotes in name
            item.quantity,
            `"${item.category?.replace(/"/g, '""') || ''}"`,
            item.dateAdded
        ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
