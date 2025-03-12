const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { GraphQLString, GraphQLFloat } = require('graphql');

const WebSocket = require('ws');

const app = express();
app.use(express.static('public')); // Serve static files from the public directory

const PORT = 3004;




const productsFilePath = __dirname + '/products.json'; // Ensure this path is correct

app.use(bodyParser.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for '${req.url}'`);
    next();
});

// GraphQL schema
const schema = buildSchema(`
    type Product {
        id: ID
        name: String
        description: String
        price: Float
    }

    type Query {
        products(name: String, price: Float): [Product]
    }
`);

// Root resolver
const root = {
    products: (args) => {
        const data = fs.readFileSync(productsFilePath);
        const products = JSON.parse(data);
        if (args.name) {
            return products.filter(product => product.name.includes(args.name));
        }
        if (args.price) {
            return products.filter(product => product.price === args.price);
        }
        return products;
    }
};

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast incoming message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

// Upgrade HTTP server to handle WebSocket connections
const server = app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Other existing endpoints...

// Endpoint to add a product
app.post('/add-product', (req, res) => {
    const newProduct = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };

    // Read existing products
    fs.readFile(productsFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading products file');
        }

        const products = JSON.parse(data);
        products.push(newProduct);

        // Write updated products back to the file
        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving product');
            }
            res.status(201).send('Product added successfully');
        });
    });
});

app.get('/products', (req, res) => {
    fs.readFile(productsFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading products file');
        }
        res.json(JSON.parse(data));
    });
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.redirect('/admin');
});

app.get('/customer', (req, res) => {
    res.sendFile(__dirname + '/public/customer.html');
});

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Endpoint to edit a product by ID
app.put('/update-product/:id', (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;

    fs.readFile(productsFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading products file');
        }

        let products = JSON.parse(data);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).send('Product not found');
        }

        products[productIndex] = { ...products[productIndex], ...updatedProduct };

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving product');
            }
            res.send('Product updated successfully');
        });
    });
});

// Endpoint to delete a product by ID
app.delete('/remove-product/:id', (req, res) => {
    const productId = req.params.id;

    fs.readFile(productsFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading products file');
        }

        let products = JSON.parse(data);
        products = products.filter(p => p.id !== productId);

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving product');
            }
            res.send('Product removed successfully');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
