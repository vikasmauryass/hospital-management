const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/users", require("./modules/users/user.routes"));
app.use("/api/roles", require("./modules/roles/role.routes"));
app.use("/api/permissions", require("./modules/permissions/permission.routes"));
app.use("/api/pharmacy", require("./modules/pharmacy/pharmacy.routes"));


module.exports = app;