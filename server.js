const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for '${req.url}'`);
    next();
});

// Endpoint to add a product
app.post('/add-product', (req, res) => {
    const newProduct = req.body;

    // Read existing products
    fs.readFile('products.json', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading products file');
        }

        const products = JSON.parse(data);
        products.push(newProduct);

        // Write updated products back to the file
        fs.writeFile('products.json', JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving product');
            }
            res.status(201).send('Product added successfully');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер административной панели запущен на http://localhost:${PORT}`);
});
