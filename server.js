const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});


app.use(express.static('public')); // Serve static files from the public directory


app.use(bodyParser.json());

// Пример списка товаров
let products = [
  { id: 1, title: 'Товар 1', price: 100, description: 'Описание товара 1', categories: ['категория1'] },
  { id: 2, title: 'Товар 2', price: 200, description: 'Описание товара 2', categories: ['категория2'] },
  { id: 3, title: 'Товар 3', price: 300, description: 'Описание товара 3', categories: ['категория1', 'категория2'] },
  { id: 4, title: 'Товар 4', price: 400, description: 'Описание товара 4', categories: ['категория2'] },
  { id: 5, title: 'Товар 5', price: 500, description: 'Описание товара 5', categories: ['категория1'] }
];

// Получение всех товаров
app.get('/products', (req, res) => {
  res.json(products);
});

// Получение товара по ID
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Товар не найден');
  }
});

app.post('/products', (req, res) => {
  console.log('Received request to add product:', req.body); // Log the request body

  const newProduct = req.body;
  newProduct.id = products.length + 1;
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Обновление товара
app.put('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    Object.assign(product, req.body);
    res.json(product);
  } else {
    res.status(404).send('Товар не найден');
  }
});

// Удаление товара
app.delete('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    products.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Товар не найден');
  }
});

app.listen(port, () => {
  console.log(`Сервер административной панели запущен на http://localhost:${port}`);
});
