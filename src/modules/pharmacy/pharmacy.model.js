const mongoose = require("mongoose");
const User = require("../users/user.model");

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    gst: {
      type: String,
      required: true
    },
    phone: String,
    ms: String,
    address: String
  },
  { timestamps: true }
);


// CASCADE DELETE USERS WHEN PHARMACY IS DELETED
pharmacySchema.post("findOneAndDelete", async function (doc) {

  if (doc) {
    await User.deleteMany({ pharmacy: doc._id });
  }

});


module.exports = mongoose.model("Pharmacy", pharmacySchema);