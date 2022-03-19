const request=require('supertest')
const jwt=require('jsonwebtoken')
const mongoose=require('mongoose')
const app=require('../src/app.js')
const User = require('../src/models/user.js')
const {
    defaultUserId,
    defaultUser,
    secondUserId,
    secondUser,
    setupDB
}=require('./fixtures/db.js')

beforeEach(setupDB)

test('Testing user signup', async()=>{
    const response=await request(app).post('/users').send({
        email:'farzad78es@gmail.com',
        name:'Farzad',
        password:'ItisAtest23416@'        
    }).expect(201)

    const user=await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user:{
            name:'Farzad',
            email:'farzad78es@gmail.com'
        },
        token:user.tokens[0].token
    })
})

test('Testing signing in to an existing user', async()=>{
    const response=await request(app).post('/users/login').send({
        email:defaultUser.email,
        password:defaultUser.password
    }).expect(200)

    const user=await User.findById(defaultUser._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async()=>{
    await request(app).post('/users/login').send({
        email:'adsds@example.com',
        password:'asdsa'
    }).expect(400)
})

test('Testing uploading user avatar', async()=>{
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user=await User.findById(defaultUser._id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Testing getting user profile', async()=>{
    await request(app).get('/users/me')
    .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Testing not getting user profile with invalid authentication', async()=>{
    await request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Testing deleting user profile', async()=>{
    await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
    .send()
    .expect(200)

    const user=await User.findById(defaultUser._id)
    expect(user).toBeNull()


})

test('Testing not deleting user profile with invalid authentication', async()=>{
    await request(app).delete('/users/me')
    .send()
    .expect(401)
})

test('Should update valid user fields', async()=>{
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send({
            name:'Mikey'
        })
        .expect(200)
    const user=await User.findById(defaultUser._id)
    expect(user.name).toBe('Mikey')
})

test('Should not update invalid user fields', async()=>{
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send({
            location:'US'
        })
        .expect(400)
})

test('Testing not updating user with invalid authentication', async()=>{
    await request(app).patch('/users/me')
        .send({
            name:'Rob'
        })
        .expect(401)
})