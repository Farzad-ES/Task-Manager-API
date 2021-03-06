const express=require('express')
const Task=require('../models/task.js')
const auth=require('../middleware/authentication.js')

const router=new express.Router()

//Creating a task
router.post('/tasks', auth,async (req,res)=>{
    const task=new Task({
        ...req.body,
        author:req.user._id
    })
    
    try{
        await task.save()
        res.status(201).send(task)
    } catch(error){
        res.status(400).send(error)
    }
})

//Reading task
router.get('/tasks', auth, async (req,res)=>{
    const match={}
    const sort={}

    if(req.query.sortBy){
        const parts=req.query.sortBy.split('_')
        sort[parts[0]]=parts[1]==='asc'?1:-1
    }

    if(req.query.completed){
        match.completed=(req.query.completed==='true')
    }

    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        })

        res.send(req.user.tasks)
    } catch(error){
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth,async (req,res)=>{
    const _id=req.params.id
    
    try{
        const task=await Task.findOne({_id, author:req.user._id})

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch(error){
        res.status(500).send()
    }
})

//Updating a task
router.patch('/tasks/:id', auth,async (req,res)=>{
    const allowedUpdates=['description','completed']
    const updates=Object.keys(req.body)
    const isYourUpdateValid=updates.every((update)=>allowedUpdates.includes(update))
    
    if(!isYourUpdateValid){
        return res.status(400).send({error:'Invalid update'})
    }
    
    try{
        const task=await Task.findOne({ _id:req.params.id, author:req.user._id })
        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update)=>task[update]=req.body[update])
        await task.save()
        res.status(200).send(task)
    } catch(error){
        res.status(400).send()
    }
})

//Deleting a task
router.delete('/tasks/:id', auth,async(req,res)=>{
    try{
        const task=await Task.findOneAndDelete({ _id:req.params.id, author:req.user._id })
        if(!task){
            res.status(404).send()
        }

        res.send(task)
    } catch(error){
        res.status(400).send()
    }
})

module.exports=router