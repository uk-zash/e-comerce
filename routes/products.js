const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid Image Type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPE_MAP[file.mimetype];
    const fileName = file.originalname.split(" ").join("-");
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

router.get("/random", async (req, res) => {
  const isRandom = req.query.random === "true";

  let product;
  if (isRandom) {
    products = await Product.aggragate([{ $sample: { size: 5 } }]);
  } else {
    products = await Product.find();
  }

  res.json(products);
});

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});
router.get("/:id", async (req, res) => {
  const productList = await Product.findById(req.params.id).populate(
    "category"
  );

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.post("/", upload.single("image"), async (req, res) => {
  const CategoryName = req.body.category;
  const category = await Category.findOne({ name: CategoryName });
  if (!category) {
    return res.status(400).send("Invalid Category");
  }

  const file = req.file;
  if (!file) {
    return res.status(401).send("No image in the request");
  }

  let tags = [];
  if (req.body.tags) {
    tags = req.body.tags.split(",").map((tag) => tag.trim());
  }

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription || "",
    image: `${basePath}${fileName}`,
    brand: req.body.brand || "",
    price: req.body.price || 0,
    originalPrice: req.body.originalPrice || 0,
    category: category.id,
    countInStock: req.body.countInStock || 0,
    rating: req.body.rating || 0,
    isFeatured: req.body.isFeatured || false,
    dateCreated: new Date(),
    updatedAt: new Date(),
    tags: tags,
  });

  product = await product.save();
  if (!product) {
    return res.status(500).send("Product cannot be created");
  }

  res.send(product);
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (product) {
    // Handle deletion of main image
    const imagePath = product.image;
    if (imagePath) {
      const imageFilePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        imagePath.replace(/^.*[\\\/]/, "")
      );

      fs.unlink(imageFilePath, (err) => {
        if (err) {
          console.error("Error while deleting the main image", err);
        } else {
          console.log("Main image deleted successfully");
        }
      });
    }

    // Handle deletion of gallery images (if any)
    if (product.images && product.images.length > 0) {
      product.images.forEach((image) => {
        const imageFilePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          image.replace(/^.*[\\\/]/, "")
        );

        fs.unlink(imageFilePath, (err) => {
          if (err) {
            console.error("Error while deleting gallery image", err);
          } else {
            console.log("Gallery image deleted successfully");
          }
        });
      });
    }

    return res.status(200).send({
      success: true,
      message: "Deleted item and associated images successfully",
    });
  } else {
    return res.status(404).send({
      success: false,
      message: "Product not found",
    });
  }
});


router.put("/:id", upload.single("image"), async (req, res) => {
    const CategoryName = req.body.category;

    const category = await Category.findOne({ name: CategoryName });
    if (!category) {
      return res.status(400).send("Invalid Category");  // Ensure early return on error
    }

    let tags = [];
    if (req.body.tags) {
        tags = req.body.tags.split(",").map((tag) => tag.trim());
    }

    let imagePath = req.body.image;  

    if (req.file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get("host")}/uploads/`;
        imagePath = `${basePath}${fileName}`;
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription || "",
                image: imagePath,
                brand: req.body.brand || "",
                price: req.body.price || 0,
                originalPrice: req.body.originalPrice || 0,
                category: category.id,
                countInStock: req.body.countInStock || 0,
                rating: req.body.rating || 0,
                numReviews: req.body.numReviews || 0,
                reviews: req.body.reviews || [],
                isFeatured: req.body.isFeatured || false,
                updatedAt: new Date(),
                tags: tags,
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        }

        res.send(updatedProduct);  // Send the updated product as a response
    } catch (err) {
        console.error(err);
        res.status(500).send("Product update failed");
    }
});


router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: true });
  }
  res.send({ productCount });
});

router.get("/get/featured", async (req, res) => {
  const products = await Product.find({ isFeatured: true });
  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

router.put(
  "/gallery-images/:id",
  upload.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );

    if (!product) {
      res.status(401).send("cannot update product");
    }
    res.send(product);
  }
);

module.exports = router;
