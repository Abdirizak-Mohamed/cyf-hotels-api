const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});



const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/hotels", (req, res) => {
    console.log(process.env.DATABASE_URL)
    pool.query('SELECT * FROM hotels')
        .then(result => res.json(result.rows))
        .catch(error => {
            console.error(error);
            res.status(500).json(error)
        })
})
app.get("/suppliers", (req, res) => {
    pool
        .query('SELECT * FROM suppliers')
        .then((result) => res.json(result.rows))
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        });
});
const productsQuery =
    'SELECT products.product_name as "productName", unit_price as price, suppliers.supplier_name as "supplier" FROM product_availability INNER JOIN products ON products.id = product_availability.prod_id INNER JOIN suppliers ON suppliers.id = product_availability.supp_id;';
app.get("/products", (req, res) => {
    pool
        .query(productsQuery)
        .then((result) => res.json(result.rows))
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        });
});

app.post("/products", (req, res) => {
    const newProductName = req.body.product_name;
    const newUnitPrice = req.body.unit_price;
    const newSupplierRooms = req.body.supplier_name;
    const query = "INSERT INTO products (product_name) VALUES ($1) INSERT INTO suppliers(supplier_name) VALUES ($2) INSERT INTO product_availability VALUES ($3)";

    if (!Number.isInteger(newUnitPrice) || newUnitPrice <= 0) {
        return res.status(400).send("The product price should be a positive integer.");
    }

    pool
        .query(query, [newProductName, newUnitPrice, newSupplierRooms])
        .then(() => res.send("Product created!"))
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        });
});