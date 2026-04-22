const express = require('express');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// Bases de données temporaires
let accounts = [];
let transactions = [];

// --- DÉFINITION STATIQUE POUR SWAGGER ---
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Système de Gestion Bancaire - Ange',
        version: '2.0.0',
        description: 'API complète : Comptes, Transferts et Historique'
    },
    servers: [{ url: 'https://bank-management-api-bbdp.onrender.com' }, { url: 'http://localhost:3000' }],
    paths: {
        '/accounts': {
            post: {
                summary: '1. Créer un compte',
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { owner: {type: 'string'}, balance: {type: 'number'} } } } } },
                responses: { 201: { description: 'Compte créé' } }
            },
            get: {
                summary: '2. Lister tous les comptes',
                responses: { 200: { description: 'Succès' } }
            }
        },
        '/accounts/{id}': {
            get: {
                summary: '3. Consulter un compte spécifique',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Détails du compte' }, 404: { description: 'Non trouvé' } }
            }
        },
        '/transfer': {
            post: {
                summary: '4. Effectuer un virement',
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { fromId: {type: 'string'}, toId: {type: 'string'}, amount: {type: 'number'} } } } } },
                responses: { 200: { description: 'Transfert réussi' }, 400: { description: 'Erreur' } }
            }
        },
        '/transactions': {
            get: {
                summary: '5. Historique des transactions',
                responses: { 200: { description: 'Liste des transferts' } }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

// --- LOGIQUE DES FONCTIONS ---

// 1 & 2. Comptes
app.post('/accounts', (req, res) => {
    const account = { id: uuidv4(), owner: req.body.owner, balance: req.body.balance || 0 };
    accounts.push(account);
    res.status(201).json(account);
});

app.get('/accounts', (req, res) => res.json(accounts));

// 3. Consulter un compte
app.get('/accounts/:id', (req, res) => {
    const account = accounts.find(a => a.id === req.params.id);
    account ? res.json(account) : res.status(404).json({error: "Introuvable"});
});

// 4. Transfert avec validation
app.post('/transfer', (req, res) => {
    const { fromId, toId, amount } = req.body;
    const from = accounts.find(a => a.id === fromId);
    const to = accounts.find(a => a.id === toId);

    if (!from || !to) return res.status(404).json({error: "Compte(s) introuvable(s)"});
    if (from.balance < amount) return res.status(400).json({error: "Solde insuffisant"});

    from.balance -= amount;
    to.balance += amount;
    
    const record = { id: uuidv4(), from: from.owner, to: to.owner, amount, date: new Date() };
    transactions.push(record);
    
    res.json({ message: "Virement réussi", transaction: record });
});

// 5. Historique
app.get('/transactions', (req, res) => res.json(transactions));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur sur port ${PORT}`));