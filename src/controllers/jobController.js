const mongoose = require("mongoose");
const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const User = require("../models/User");

// =======================
// CREATE JOB
// =======================
const createJob = async (req, res) => {
  try {
    const { title, description, budget, duration, skills, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const job = await Job.create({
      clientId: req.user._id,
      title,
      description,
      budget: budget || {},
      duration,
      skills: skills || [],
      category,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "clientProfile.postedJobs": 1 },
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ success: false, message: "Create job failed" });
  }
};

// =======================
// LIST JOBS (PUBLIC)
// =======================
const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, jobs });
  } catch (error) {
    console.error("List jobs error:", error);
    res.status(500).json({ success: false, message: "List jobs failed" });
  }
};

// =======================
// GET JOB BY ID
// =======================
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("proposals");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ success: false, message: "Get job failed" });
  }
};

// =======================
// GET MY JOBS
// =======================
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (error) {
    console.error("Get my jobs error:", error);
    res.status(500).json({ success: false, message: "Get my jobs failed" });
  }
};

// =======================
// UPDATE JOB
// =======================
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (String(job.clientId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// =======================
// ✅ DELETE JOB BY ID
// =======================
const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    // validate ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // only owner can delete
    if (String(job.clientId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this job",
      });
    }

    // delete related proposals
    await Proposal.deleteMany({ jobId });

    // delete job
    await Job.findByIdAndDelete(jobId);

    // decrement postedJobs
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "clientProfile.postedJobs": -1 },
    });

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      success: false,
      message: "Delete job failed",
    });
  }
};

// =======================
// SUBMIT PROPOSAL
// =======================
const submitProposal = async (req, res) => {
  try {
    const { coverLetter, proposedRate, estimatedDuration } = req.body;

    if (!coverLetter || !proposedRate || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const proposal = await Proposal.create({
      jobId: req.params.id,
      freelancerId: req.user._id,
      coverLetter,
      proposedRate,
      estimatedDuration,
    });

    await Job.findByIdAndUpdate(req.params.id, {
      $push: { proposals: proposal._id },
    });

    res.status(201).json({ success: true, proposal });
  } catch (error) {
    console.error("Submit proposal error:", error);
    res.status(500).json({ success: false, message: "Submit failed" });
  }
};

module.exports = {
  createJob,
  listJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  submitProposal,
};
