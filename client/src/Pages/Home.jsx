import React from "react";
import { Search, Star } from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TCS",
    location: "Bangalore",
    tags: ["Full-time", "Remote", "React"],
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Zoho",
    location: "Chennai",
    tags: ["Internship", "On-site", "Figma"],
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "Swiggy",
    location: "Remote",
    tags: ["Full-time", "Node.js", "MongoDB"],
  },
];

const categories = [
  "Design", "Development", "Marketing", "Data Science", "Sales", "Support"
];

const testimonials = [
  {
    name: "Anjali Sharma",
    position: "Frontend Engineer",
    quote: "Thanks to JobBoard, I landed my dream job within a week!",
  },
  {
    name: "Rahul Verma",
    position: "Backend Developer",
    quote: "The interface is clean and the job suggestions are accurate.",
  },
];

const JobCard = ({ title, company, location, tags }) => (
  <div className="border rounded-2xl p-4 shadow-md hover:shadow-lg transition-all bg-white">
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

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-700">JobBoard</h1>
        <div className="space-x-4">
          <button className="text-blue-600 font-medium">Login</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-12 bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Find Your Dream Job</h2>
          <p className="text-gray-600 mb-6">
            Explore thousands of job opportunities tailored just for you.
          </p>
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              placeholder="Search by job title or keyword..."
              className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:outline-none"
            />
            <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="px-6 py-10 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">Featured Jobs</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-10 bg-white">
        <h3 className="text-2xl font-bold mb-6 text-center">Explore by Categories</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat, index) => (
            <button
              key={index}
              className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full hover:bg-purple-200 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-12 bg-gray-100">
        <h3 className="text-2xl font-bold mb-6 text-center">What Users Say</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-700 mb-4 italic">“{t.quote}”</p>
              <div className="flex items-center gap-3">
                <Star size={16} className="text-yellow-400" />
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} JobBoard. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
