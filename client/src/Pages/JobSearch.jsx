import React, { useState } from "react";

const jobData = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TCS",
    location: "Bangalore",
    type: "Full-time",
    category: "Development",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Zoho",
    location: "Chennai",
    type: "Internship",
    category: "Design",
  },
  {
    id: 3,
    title: "Digital Marketer",
    company: "Nykaa",
    location: "Remote",
    type: "Part-time",
    category: "Marketing",
  },
];

const categories = ["Design", "Development", "Marketing"];
const jobTypes = ["Full-time", "Part-time", "Internship"];
const locations = ["Bangalore", "Chennai", "Remote"];

const JobCard = ({ title, company, location, type }) => (
  <div className="border p-4 rounded-lg shadow bg-white hover:shadow-md transition">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-gray-600">{company} • {location}</p>
    <span className="inline-block mt-2 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
      {type}
    </span>
    <button className="block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
      Apply
    </button>
  </div>
);

const JobSearchPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const filteredJobs = jobData.filter((job) => {
    return (
      (search === "" || job.title.toLowerCase().includes(search.toLowerCase())) &&
      (selectedCategory === "" || job.category === selectedCategory) &&
      (selectedLocation === "" || job.location === selectedLocation) &&
      (selectedType === "" || job.type === selectedType)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Jobs</h1>

      {/* Search Input */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search job title..."
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <div className="mb-4">
            <label className="font-medium block mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="font-medium block mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium block mb-2">Job Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Job Listings */}
        <main className="lg:w-3/4">
          {filteredJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-8">No jobs found.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobSearchPage;
