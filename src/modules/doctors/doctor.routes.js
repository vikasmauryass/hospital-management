// src/modules/doctors/doctor.routes.js

const router = require("express").Router();
const doctorController = require("./doctor.controller");

// POST   /api/doctors        — create doctor + user
router.post("/", doctorController.createDoctor);

// GET    /api/doctors        — list all doctors
router.get("/", doctorController.getDoctors);

// GET    /api/doctors/:id    — single doctor
router.get("/:id", doctorController.getDoctor);

// PUT    /api/doctors/:id    — update doctor (+ user)
router.put("/:id", doctorController.updateDoctor);

// DELETE /api/doctors/:id    — delete doctor + user
router.delete("/:id", doctorController.deleteDoctor);

module.exports = router;