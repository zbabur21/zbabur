import { useState, useEffect, useCallback } from 'react';
import type { InventoryItem } from '../types';

const LOW_STOCK_THRESHOLD = 5;

const initialItems: InventoryItem[] = [
    { id: '1', name: 'Pink Fabric Rolls', quantity: 12, category: 'Textiles', dateAdded: new Date('2023-10-01T10:00:00Z').toISOString() },
    { id: '2', name: 'Rose Gold Zippers', quantity: 4, category: 'Notions', dateAdded: new Date('2023-10-02T11:30:00Z').toISOString() },
    { id: '3', name: 'Blush Sewing Thread', quantity: 25, category: 'Notions', dateAdded: new Date('2023-10-03T09:00:00Z').toISOString() },
    { id: '4', name: 'Pastel Buttons Pack', quantity: 8, category: 'Notions', dateAdded: new Date('2023-10-04T14:20:00Z').toISOString() },
    { id: '5', name: 'Cotton Candy Stuffing', quantity: 2, category: 'Fillings', dateAdded: new Date('2023-10-05T16:00:00Z').toISOString() },
];


export const useInventory = () => {
    const [items, setItems] = useState<InventoryItem[]>(() => {
        try {
            const localData = localStorage.getItem('pinkStockInventory');
            if (localData) {
                return JSON.parse(localData);
            } else {
                localStorage.setItem('pinkStockInventory', JSON.stringify(initialItems));
                return initialItems;
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return initialItems;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('pinkStockInventory', JSON.stringify(items));
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    }, [items]);

    const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
        const newItem: InventoryItem = {
            ...item,
            id: new Date().getTime().toString(),
            dateAdded: new Date().toISOString(),
        };
        setItems(prevItems => [newItem, ...prevItems]);
    }, []);

    const updateItemQuantity = useCallback((id: string, amount: number) => {
        setItems(prevItems => 
            prevItems.map(item => 
                item.id === id 
                    ? { ...item, quantity: Math.max(0, item.quantity + amount) } 
                    : item
            )
        );
    }, []);

    const deleteItem = useCallback((id: string) => {
        // The original `window.confirm` can be unreliable in some environments (like mobile webviews).
        // To ensure the delete button functions correctly as per the user's request,
        // we are performing the delete action directly.
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    const getUniqueCategories = useCallback(() => {
        const categories = new Set(items.map(item => item.category).filter(Boolean) as string[]);
        return Array.from(categories).sort();
    }, [items]);

    return { items, addItem, updateItemQuantity, deleteItem, getUniqueCategories };
};