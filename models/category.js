const mongoose = require("mongoose")


const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true

    },
    icon:{
        type:String,
    }
})


categorySchema.virtual("id").get(function (){
    return this._id.toHexString()
})


categorySchema.set("toJSON" , {
    virtuals:true
})

categorySchema.index({name:1})

exports.Category = mongoose.model("Category" , categorySchema)