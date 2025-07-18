import React, { useState } from "react";

function EmployeeDashBoard() {
  const availableJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Bangalore",
    },
    {
      id: 2,
      title: "Data Analyst",
      company: "DataCo",
      location: "Remote",
    },
  ];

  const [appliedJobs, setAppliedJobs] = useState([
    {
      id: 3,
      title: "Backend Developer",
      company: "CodeWorks",
      location: "Mumbai",
      status: "Under Review",
    },
  ]);

  const handleApply = (job) => {
    const alreadyApplied = appliedJobs.some((j) => j.id === job.id);
    if (!alreadyApplied) {
      setAppliedJobs([...appliedJobs, { ...job, status: "Applied" }]);
    } else {
      alert("You've already applied to this job.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Employee Dashboard</h1>

      {/* Apply to Jobs Section */}
      <div className="bg-blue-50 p-6 rounded-2xl shadow mb-10">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Apply for New Jobs</h2>
        <div className="grid gap-4">
          {availableJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold text-blue-800">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} — {job.location}</p>
              </div>
              <button
                onClick={() => handleApply(job)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Applications Status Section */}
      <div className="bg-blue-50 p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Your Applications</h2>
        <div className="grid gap-4">
          {appliedJobs.length === 0 ? (
            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
          ) : (
            appliedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-blue-800">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company} — {job.location}</p>
                </div>
                <p className="text-sm font-semibold text-green-600">{job.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashBoard;
