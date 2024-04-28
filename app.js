const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

//set ejs as view engine
app.set("view engine", "ejs");

//serving static files from public directory
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

//default route to home page
app.get("/", (req, res) => {
  res.render("index");
});

//route to about page
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

//route to carbon footprint page
app.get("/carbon-footprint", (req, res) => {
  //render carbon footprint page and pass users data
  User.find()
    .then((result) => {
      res.render("carbon-footprint", { users: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

// method to add new user
app.post("/addUser", (req, res) => {
  const name = req.body.name;
  const footprint = req.body.footprint;

  // Find a user with the same name(case insensitive) and update their footprint
  // If no user with the same name exists, create a new user
  User.findOneAndUpdate(
    { name: name },
    { footprint: footprint },
    { new: true, upsert: true },
  )
    .then(() => {
      res.redirect("/carbon-footprint");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

//start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
