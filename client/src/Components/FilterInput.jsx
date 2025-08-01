import React from "react";

const FilterInput = ({
  label,
  query,
  setQuery,
  suggestions,
  onSelect,
  selectedItems,
  onRemove,
  isActive,
  setActiveFilter,
}) => {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">{label}</label>
      <input
        type="text"
        value={query}
        onFocus={() => setActiveFilter(label.toLowerCase())}
        onChange={(e) => setQuery(e.target.value)}
        className="border px-2 py-1 w-full rounded"
        placeholder={`Search ${label.toLowerCase()}...`}
      />
      {isActive && suggestions.length > 0 && (
        <ul className="border mt-1 rounded bg-white max-h-48 overflow-y-auto shadow-md z-10 relative">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect((prev) => [...new Set([...prev, item])]);
                setQuery("");
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap mt-2 gap-1">
        {selectedItems.map((item, idx) => (
          <span
            key={idx}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
          >
            {item}
            <button
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={() => onRemove(item)}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default FilterInput;
