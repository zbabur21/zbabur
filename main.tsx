// FIX: Add imports for React and ReactDOM to fix UMD global errors and replace incorrect React destructuring.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- From utils/csv.ts ---
const exportToCSV = (items, filename) => {
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


// --- From hooks/useInventory.ts ---
const initialItems = [
    { id: '1', name: 'Pink Fabric Rolls', quantity: 12, category: 'Textiles', dateAdded: new Date('2023-10-01T10:00:00Z').toISOString() },
    { id: '2', name: 'Rose Gold Zippers', quantity: 4, category: 'Notions', dateAdded: new Date('2023-10-02T11:30:00Z').toISOString() },
    { id: '3', name: 'Blush Sewing Thread', quantity: 25, category: 'Notions', dateAdded: new Date('2023-10-03T09:00:00Z').toISOString() },
    { id: '4', name: 'Pastel Buttons Pack', quantity: 8, category: 'Notions', dateAdded: new Date('2023-10-04T14:20:00Z').toISOString() },
    { id: '5', name: 'Cotton Candy Stuffing', quantity: 2, category: 'Fillings', dateAdded: new Date('2023-10-05T16:00:00Z').toISOString() },
];

const useInventory = () => {
    const [items, setItems] = useState(() => {
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

    const addItem = useCallback((item) => {
        const newItem = {
            ...item,
            id: new Date().getTime().toString(),
            dateAdded: new Date().toISOString(),
        };
        setItems(prevItems => [newItem, ...prevItems]);
    }, []);

    const updateItemQuantity = useCallback((id, amount) => {
        setItems(prevItems => 
            prevItems.map(item => 
                item.id === id 
                    ? { ...item, quantity: Math.max(0, item.quantity + amount) } 
                    : item
            )
        );
    }, []);

    const deleteItem = useCallback((id) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    const getUniqueCategories = useCallback(() => {
        const categories = new Set(items.map(item => item.category).filter(Boolean));
        return Array.from(categories).sort();
    }, [items]);

    return { items, addItem, updateItemQuantity, deleteItem, getUniqueCategories };
};


// --- From components/Header.tsx ---
const Header = ({ onAddItemClick }) => {
    return (
        <header className="flex justify-between items-center py-2">
            <h1 className="text-3xl font-bold text-pink-500">
                PinkStock Manager
            </h1>
            <button
                onClick={onAddItemClick}
                className="bg-pink-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 flex items-center"
            >
                <i className="fas fa-plus mr-2"></i>
                Add Item
            </button>
        </header>
    );
};


// --- From components/Dashboard.tsx ---
const StatCard = ({ icon, title, value, color }) => {
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

const Dashboard = ({ items }) => {
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


// --- From components/SearchAndFilter.tsx ---
const SearchAndFilter = ({
    searchTerm,
    onSearchTermChange,
    filterCategory,
    onFilterCategoryChange,
    showLowStockOnly,
    onShowLowStockOnlyChange,
    categories,
    onExport
}) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
            <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Search items by name..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                    value={filterCategory}
                    onChange={(e) => onFilterCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <label className="flex items-center justify-center space-x-2 bg-gray-100 p-2 rounded-full cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showLowStockOnly}
                        onChange={(e) => onShowLowStockOnlyChange(e.target.checked)}
                        className="h-4 w-4 rounded text-pink-500 focus:ring-pink-400 border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Low Stock Only</span>
                </label>
            </div>
            <button
                onClick={onExport}
                className="w-full bg-white text-pink-500 border-2 border-pink-500 font-bold py-2 px-4 rounded-full hover:bg-pink-500 hover:text-white transition-colors duration-300 flex items-center justify-center"
            >
                <i className="fas fa-file-csv mr-2"></i>
                Export to CSV
            </button>
        </div>
    );
};


// --- From components/InventoryList.tsx ---
const InventoryListItem = ({ item, onUpdateQuantity, onDeleteItem }) => {
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

const InventoryList = ({ items, onUpdateQuantity, onDeleteItem }) => {
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


// --- From components/AddItemModal.tsx ---
const AddItemModal = ({ isOpen, onClose, onAddItem }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setQuantity('');
            setCategory('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !quantity) {
            alert('Please fill in both name and quantity.');
            return;
        }
        onAddItem({
            name,
            quantity: parseInt(quantity, 10),
            category
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-pink-500">Add New Item</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Item Name*</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                        <input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                        <input
                            id="category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g., Textiles, Notions"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors">
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- From App.tsx ---
const App = () => {
    const { 
        items, 
        addItem, 
        updateItemQuantity, 
        deleteItem,
        getUniqueCategories,
    } = useInventory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
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

    const handleAddItem = useCallback((item) => {
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

// --- From index.tsx ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);