const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/icons");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }

  res.send(categoryList);
});
router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(500).json({ success: false });
  }

  res.send(category);
});

router.post("/", upload.single("icon"), async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
  
    let iconPath = "";
  

    if (req.file) {
      const fileName = req.file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/icons/`;
      iconPath = `${basePath}${fileName}`;
    }
  
    let category = new Category({
      name,
      icon: iconPath, 

    })
  
    try {
      category = await category.save();
      res.status(200).send(category);
    } catch (err) {
      res.status(400).json({ message: "Category creation failed", error: err.message });
    }
  });
  

  router.put("/:id", upload.single("icon"), async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
  
    let iconPath = undefined;

    if (req.file) {
      const fileName = req.file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/icons/`;
      iconPath = `${basePath}${fileName}`;
    }
  
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: name, 
          icon: iconPath, 
        },
        { new: true }
      );
  
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      res.status(200).send(category);
    } catch (err) {
      res.status(400).json({ message: "Category update failed", error: err.message });
    }
  });
  

router.delete("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  if (category.icon) {
    const iconFileName = category.icon.split("/").pop();
    const iconFilePath = path.join(
      __dirname,
      "..",
      "public",
      "icons",
      iconFileName
    );

    fs.unlink(iconFilePath, (err) => {
      if (err) {
        console.error("Error deleting icon:", err);
      } else {
        console.log("Icon deleted successfully");
      }
    });
  }

  await category.remove();

  res.status(200).json({
    message: "Category and its icon deleted successfully",
  });
});

module.exports = router;
