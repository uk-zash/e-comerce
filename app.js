const express = require("express")
const app = express();
require("dotenv/config")
const mongoose = require("mongoose")
const path = require("path")
const cors = require("cors")
const morgan = require("morgan")




app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.set("view engine" ,"ejs")
app.set("views" , path.join(__dirname , "views"))
app.use(express.static(path.join(__dirname , "public")))
app.use("/src", express.static(path.join(__dirname, "src")));



const mainRoute = require("./routes/main")
const categoryRoute = require("./routes/categories")
const productRoute = require("./routes/products")

app.use("/main" , mainRoute )
app.use("/category" , categoryRoute)
app.use("/products" , productRoute)





// Connecting with mongodb 

const db = process.env.MONGO_URI
mongoose.connect(db , {dbName:"newEcommerce"})
.then(()=>{
    console.log("connected to database")
}).catch(() =>{
    console.log("Error connecting to Mongodb" , error)
})





const PORT = process.env.PORT || 3000
app.listen(PORT , () =>{
    console.log(`Server is running on http://localhost:${PORT}`)
})