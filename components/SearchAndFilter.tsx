
import React from 'react';

interface SearchAndFilterProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    filterCategory: string;
    onFilterCategoryChange: (category: string) => void;
    showLowStockOnly: boolean;
    onShowLowStockOnlyChange: (show: boolean) => void;
    categories: string[];
    onExport: () => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
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

export default SearchAndFilter;
