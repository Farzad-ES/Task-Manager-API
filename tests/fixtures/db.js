const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const Task=require('../../src/models/task.js')
const User=require('../../src/models/user.js')

const defaultUserId=new mongoose.Types.ObjectId()

const defaultUser={
    _id:defaultUserId,
    email:'farzad@example.com',
    name:'David',
    password:'123WhatisThis!',
    tokens:[{
        token:jwt.sign({ _id:defaultUserId }, process.env.JWT_SECRET)
    }]
}

const secondUserId=new mongoose.Types.ObjectId()

const secondUser={
    _id:secondUserId,
    email:'Dan@example.com',
    name:'Dan',
    password:'1234WhatisThis!?',
    tokens:[{
        token:jwt.sign({ _id:secondUserId }, process.env.JWT_SECRET)
    }]
}

const taskOne={
    _id:new mongoose.Types.ObjectId(),
    description:'First task',
    completed:false,
    author:defaultUser._id
}

const taskTwo={
    _id:new mongoose.Types.ObjectId(),
    description:'Second task',
    completed:true,
    author:defaultUser._id
}

const taskThree={
    _id:new mongoose.Types.ObjectId(),
    description:'Third task',
    completed:false,
    author:secondUser._id
}

const setupDB=async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(defaultUser).save()
    await new User(secondUser).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports={
    defaultUserId,
    defaultUser,
    secondUserId,
    secondUser,
    taskOne,
    taskTwo,
    taskThree,
    setupDB
}