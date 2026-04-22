const express = require('express');
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.get('/verif', (req, res) => res.send("Version du 22 Avril - 02h25"));
app.use(express.json());

let accounts = [];

// --- CONFIGURATION SWAGGER STATIQUE (SÛRE À 100%) ---
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Bank API - Ange',
        version: '1.0.0',
        description: 'Gestion de comptes et transferts',
    },
    servers: [
        { url: 'https://bank-management-api-bbdp.onrender.com', description: 'Serveur Render' },
        { url: 'http://localhost:3000', description: 'Local' }
    ],
    paths: {
        '/accounts': {
            post: {
                summary: 'Créer un compte',
                responses: { 201: { description: 'Compte créé' } }
            },
            get: {
                summary: 'Lister les comptes',
                responses: { 200: { description: 'Succès' } }
            }
        },
        '/transfer': {
            post: {
                summary: 'Effectuer un transfert',
                responses: { 200: { description: 'Transfert réussi' } }
            }
        }
    }
};

// On n'utilise plus swaggerJsDoc ici, on passe directement la définition
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @openapi
 * /accounts:
 * post:
 * summary: Créer un nouveau compte
 * responses:
 * 201:
 * description: Compte créé avec succès
 * get:
 * summary: Liste tous les comptes
 * responses:
 * 200:
 * description: Succès
 * * /transfer:
 * post:
 * summary: Effectuer un transfert
 * responses:
 * 200:
 * description: Transfert réussi
 */

app.post('/accounts', (req, res) => {
    const { owner, balance } = req.body;
    const newAccount = { id: uuidv4(), owner, balance: balance || 0 };
    accounts.push(newAccount);
    res.status(201).json(newAccount);
});

app.get('/accounts', (req, res) => res.json(accounts));

// LE PORT DYNAMIQUE (Très important pour Render !)
const PORT = process.env.PORT || 3000;
// Route pour transférer de l'argent
app.post('/transfer', (req, res) => {
    const { fromId, toId, amount } = req.body;
    
    const sender = accounts.find(a => a.id === fromId);
    const receiver = accounts.find(a => a.id === toId);

    if (!sender || !receiver) {
        return res.status(404).json({ error: "Compte non trouvé" });
    }

    if (sender.balance < amount) {
        return res.status(400).json({ error: "Solde insuffisant" });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    res.json({ message: "Transfert réussi !", sender, receiver });
});
app.get('/', (req, res) => {
  res.send("Bienvenue sur l'API Bank Management ! Allez sur /api-docs pour la doc.");
});
app.listen(PORT, () => {
    console.log(`✅ Serveur prêt sur le port ${PORT}`);
});