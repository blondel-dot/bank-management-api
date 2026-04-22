const express = require('express');
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

let accounts = [];

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: { title: 'Bank API', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3000' }]
    },
    apis: ['./index.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
/**
 * @swagger
 * /accounts:
 * get:
 * summary: Liste tous les comptes
 * responses:
 * 200:
 * description: Succès
 * post:
 * summary: Créer un nouveau compte
 * responses:
 * 201:
 * description: Compte créé
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