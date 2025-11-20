

const TabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`py-2 px-1 text-base font-medium transition-colors duration-150 focus:outline-none
            ${isActive
                ? 'border-b-2 border-blue-600 text-blue-600' // Active tab style
                : 'text-gray-500 hover:text-gray-800' // Inactive tab style
            }
        `}
    >
        {label}
    </button>
);

export default TabButton;