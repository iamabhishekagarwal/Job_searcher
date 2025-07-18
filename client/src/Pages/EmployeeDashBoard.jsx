import React, { useState } from "react";
import { Briefcase, Send } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <section className="px-6 py-12 bg-gradient-to-br from-blue-50 to-blue-100 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-3">Welcome, Employee</h1>
          <p className="text-gray-600 text-lg">
            Discover job opportunities and track your applications in one place.
          </p>
        </div>
      </section>

      {/* Job Listings */}
      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <Briefcase size={22} />
          Available Jobs
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {availableJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-blue-800">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} — {job.location}</p>
              </div>
              <button
                onClick={() => handleApply(job)}
                className="mt-4 self-end bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <Send size={16} />
                Apply
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Applications */}
      <section className="px-6 py-10 bg-white max-w-5xl mx-auto rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <Send size={22} />
          Your Applications
        </h2>
        <div className="grid gap-4">
          {appliedJobs.length === 0 ? (
            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
          ) : (
            appliedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-gray-50 p-4 rounded-xl shadow flex justify-between items-center hover:bg-gray-100 transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company} — {job.location}</p>
                </div>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    job.status === "Under Review"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 mt-10">
        © {new Date().getFullYear()} JobBoard. All rights reserved.
      </footer>
    </div>
  );
}

export default EmployeeDashBoard;
