{/* Locations */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Locations</label>
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setlocationQuery(e.target.value)}
              placeholder="Search Locations..."
              className="w-full p-2 rounded border"
            />

            {filteredSuggestions.length > 0 && (
              <ul className="mt-2 border rounded bg-white max-h-48 overflow-y-auto shadow">
                {filteredSuggestions.map((location, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      if (!selectedLocations.includes(location)) {
                        setSelectedLocations([...selectedLocations, location]);
                      }
                      setlocationQuery("");
                      setFilteredSuggestions([]);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                  >
                    {location}
                  </li>
                ))}
              </ul>
            )}
            {/* Display selected Locations */}
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedLocations.map((location, i) => (
                <span
                  key={i}
                  className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  {location}
                  <button
                    onClick={() => removelocation(location)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>