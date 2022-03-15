const jwt=require('jsonwebtoken')
const User=require('../models/user.js')

const authenticaion=async(req, res, next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ', '')
        const decodedToken=jwt.verify(token, JWT_SECRET)
        const user=await User.findOne({ _id:decodedToken._id, 'tokens.token':token })

        if(!user){
            throw new Error()
        }

        req.token=token
        req.user=user
        next()
    } catch(error){
        res.status(401).send('Invalid authentication!')
    }
}

module.exports=authenticaion