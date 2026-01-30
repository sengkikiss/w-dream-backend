const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
  createJob,
  listJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  submitProposal,
} = require("../controllers/jobController");

// Public: list jobs
router.get("/", listJobs);

// Protected: client lists their own jobs
router.get("/my", protect, authorize("client"), getMyJobs);

// Public: get job by ID
router.get("/:id", getJobById);

// Protected: client creates job
router.post("/", protect, authorize("client"), createJob);

// Protected: client updates job by ID
router.put("/:id", protect, authorize("client"), updateJob);

// ✅ Protected: client deletes job by ID
router.delete("/:id", protect, authorize("client"), deleteJob);

// Protected: freelancer submits proposal
router.post("/:id/proposals", protect, authorize("freelancer"), submitProposal);

module.exports = router;
