
import React from 'react';
import type { InventoryItem } from '../types';

interface InventoryListProps {
    items: InventoryItem[];
    onUpdateQuantity: (id: string, amount: number) => void;
    onDeleteItem: (id: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onUpdateQuantity, onDeleteItem }) => {
    if (items.length === 0) {
        return (
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
                <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-700">No Inventory Items</h3>
                <p className="text-gray-500 mt-2">Your inventory is empty. Click "Add Item" to get started.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {items.map(item => (
                <InventoryListItem 
                    key={item.id} 
                    item={item} 
                    onUpdateQuantity={onUpdateQuantity}
                    onDeleteItem={onDeleteItem}
                />
            ))}
        </div>
    );
};

interface InventoryListItemProps {
    item: InventoryItem;
    onUpdateQuantity: (id: string, amount: number) => void;
    onDeleteItem: (id: string) => void;
}

const InventoryListItem: React.FC<InventoryListItemProps> = ({ item, onUpdateQuantity, onDeleteItem }) => {
    const isLowStock = item.quantity < 5;

    return (
        <div className={`bg-white p-4 rounded-xl shadow-md flex items-center transition-all duration-300 ${isLowStock ? 'bg-red-50 border-l-4 border-red-400' : 'border-l-4 border-pink-400'}`}>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <button onClick={() => onDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
                {item.category && (
                    <span className="text-xs font-semibold bg-pink-100 text-pink-800 px-2 py-1 rounded-full">{item.category}</span>
                )}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} disabled={item.quantity === 0} className="w-8 h-8 rounded-full bg-pink-200 text-pink-800 hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg flex items-center justify-center">
                            <span>-</span>
                        </button>
                        <span className="text-xl font-bold w-10 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-pink-200 text-pink-800 hover:bg-pink-300 transition-colors font-bold text-lg flex items-center justify-center">
                            <span>+</span>
                        </button>
                    </div>
                    {isLowStock && <span className="text-sm font-bold text-red-500">Low Stock!</span>}
                </div>
            </div>
        </div>
    );
};


export default InventoryList;
