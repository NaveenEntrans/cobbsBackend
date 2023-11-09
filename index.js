const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = 4000;

// Connect to MongoDB (replace with your MongoDB connection URL)
const password = encodeURIComponent("Bad@1234");
const connectionString = `mongodb+srv://book_A_Doc:${password}@cluster0.so4dr.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a Patient model

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: false,
  },
  caseNumber: {
    type: String,
    required: false,
    unique: true,
  },
  angleMeasurements: [
    {
      angle: {
        type: Number,
        required: false,
      },
      Date: {
        type: String,
        required: false,
      },
    },
  ],
});

const Patient = mongoose.model("Patient", patientSchema);

app.use(bodyParser.json());
app.use(express.json());

// Create a new patient record
app.post("/api/patients", (req, res) => {
  const { name, age, angleMeasurements, caseNumber } = req.body;

  const patient = new Patient({ name, age, angleMeasurements, caseNumber });

  patient
    .save()
    .then((savedPatient) => {
      res.status(201).json(savedPatient);
    })
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
});

app.get("/api/patientsList", (req, res) => {
  Patient.find()
    .then((patients) => {
      res.status(200).json(patients);
    })
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
});

app.get("/patients/:caseNumber", async (req, res) => {
  const caseNumber = req.params.caseNumber;
  console.log("caseNumber", caseNumber);
  try {
    const patientDetails = await Patient.find();
    console.log("patientDetails", patientDetails);
    const patient = await Patient.findOne({ caseNumber: caseNumber });

    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error finding patient" });
  }
});

app.put("/patients/angleMeasurements", async (req, res) => {
  const caseNumber = req.body.body.caseNumber;
  const updatedAngleMeasurements = req.body.body.angleMeasurements; // Updated angle measurements
  console.log("req.body", req.body);

  try {
    const patient = await Patient.findOne({ caseNumber: caseNumber });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update the angleMeasurements array with the new data
    patient.angleMeasurements = updatedAngleMeasurements;

    // Save the updated patient
    console.log("patient", patient);
    await patient.save();

    res.json({
      message: "Angle measurements updated successfully",
      updatedPatient: patient,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error updating angle measurements" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
