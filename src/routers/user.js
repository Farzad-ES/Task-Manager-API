const express=require('express')
const multer=require('multer')
const sharp=require('sharp')
const User=require('../models/user.js')
const mails=require('../emails/account.js')
const auth=require('../middleware/authentication.js')


const router=new express.Router()

//Creating users
router.post('/users',async (req,res)=>{
    const user=new User(req.body)
    
    try{
        const token=await user.generateAuthenticationToken()
        await user.save()
        mails.sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
    } catch(error){
        res.status(400).send(error)
    }
})

//Reading my profile
router.get('/users/me', auth, async (req,res)=>{
    try{
        res.send(req.user)
    } catch(error){
        res.status(500).send()
    }
})

//Updating my profile
router.patch('/users/me', auth, async (req,res)=>{
    const allowedUpdates=['name','email','age','password']
    const updates=Object.keys(req.body)
    const isYourUpdateValid=updates.every((update)=>allowedUpdates.includes(update))
    
    if(!isYourUpdateValid){
        return res.status(400).send({error:'Invalid update'})
    }
    
    try{
        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save()
    
        res.status(200).send(req.user)
    } catch(error){
        res.status(400).send(error)
    }
})

//Deleting my profile
router.delete('/users/me', auth, async(req,res)=>{
    try{
        await req.user.remove()
        mails.sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch(error){
        res.status(400).send()
    }
})

//Uploading user profile picture
const uploadProfilePic=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a jpg or jpeg or png file'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, uploadProfilePic.single('avatar'), async(req, res)=>{
    const buffer=await sharp(req.file.buffer).resize({ width:300, height:300 }).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()

    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({Error:error.message})
})

//Deleting user profile picture
router.delete('/users/me/avatar', auth, async(req, res)=>{
    try{
        req.user.avatar=undefined
        await req.user.save()
        
        res.status(200).send()
    } catch(error){
        res.status(500).send()
    }
})

//Getting user profile pic from server
router.get('/users/:id/avatar', async(req, res)=>{
    try{
        const user=await User.findById(req.params.id)

        if((!user) || (!user.avatar)){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(error){
        res.status(404).send()
    }
})

//Login as a user
router.post('/users/login', async(req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email, req.body.password)

        const token=await user.generateAuthenticationToken()
        res.send({user, token})
    } catch(error){
        res.status(400).send(error)
    }
})

//Logout handler
router.post('/users/logout', auth, async(req, res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return req.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch(error){
        res.status(500).send(error)
    }
})

//Logout from all sessions
router.post('/users/logoutall', auth, async(req, res)=>{
    try{
        req.user.tokens.splice(0, req.user.tokens.length)
        
        await req.user.save()
        res.send()
    } catch(error){
        res.status(500).send()
    }
})

module.exports=router