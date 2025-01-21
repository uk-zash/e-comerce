const express = require("express")
const router = express.Router()
const {Category} = require("../models/category")
const {Product} = require("../models/product")


const featuredProducts = [
    { id: 1, name: 'Product 1', description: 'Description for product 1', price: '$29.99', imageUrl: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 2, name: 'Product 2', description: 'Description for product 2', price: '$49.99', imageUrl: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 3, name: 'Product 3', description: 'Description for product 3', price: '$39.99', imageUrl: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
];

const otherProducts = [
    { id: 4, name: 'Product 4', description: 'Description for product 4', price: '$19.99', imageUrl: 'https://via.placeholder.com/300' },
    { id: 5, name: 'Product 5', description: 'Description for product 5', price: '$59.99', imageUrl: 'https://via.placeholder.com/300' },
    { id: 6, name: 'Product 6', description: 'Description for product 6', price: '$24.99', imageUrl: 'https://via.placeholder.com/300' }
];

// const categories = ['All Categories', 'Electronics', 'Clothing', 'Home Appliances', 'Toys'];

const cartItemCount = 5; 



router.get("/" ,async (req , res) =>{
    const categories = await Category.find();
    res.render('home', { featuredProducts, otherProducts, categories, cartItemCount });
})




module.exports = router;