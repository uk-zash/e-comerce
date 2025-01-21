const mongoose = require("mongoose")


const productSchema = new mongoose.Schema({
    name:{
        type:String, 
        required:true

    },
    description:{
        type:String,
        required:true
    },
    richDescription:{
        type:String,
        default:""
    },
    image:{
        type:String,
        default:""
    },
    images:[{
        type:String,
        default:""
    }],
    brand:{
        type:String,
        default:""
    },
    price:{
        type:Number,
        default:0
    },
    originalPrice:{
        type:Number,
        default:0

    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        require:true
    },
    countInStock:{
        type:Number,
        required:true,
        default:0
    },
    rating:{
        type:Number,
        default:0
    },
    numReveiws:{
        type:Number,
        default:0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        },
        comment: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    isFeatured:{
        type:Boolean,
        default:false
    },
    dateCrearted:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date , 
        default:Date.now
    },
    tage:[{
        type:String
    }]

})


productSchema.pre("save" , function(next) {
    this.updatedAt = Date.now();
    next();
})


productSchema.virtual("id").get(function(){
    return this._id.toHexString()
})


productSchema.set("toJSON" , {
    virtuals:true
})


productSchema.index({category:1})
productSchema.index({isFeatured : 1})
productSchema.index({price:1})
productSchema.index({brand:1})
productSchema.index({tags:1})


exports.Product = mongoose.model("Product" , productSchema)