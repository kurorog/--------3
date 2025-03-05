const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

const productsFilePath = __dirname + '/products.json'; // Ensure this path is correct

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

// Serve the index.html file
app.get('/', (req, res) => {
    res.redirect('/admin');
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
