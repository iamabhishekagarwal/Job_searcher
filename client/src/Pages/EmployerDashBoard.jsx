import React, { useState } from "react";

function EmployerDashBoard() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      description: "Looking for a React developer with 2+ years experience.",
      location: "Bangalore",
    },
    {
      id: 2,
      title: "Backend Developer",
      description: "Node.js developer with knowledge of databases.",
      location: "Remote",
    },
  ]);

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
  });

  const handleDelete = (id) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description || !newJob.location) return;

    const newId = jobs.length ? jobs[jobs.length - 1].id + 1 : 1;
    setJobs([...jobs, { id: newId, ...newJob }]);
    setNewJob({ title: "", description: "", location: "" });
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Employer Dashboard</h1>

      {/* Add New Job Form */}
      <div className="bg-blue-50 p-6 rounded-2xl shadow mb-10">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">List a New Job</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <input
            type="text"
            placeholder="Job Title"
            value={newJob.title}
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={newJob.location}
            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded"
          />
          <textarea
            placeholder="Job Description"
            value={newJob.description}
            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Job
          </button>
        </form>
      </div>

      {/* Open Job Listings */}
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Open Job Roles</h2>
        <div className="grid gap-4">
          {jobs.length === 0 ? (
            <p className="text-gray-500">No open roles currently.</p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-blue-100 p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-blue-800">{job.title}</h3>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-700">{job.description}</p>
                <p className="text-sm text-gray-500 mt-1">📍 {job.location}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployerDashBoard;
