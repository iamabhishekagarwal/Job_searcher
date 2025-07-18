import React, { useState } from "react";
import { ShieldBan, Users, Briefcase } from "lucide-react";

function Admin() {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: "Aditya",
      lastName: "Umesh",
      email: "aditya@example.com",
      isAdmin: false,
      role: "Employee",
    },
    {
      id: 2,
      firstName: "Riya",
      lastName: "Singh",
      email: "riya@example.com",
      isAdmin: false,
      role: "Employee",
    },
  ]);

  const [employers, setEmployers] = useState([
    {
      id: 3,
      firstName: "Karan",
      lastName: "Verma",
      email: "karan@company.com",
      isAdmin: true,
      role: "Company",
    },
    {
      id: 4,
      firstName: "Sonam",
      lastName: "Gupta",
      email: "neha@bewafa.com",
      isAdmin: true,
      role: "Company",
    },
  ]);

  const handleBan = (type, id) => {
    const confirmBan = window.confirm("Are you sure you want to ban this user?");
    if (!confirmBan) return;

    if (type === "employee") {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } else if (type === "employer") {
      setEmployers((prev) => prev.filter((emp) => emp.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <section className="px-6 py-12 bg-gradient-to-br from-blue-50 to-blue-100 shadow-inner">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all users across the platform</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-6 py-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Employees */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <Users size={22} />
              Employees
            </h2>
            <ul className="space-y-3">
              {employees.length === 0 ? (
                <p className="text-gray-500">No active employees.</p>
              ) : (
                employees.map((emp) => (
                  <li
                    key={emp.id}
                    className="bg-blue-50 p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-blue-900">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{emp.email}</p>
                      <span className="text-xs inline-block mt-1 bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                        {emp.role}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBan("employee", emp.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <ShieldBan size={16} />
                      Ban
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Employers */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <Briefcase size={22} />
              Employers
            </h2>
            <ul className="space-y-3">
              {employers.length === 0 ? (
                <p className="text-gray-500">No active employers.</p>
              ) : (
                employers.map((emp) => (
                  <li
                    key={emp.id}
                    className="bg-blue-50 p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-blue-900">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{emp.email}</p>
                      <span className="text-xs inline-block mt-1 bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                        {emp.role}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBan("employer", emp.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <ShieldBan size={16} />
                      Ban
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} JobBoard Admin. All rights reserved.
      </footer>
    </div>
  );
}

export default Admin;
