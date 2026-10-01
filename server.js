const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Stockage temporaire des codes de vérification
const verificationCodes = new Map();

// Page d'accueil
app.get("/", (req, res) => {
  res.send("Backend TECHBAT fonctionne !");
});

// Test du backend
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend TECHBAT fonctionne !",
  });
});

// ÉTAPE 1 : réception du formulaire + génération du code
app.post("/api/contact", (req, res) => {
  const {
    nom,
    prenom,
    email,
    telephone,
    projet,
    message,
  } = req.body;

  console.log("Données reçues :", req.body);

  // Vérifications simples
  if (!nom || !prenom || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Veuillez remplir tous les champs obligatoires.",
    });
  }

  // Génération d'un code à 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Date d'expiration : 10 minutes
  const expiresAt = Date.now() + 10 * 60 * 1000;

  // Stockage temporaire
  verificationCodes.set(email.toLowerCase(), {
    code,
    expiresAt,
    verified: false,
    data: {
      nom,
      prenom,
      email,
      telephone,
      projet,
      message,
    },
  });

  // Pour le moment, on affiche le code dans le terminal
  console.log("");
  console.log("====================================");
  console.log("CODE DE VÉRIFICATION");
  console.log("Email :", email);
  console.log("Code  :", code);
  console.log("Valable pendant : 10 minutes");
  console.log("====================================");
  console.log("");

  res.json({
    success: true,
    verificationRequired: true,
    message: "Un code de vérification a été généré.",
  });
});

// ÉTAPE 2 : vérification du code
app.post("/api/verify-email", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "E-mail et code obligatoires.",
    });
  }

  const emailKey = email.toLowerCase();

  const verification = verificationCodes.get(emailKey);

  // Aucun code trouvé
  if (!verification) {
    return res.status(400).json({
      success: false,
      message: "Aucun code de vérification trouvé.",
    });
  }

  // Vérification de l'expiration
  if (Date.now() > verification.expiresAt) {
    verificationCodes.delete(emailKey);

    return res.status(400).json({
      success: false,
      message: "Le code a expiré. Veuillez recommencer.",
    });
  }

  // Vérification du code
  if (code !== verification.code) {
    return res.status(400).json({
      success: false,
      message: "Code incorrect.",
    });
  }

  // Code correct
  verification.verified = true;

  console.log("");
  console.log("====================================");
  console.log("EMAIL VÉRIFIÉ ✅");
  console.log("Email :", email);
  console.log("====================================");
  console.log("");

  res.json({
    success: true,
    verified: true,
    message: "Adresse e-mail vérifiée avec succès.",
  });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend lancé sur le port ${PORT}`);
});


// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");

// dotenv.config();

// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//   })
// );

// app.use(express.json());

// app.get("/api/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "Backend TECHBAT fonctionne !",
//   });
// });

// app.post("/api/contact", (req, res) => {
//   console.log("Données reçues :", req.body);

//   res.json({
//     success: true,
//     message: "Formulaire reçu par le backend",
//   });
// });

// const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`Backend lancé sur http://localhost:${PORT}`);
// });