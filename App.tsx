
import React, { useState, useMemo, useCallback } from 'react';
import { useInventory } from './hooks/useInventory';
import type { InventoryItem } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SearchAndFilter from './components/SearchAndFilter';
import InventoryList from './components/InventoryList';
import AddItemModal from './components/AddItemModal';
import { exportToCSV } from './utils/csv';

const App: React.FC = () => {
    const { 
        items, 
        addItem, 
        updateItemQuantity, 
        deleteItem,
        getUniqueCategories,
    } = useInventory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    const filteredItems = useMemo(() => {
        return items
            .filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(item => 
                filterCategory ? item.category === filterCategory : true
            )
            .filter(item => 
                showLowStockOnly ? item.quantity < 5 : true
            )
            .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }, [items, searchTerm, filterCategory, showLowStockOnly]);

    const handleAddItem = useCallback((item: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
        addItem(item);
        setIsModalOpen(false);
    }, [addItem]);

    const handleExport = useCallback(() => {
        exportToCSV(items, 'pinkstock_inventory_backup');
    }, [items]);

    return (
        <div className="min-h-screen font-sans text-gray-800">
            <div className="container mx-auto max-w-lg p-4">
                <Header onAddItemClick={() => setIsModalOpen(true)} />
                
                <main className="mt-4 space-y-6">
                    <Dashboard items={items} />
                    <SearchAndFilter
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        filterCategory={filterCategory}
                        onFilterCategoryChange={setFilterCategory}
                        showLowStockOnly={showLowStockOnly}
                        onShowLowStockOnlyChange={setShowLowStockOnly}
                        categories={getUniqueCategories()}
                        onExport={handleExport}
                    />
                    <InventoryList 
                        items={filteredItems} 
                        onUpdateQuantity={updateItemQuantity} 
                        onDeleteItem={deleteItem}
                    />
                </main>
            </div>

            <AddItemModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddItem={handleAddItem}
            />
        </div>
    );
};

export default App;
