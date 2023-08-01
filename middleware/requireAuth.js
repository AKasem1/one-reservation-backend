const jwt = require('jsonwebtoken')
const Admin = require('../models/AdminModel')

const requireAuth = async (req,res,next) =>{
    //verify authentication
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({error: "Authorization token is required"})
    }
    const token = authorization.split(' ')[1]
    try{
        const {_id} = jwt.verify(token, process.env.SECRET)
        req.user = await Admin.findOne({_id}).select('_id')
        next()
    }
    catch{
        res.status(401).json({error: 'Request is not authorized'})
    }
}
module.exports = requireAuth