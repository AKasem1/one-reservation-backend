require("dotenv").config()
const cors = require("cors")
const adminRoute = require('./routes/admin')
const reservationRoute = require('./routes/reservation')
const gradeRoute = require('./routes/grade')
const express = require('express')
const { default: mongoose } = require("mongoose");

//
mongoose.set('strictQuery', false);

const app = express();

//middlewares
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000/", "https://one-reservation-system.onrender.com/", "https://one-reservation-frontend.vercel.app/"]
}))

app.use('/admin', adminRoute)
app.use('/reservation', reservationRoute)
app.use('/grade', gradeRoute)

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    //listen for requests
    app.listen(process.env.PORT, () => {
        console.log("connected to db & listening on port:", process.env.PORT)
    });
})
.catch((err)=>{console.log(err)})