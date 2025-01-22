const express = require("express")
const router = express.Router()
const {Category} = require("../models/category")
const {Product} = require("../models/product")


// const featuredProducts = [
//     { id: 1, name: 'Product 1', description: 'Description for product 1', price: '$29.99', imageUrl: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
//     { id: 2, name: 'Product 2', description: 'Description for product 2', price: '$49.99', imageUrl: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
//     { id: 3, name: 'Product 3', description: 'Description for product 3', price: '$39.99', imageUrl: 'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
// ];

const otherProducts = [
    { id: 4, name: 'Product 4', description: 'Description for product 4', price: 19.99,originalPrice:534, imageUrl: "http://localhost:3000/uploads/purse-7042725_1280.jpg-1737575832972.jpeg" },
    { id: 5, name: 'Product 5', description: 'Description for product 5', price: 523, originalPrice:543, imageUrl: 'http://localhost:3000/uploads/t-shirt-2068353_1280.png-1737576010616.png' },
    { id: 6, name: 'Product 6', description: 'Description for product 6', price: 532 , originalPrice:5324, imageUrl: 'http://localhost:3000/uploads/chair-4281517_1280.png-1737575569845.png' },
    { id: 6, name: 'Product 6', description: 'Description for product 6', price: 23 , originalPrice:4234, imageUrl: 'http://localhost:3000/uploads/table-lamp-2320606_1280.png-1737575647890.png' }
];

// const categories = ['All Categories', 'Electronics', 'Clothing', 'Home Appliances', 'Toys'];

const cartItemCount = 5; 
const banner = "http://localhost:3000/uploads/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg" || ""



router.get("/" ,async (req , res) =>{
    const categories = await Category.find();
    const featuredProducts = await Product.find({isFeatured:true})

    res.render('home', {banner ,  featuredProducts, otherProducts, categories, cartItemCount });
})


router.get("/shop" , async(req , res) =>{
    const selectedCategoryId = req.query.category
    let filterdProducts;

    if (selectedCategoryId) {
        filterdProducts = await Product.find({category:selectedCategoryId})

    }else{
        filterdProducts = await Product.find();
    }

    let otherProducts;
    if (selectedCategoryId) {
        otherProducts = await Product.find({ category: {$ne:selectedCategoryId}}).limit(40)

    }
    else{
        otherProducts = await Product.find().limit(10)
    }

    const categories = await Category.find();

    res.render("category" , {
        filterdProducts , 
        otherProducts , 
        categories , 
        selectedCategoryId:selectedCategoryId,
        cartItemCount
    })
})

router.get('/product/:id', async (req, res) => {
    try {
      // Find the product by ID and populate the category
      const product = await Product.findById(req.params.id)
        .populate('category'); // Only populate the category, not the user model for reviews
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      // Dummy user object with name and email
      const dummyUser = {
        _id: 'dummyUserId',
        name: 'John Doe',
        email: 'johndoe@example.com'
      };
  
      // Simulate reviews with the dummy user for each review
      product.reviews = product.reviews.map(review => ({
        ...review._doc, // Spread the existing review data
        user: dummyUser, // Add the dummy user to the review
      }));
  
      // Fetch related products (same category, excluding the current product)
      const relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id }
      }).limit(4);  // Fetch up to 4 related products
  
      res.render('productDetail', { product, relatedProducts , cartItemCount });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });
  


module.exports = router;