const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const Schema = mongoose.Schema

const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
})
adminSchema.statics.login = async (username, password) => {
    console.log("Testing..")
  if(!username || !password){
    throw Error('All fields are required.')
  }
  const admin = await this.findOne({username})
  if(!admin){
    throw Error('Invalid Admin credentials')
  }
  const match = await bcrypt.compare(password, admin.password)
  if(!match){
    throw Error('Invalid Admin credentials')
  }
  return admin
}
module.exports = mongoose.model('Admin', adminSchema)