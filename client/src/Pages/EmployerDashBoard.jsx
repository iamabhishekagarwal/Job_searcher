import React, { useState } from "react";
import { PlusCircle, Trash2, Briefcase } from "lucide-react";
import jobCategories from "../data/jobTitles.json"; // adjust the path if needed

function EmployerDashBoard() {
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: ""
  });

  const handleDelete = (id) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedCategory || !newJob.title || !newJob.description || !newJob.location) return;

    const newId = jobs.length ? jobs[jobs.length - 1].id + 1 : 1;
    setJobs([...jobs, { id: newId, category: selectedCategory, ...newJob }]);
    setNewJob({ title: "", description: "", location: "" });
    setSelectedCategory("");
  };

  const titlesForSelectedCategory = jobCategories.find(cat => cat.category === selectedCategory)?.titles || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <section className="px-6 py-12 bg-gradient-to-br from-blue-50 to-blue-100 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-3">Employer Dashboard</h1>
          <p className="text-gray-600 text-lg">Post new jobs and manage your listings.</p>
        </div>
      </section>

      {/* Add New Job Form */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <PlusCircle size={22} /> List a New Job
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setNewJob((prev) => ({ ...prev, title: "" }));
              }}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-blue-400 bg-white"
            >
              <option value="">Select Category</option>
              {jobCategories.map((cat, idx) => (
                <option key={idx} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>

            <select
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              disabled={!selectedCategory}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-blue-400 bg-white"
            >
              <option value="">Select Job Title</option>
              {titlesForSelectedCategory.map((title, idx) => (
                <option key={idx} value={title}>
                  {title}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Location"
              value={newJob.location}
              onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-blue-400"
            />

            <textarea
              placeholder="Job Description"
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-blue-400"
              rows={4}
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Add Job
            </button>
          </form>
        </div>
      </section>

      {/* Job Listings */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
          <Briefcase size={22} />
          Open Job Roles
        </h2>
        <div className="grid gap-5">
          {jobs.length === 0 ? (
            <p className="text-gray-500">You have no active job listings.</p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-blue-50 p-5 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-blue-800">{job.title}</h3>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
                <p className="text-gray-700">{job.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  📂 {job.category} | 📍 {job.location}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 mt-10 border-t bg-white">
        © {new Date().getFullYear()} JobBoard. All rights reserved.
      </footer>
    </div>
  );
}

export default EmployerDashBoard;
