const Admin = require('../models/AdminModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const createToken = (_id) => {
    return jwt.sign({_id: _id}, process.env.SECRET, {expiresIn: '3d'})
  }

const loginAdmin = async (req, res) => {
    const {username, password} = req.body
    console.log({username, password})
    try{
      if(!username || !password){
        throw Error('All fields are required.')
      }
      const admin = await Admin.findOne({username})
      if(!admin){
        throw Error('Wrong Username')
      }

      if(!(admin.password == password)){
        throw Error('Wrong Password')
      }
      const token = createToken(admin._id)
      console.log("Logged In Successfully..")
      res.status(200).json({username, token})
    }
    catch(error){
      res.status(400).json({error: error.message})
    }
  }
const alladmins = async (req, res) => {
    try{
      const admins = await Admin.find({});
      res.status(200).json(admins);
  
    } catch(error){
      console.log("Can not retrieve admins");
      res.status(400).json({ error: error.message });
    }
  }

module.exports = { loginAdmin, alladmins }