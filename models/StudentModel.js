const mongoose = require('mongoose')
const Schema = mongoose.Schema
const studentSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true,
    },
    anotherphone:{
        type: String,
    },
    reservations:{
        type:[{
            code:{
                type: String,
                required: true
            },
            grade:{
                type: String,
                required: true
            },
            modules:{
                type: [String],
                required: true
            },
            copiesNumber:[{
                type: Number,
                required: true
            }],
            status:{
                type: String,
                enum: ["استلم", "لم يستلم"],
                default: "لم يستلم"
            },
            createdAt:{
                type: Date,
                default: Date.now
            }
        }],
        default: []
    }
}, {timestamps: true})

module.exports = mongoose.model("Student", studentSchema)
