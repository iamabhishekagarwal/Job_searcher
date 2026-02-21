import { motion } from "framer-motion";
import { useEffect } from "react";
import axiosInstance from "../axios";

export default function JobCard({ job }) {
  useEffect(() => {
    // Check if this job was clicked before
    const checkAndApply = async () => {
      let clickedJobs = JSON.parse(
        localStorage.getItem("clickedJobs") || "[]"
      );

      if (clickedJobs.includes(job.id)) {
        const confirmed = window.confirm(
          `Did you apply for this job: ${job.title}?`
        );
        clickedJobs = clickedJobs.filter((id) => id !== job.id);
        localStorage.setItem("clickedJobs", JSON.stringify(clickedJobs));
        if (confirmed) {
          await axiosInstance.post("api/user/jobs/applied/add", {
            jobIDs: [job.id],
          });
        }
      }
    };
    checkAndApply();
  }, [job.id, job.title]);

  const handleApplyClick = (e) => {
    e.preventDefault();
    // Save that user clicked Apply for this job
    const clickedJobs = JSON.parse(localStorage.getItem("clickedJobs") || "[]");
    if (!clickedJobs.includes(job.id)) {
      clickedJobs.push(job.id);
      localStorage.setItem("clickedJobs", JSON.stringify(clickedJobs));
    }

    // Redirect to job URL
    window.open(job.jobUrl, "_blank");
  };

  return (
    <motion.a
      href={job.jobUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-center font-semibold py-3 rounded-xl transition duration-300 transform hover:scale-105"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleApplyClick}
    >
      Apply Now
    </motion.a>
  );
}
