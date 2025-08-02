import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios.js";
import FilterInput from "../Components/FilterInput";
import useDebounce from "../hooks/useDebounce.js";

const filterTypes = [
  { key: "tags", label: "Tags" },
  { key: "locations", label: "Locations" },
  { key: "companies", label: "Companies" },
  { key: "vias", label: "Via" },
];

const AllJobsPage = () => {
  // Query and selected state per filter
  const [queries, setQueries] = useState({
    tags: "",
    locations: "",
    companies: "",
    vias: "",
  });
  const [selected, setSelected] = useState({
    tags: [],
    locations: [],
    companies: [],
    vias: [],
  });

  // Suggestions per filter
  const [suggestions, setSuggestions] = useState({
    tags: [],
    locations: [],
    companies: [],
    vias: [],
  });

  // Track which filter input is active (open dropdown)
  const [activeFilter, setActiveFilter] = useState("");

  // Debounced query string per filter
  const debouncedQueries = {
    tags: useDebounce(queries.tags, 200),
    locations: useDebounce(queries.locations, 200),
    companies: useDebounce(queries.companies, 200),
    vias: useDebounce(queries.vias, 200),
  };
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15); // number of jobs per page
  const [totalJobs, setTotalJobs] = useState(0);

  // Fetch suggestions as user types
  const query = debouncedQueries[activeFilter];

  useEffect(() => {
    if (!activeFilter || !query) {
      setSuggestions((prev) => ({ ...prev, [activeFilter]: [] }));
      return;
    }

    axiosInstance
      .get(`/api/user/filters`, {
        params: {
          type: activeFilter,
          query,
          limit: 10,
        },
      })
      .then((res) => {
        setSuggestions((prev) => ({
          ...prev,
          [activeFilter]: res.data.items || [],
        }));
      })
      .catch(() => {
        setSuggestions((prev) => ({ ...prev, [activeFilter]: [] }));
      });
  }, [query, activeFilter]);
  // Remove item helper
  const removeItem = (filterKey, value) => {
    setSelected((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey].filter((item) => item !== value),
    }));
  };

  // Add item helper
  const addItem = (filterKey, value) => {
    setSelected((prev) => ({
      ...prev,
      [filterKey]: Array.from(new Set([...prev[filterKey], value])),
    }));
    setQueries((prev) => ({ ...prev, [filterKey]: "" }));
  };
  useEffect(() => {
    setPage(1);
  }, [selected]);

  // Job fetch
  const [jobs, setJobs] = useState([]);
  const fetchJobs = useCallback(() => {
    axiosInstance
      .get("/api/user/getJobs", {params:{
        tags: selected.tags || [],
        locations: selected.locations || [],
        companies: selected.companies || [],
        vias: selected.vias || [],
        page,
        limit,
      }})
      .then((res) => {
        setJobs(res.data.jobs);
        setTotalJobs(res.data.totalCount || 0); // Set total jobs count
      })
      .catch((e) => console.error(e));
  }, [
    selected.tags,
    selected.locations,
    selected.companies,
    selected.vias,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const totalPages = Math.ceil(totalJobs / limit);

  return (
    <div className="flex gap-6 px-4">
      <div className="w-full max-w-xs space-y-4">
        {filterTypes.map(({ key, label }) => (
          <FilterInput
            key={key}
            label={label}
            query={queries[key]}
            setQuery={(val) => setQueries((prev) => ({ ...prev, [key]: val }))}
            suggestions={suggestions[key].filter(
              (item) => !selected[key].includes(item)
            )}
            onSelect={(updateFn) => {
              // updateFn is a function like prev => newSelectedItemsArray from <FilterInput>
              setSelected((prev) => ({
                ...prev,
                [key]: updateFn(prev[key]),
              }));
              setQueries((prev) => ({ ...prev, [key]: "" }));
            }}
            selectedItems={selected[key]}
            onRemove={(item) => removeItem(key, item)}
            isActive={activeFilter === key}
            setActiveFilter={() => setActiveFilter(key)}
          />
        ))}

        <button
          onClick={fetchJobs}
          className="bg-blue-700 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition duration-200"
        >
          Apply
        </button>
      </div>

      <div>
        {/* Display Jobs */}
        <h2 className="text-lg font-semibold my-4">Jobs ({jobs.length})</h2>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border rounded-lg shadow-md p-4 flex flex-col"
              >
                {/* Company logo */}
                <div className="flex items-center mb-4">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={`${job.companyName} logo`}
                      className="w-16 h-16 object-contain rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      N/A
                    </div>
                  )}
                  <div className="ml-4">
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <p className="text-sm font-medium text-gray-600">
                      {job.companyName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {job.location} • {job.experience} • {job.jobType}
                    </p>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                  {job.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer line: postedAt, via */}
                <div className="text-xs text-gray-500 mb-4 flex justify-between">
                  <span>Posted: {job.postedAt}</span>
                  <span>Via: {job.via}</span>
                </div>

                {/* Apply button */}
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-2 rounded transition duration-200"
                >
                  Apply
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllJobsPage;
