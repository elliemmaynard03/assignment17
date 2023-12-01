const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });


mongoose
  .connect(
    "mongodb+srv://elliemmaynard:Butterfly2003@cluster0.d0a8bwu.mongodb.net/"
  )
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const countrySchema = new mongoose.Schema({
  name: String,
  population: String,
  language: String,
  origin: String,
  capitol: String,
  president: String,
  funfacts: [String],
  img: String,
});

const Country = mongoose.model("Country", countrySchema);

app.get("/api/countries", (req, res) => {
  getCountries(res);
});

const getCountries = async (res) => {
  const countries = await Country.find();
  res.send(countries);
};

app.post("/api/countries", upload.single("img"), (req, res) => {
  const result = validateCountry(req.body);

  if (result.error) {
    console.log("validation error" + result.error.details[0].message);
    res.status(400).send(result.error.details[0].message);
    return;
  }
  const country = new Country({
    name: req.body.name,
    population: req.body.population,
    language: req.body.language,
    origin: req.body.origin,
    capitol: req.body.capitol,
    president: req.body.president,
    funfacts: req.body.funfacts.split(","),
  });

  if (req.file) {
    country.img = "images/" + req.file.filename;
  }

  createCountry(country, res);
});

const createCountry = async (country, res) => {
  const result = await country.save();
  res.send(country);
};

app.put("/api/countries/:id", upload.single("img"), (req, res) => {
  const result = validateCountry(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  updateCountry(req, res);
});

const updateCountry = async (req, res) => {
  let fieldsToUpdate = {
    name: req.body.name,
    population: req.body.population,
    language: req.body.language,
    origin: req.body.origin,
    capitol: req.body.capitol,
    president: req.body.president,
    funfacts: req.body.funfacts.split(","),
  };

  if (req.file) {
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  const result = await Country.updateOne({ _id: req.params.id }, fieldsToUpdate);
  const country = await Country.findById(req.params.id);
  res.send(country);
};

app.delete("/api/countries/:id", upload.single("img"), (req, res) => {
  removeCountry(res, req.params.id);
});

const removeCountry = async (res, id) => {
  const country = await Country.findByIdAndDelete(id);
  res.send(country);
};

const validateCountry = (country) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    funfacts: Joi.allow(""),
    name: Joi.string().min(3).required(),
    population: Joi.string().min(3).required(),
    language: Joi.string().min(3).required(),
    origin: Joi.string().min(3).required(),
    capitol: Joi.string().min(3).required(),
    president: Joi.string().min(3).required(),
    img:Joi.allow("")
  });

  return schema.validate(country);
};

app.listen(3000, () => {
  console.log("I'm listening");
});