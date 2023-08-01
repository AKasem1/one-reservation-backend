const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const Schema = mongoose.Schema

const gradeSchema = new Schema({
    gradeName: { 
        type: String, 
        required: true 
    },
    modules: {
    type:[{ 
      moduleName: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      price:{
        type: Number,
        default: 0
        },
        stock:{
          type: Number,
          default: 0
        },
        reservationCount:{
          type: Number,
          default: 0 
        },
      reservedDocuments: {
        type: [{
          type: ObjectId,
          ref: 'Student'
        }],
        default: []
      },
    }],
    default: []
  },
  balance:{
    type: Number
  },
  reservationCount:{
    type: Number
  },
}, {timestamps: true})

module.exports = mongoose.model("Grade", gradeSchema)