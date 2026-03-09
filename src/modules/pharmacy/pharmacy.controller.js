const Pharmacy = require("./pharmacy.model");


// CREATE PHARMACY
exports.createPharmacy = async (req, res) => {
  try {

    const pharmacy = await Pharmacy.create(req.body);

    res.status(201).json(pharmacy);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET ALL PHARMACIES
exports.getPharmacies = async (req, res) => {
  try {

    const pharmacies = await Pharmacy.find();

    res.json(pharmacies);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET SINGLE PHARMACY
exports.getPharmacy = async (req, res) => {
  try {

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    res.json(pharmacy);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE PHARMACY
exports.updatePharmacy = async (req, res) => {
  try {

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(pharmacy);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE PHARMACY
exports.deletePharmacy = async (req, res) => {
  try {

    const pharmacy = await Pharmacy.findOneAndDelete({
      _id: req.params.id
    });

    res.json({
      message: "Pharmacy and related users deleted"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};