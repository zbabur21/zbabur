
import React from 'react';

interface HeaderProps {
    onAddItemClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddItemClick }) => {
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

export default Header;
