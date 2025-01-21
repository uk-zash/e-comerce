const express = require("express")
const router = express.Router()
const {Category} = require("../models/category")
const multer = require("multer")
const path = require("path")

const storage  = multer.diskStorage({
    destination:(req , file , cb) => {
        cb(null , 'public/icons');
    },
    filename:(req , file , cb) =>{
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null , file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
    }

})


const upload = multer({storage:storage})


router.get("/" , async(req , res) => {
    const categoryList = await Category.find();

    if (!categoryList){
        res.status(500).json({success:false})

    }

    res.send(categoryList)
})
router.get("/:id" , async(req , res) => {
    const category = await Category.findById(req.params.id);

    if (!category){
        res.status(500).json({success:false})

    }

    res.send(category)
})


router.post("/" ,upload.single("icon") ,  async(req ,res) =>{
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/icons/`
    let category = new Category({
        name:req.body.name,
        icon: `${basePath}${fileName}`
    })

    category = await category.save();
    
    if (!category){
        res.status(400).json({success:false})
    }

    res.status(200).send(category)

})


router.put("/:id", upload.single("icon"), async (req, res) => {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/icons/`
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name || undefined,
            icon: req.file ? `${basePath}${fileName}` : undefined  // Handle if no icon is uploaded
        },
        { new: true }
    );

    if (!category) {
        return res.status(404).json({
            message: "Category not found"
        });
    }

    res.status(200).send(category);
});



router.delete("/:id" , async(req , res) =>{
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({
        message: "Category deleted successfully",
    });
    
})


module.exports = router
