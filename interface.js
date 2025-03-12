const express = require('express');
const express = require('express');
const app = express();
const WebSocket = require('ws');

const port = 8080;

const socket = new WebSocket('ws://localhost:3000');

// Отдача статических файлов из папки public
app.use(express.static('public'));

// WebSocket connection for chat
socket.onmessage = function(event) {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.textContent = event.data;
    chatBox.appendChild(message);
};

document.getElementById('send-button').onclick = function() {
    const chatInput = document.getElementById('chat-input');
    socket.send(chatInput.value);
    chatInput.value = '';
};

// GraphQL query to fetch products
const query = `
    {
        products {
            id
            name
            price
        }
    }
`;

// Fetch products from GraphQL endpoint
fetch('/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
})
.then(response => response.json())
.then(data => {
    const productList = document.getElementById('product-list');
    data.data.products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.textContent = `${product.name} - $${product.price}`;
        productList.appendChild(productItem);
    });
});




app.listen(port, () => {
  console.log(`Сервер интерфейса пользователя запущен на http://localhost:${port}`);
});
