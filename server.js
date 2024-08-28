const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const signupRoutes = require("./routes/signupRoutes");
// const productRoutes = require("./Routes/productRoutes");
// const clientRoutes = require("./Routes/clientRoutes");
// const warehouseRoutes = require("./Routes/warehouseRoutes");
// const emailRoutes = require("./Routes/emailRoute");
// const cashierRoutes = require("./Routes/cashierRoutes");
const https = require("https");
const fs = require("fs");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB

// mongoose
//   .connect("mongodb+srv://hexlertech:vQEmfMxnymZ510vo@cluster0.gyfkxge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

mongoose
  .connect("mongodb://127.0.0.1:27017/nstp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error: ", err));

app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log("timezone: ", timezone);

app.get("/", (req, res) => {
  res.send("Welcome to the NSTP Portal");
});

// Use auth routes
app.use("/auth", authRoutes);
app.use("/signup", signupRoutes);

// // SSL options
// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/nimbus360.org/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/nimbus360.org/fullchain.pem')
// };

// // Create HTTPS server
// https.createServer(options, app).listen(PORT, () => {
//   console.log(`HTTPS Server is running on port ${PORT}`);
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
