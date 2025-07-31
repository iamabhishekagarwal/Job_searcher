import React, { useState } from "react";

const sampleJobs = [
  { id: 1, title: "Frontend Developer", company: "TCS", location: "Bangalore", tags: ["Full-time", "Remote", "React"] },
  { id: 2, title: "Backend Developer", company: "Infosys", location: "Pune", tags: ["Full-time", "Node.js", "MongoDB"] },
  { id: 3, title: "UI/UX Designer", company: "Adobe", location: "Noida", tags: ["Internship", "Figma"] },
  { id: 4, title: "DevOps Engineer", company: "Amazon", location: "Hyderabad", tags: ["AWS", "Docker"] },
  { id: 5, title: "Data Scientist", company: "Google", location: "Bangalore", tags: ["Remote", "Machine Learning"] },
  { id: 6, title: "Marketing Specialist", company: "Flipkart", location: "Mumbai", tags: ["SEO", "Analytics"] },
];

const JobCard = ({ title, company, location, tags }) => (
  <div className="border rounded-2xl p-4 shadow hover:shadow-lg transition-all bg-white">
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-sm text-gray-600">{company} • {location}</p>
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag, idx) => (
        <span key={idx} className="bg-gray-100 text-sm px-3 py-1 rounded-full">
          {tag}
        </span>
      ))}
    </div>
    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
      Apply Now
    </button>
  </div>
);

const AllJobsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [visibleCount, setVisibleCount] = useState(1);

  const uniqueLocations = ["All", ...new Set(sampleJobs.map(job => job.location))];
  const uniqueTags = ["All", ...new Set(sampleJobs.flatMap(job => job.tags))];

  const filteredJobs = sampleJobs
    .filter(job => selectedLocation === "All" || job.location === selectedLocation)
    .filter(job => selectedTag === "All" || job.tags.includes(selectedTag))
    .sort((a, b) => a[sortBy].localeCompare(b[sortBy]))
    .slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">All Job Listings</h2>

      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
        {/* Filters Column */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-xl shadow">
          <h4 className="text-lg font-semibold mb-4">Filters</h4>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">Location</label>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="w-full p-2 rounded border">
              {uniqueLocations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Tag</label>
            <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)} className="w-full p-2 rounded border">
              {uniqueTags.map((tag, i) => (
                <option key={i} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 rounded border">
              <option value="title">Title</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>

        {/* Job Listings Column */}
        <div className="w-full md:w-3/4">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>

          {visibleCount < sampleJobs.length && (
            <div className="flex justify-center mt-6">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setVisibleCount(prev => prev + 3)}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllJobsPage;
