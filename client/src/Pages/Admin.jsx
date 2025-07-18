import React, { useState } from "react";

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
    <div className="min-h-screen flex bg-white">
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Employees */}
          <div className="bg-blue-50 rounded-2xl shadow p-4">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Employees</h2>
            <ul className="space-y-3">
              {employees.length === 0 && <p className="text-gray-500">No active employees.</p>}
              {employees.map((emp) => (
                <li
                  key={emp.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex justify-between items-center"
                >
                  <p className="font-semibold">{emp.firstName} {emp.lastName}</p>
                  <p className="text-sm text-gray-600">{emp.email}</p>
                  <p className="text-sm text-blue-500">{emp.role}</p>
                  <button
                    onClick={() => handleBan("employee", emp.id)}
                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Ban
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Employers */}
          <div className="bg-blue-50 rounded-2xl shadow p-4">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Employers</h2>
            <ul className="space-y-3">
              {employers.length === 0 && <p className="text-gray-500">No active employers.</p>}
              {employers.map((emp) => (
                <li
                  key={emp.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex justify-between items-center"
                >
                  <p className="font-semibold">{emp.firstName} {emp.lastName}</p>
                  <p className="text-sm text-gray-600">{emp.email}</p>
                  <p className="text-sm text-blue-500">{emp.role}</p>
                  <button
                    onClick={() => handleBan("employer", emp.id)}
                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Ban
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;
