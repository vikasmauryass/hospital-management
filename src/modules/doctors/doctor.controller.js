// src/modules/doctors/doctor.controller.js

const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const Doctor = require("./doctor.model");


// ─── Helper: safe error response ─────────────────────────────────────────────
const fail = (res, status, message) => res.status(status).json({ error: message });


// ─── CREATE DOCTOR ────────────────────────────────────────────────────────────
// POST /api/doctors
// Body: { name, email, phone, password, consultationFees, qualification, specialist, pharmacyId }
exports.createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      consultationFees,
      qualification,
      specialist,
      pharmacyId,
    } = req.body;

    // ── Validation ──
    if (!name || !email || !phone || !password || !consultationFees) {
      return fail(res, 400, "name, email, phone, password and consultationFees are required");
    }

    // ── Check duplicate email ──
    const existingUser = await User.findOne({ email });
    if (existingUser) return fail(res, 400, "Email already registered");

    // ── Create User (for login) ──
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      pharmacy: pharmacyId || null,
    });

    // ── Create Doctor record ──
    const doctor = await Doctor.create({
      user: user._id,
      pharmacy: pharmacyId || null,
      name,
      email,
      phoneno: phone,
      degree: qualification || null,
      fees: consultationFees,
      specialist: specialist || null,
    });

    // Return doctor with user populated
    const populated = await Doctor.findById(doctor._id)
      .populate("user", "-password")
      .populate("pharmacy");

    res.status(201).json(populated);
  } catch (error) {
    fail(res, 500, error.message);
  }
};


// ─── GET ALL DOCTORS ──────────────────────────────────────────────────────────
// GET /api/doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "-password")
      .populate("pharmacy")
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    fail(res, 500, error.message);
  }
};


// ─── GET SINGLE DOCTOR ────────────────────────────────────────────────────────
// GET /api/doctors/:id
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("user", "-password")
      .populate("pharmacy");

    if (!doctor) return fail(res, 404, "Doctor not found");

    res.json(doctor);
  } catch (error) {
    fail(res, 500, error.message);
  }
};


// ─── UPDATE DOCTOR ────────────────────────────────────────────────────────────
// PUT /api/doctors/:id
// Body: any subset of { name, email, phone, consultationFees, qualification, specialist, pharmacyId, password, confirmPassword }
exports.updateDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      consultationFees,
      qualification,
      specialist,
      pharmacyId,
      password,
      confirmPassword,
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return fail(res, 404, "Doctor not found");

    // ── If email is changing, check it's not taken ──
    if (email && email !== doctor.email) {
      const taken = await User.findOne({ email });
      if (taken) return fail(res, 400, "Email already in use");
    }

    // ── Update doctor fields ──
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (phone) doctor.phoneno = phone;
    if (consultationFees !== undefined) doctor.fees = consultationFees;
    if (qualification !== undefined) doctor.degree = qualification;
    if (specialist !== undefined) doctor.specialist = specialist;
    if (pharmacyId !== undefined) doctor.pharmacy = pharmacyId || null;

    await doctor.save();

    // ── Sync User record ──
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email;
    if (pharmacyId !== undefined) userUpdates.pharmacy = pharmacyId || null;

    // Handle password change
    if (password) {
      if (password !== confirmPassword) {
        return fail(res, 400, "Passwords do not match");
      }
      userUpdates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userUpdates).length) {
      await User.findByIdAndUpdate(doctor.user, userUpdates);
    }

    const updated = await Doctor.findById(doctor._id)
      .populate("user", "-password")
      .populate("pharmacy");

    res.json(updated);
  } catch (error) {
    fail(res, 500, error.message);
  }
};


// ─── DELETE DOCTOR ────────────────────────────────────────────────────────────
// DELETE /api/doctors/:id
// Also deletes the linked User account
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return fail(res, 404, "Doctor not found");

    // Delete linked user account too
    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ message: "Doctor and linked user account deleted" });
  } catch (error) {
    fail(res, 500, error.message);
  }
};