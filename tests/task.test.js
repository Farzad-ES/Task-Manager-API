const request=require('supertest')
const app=require('../src/app.js')
const Task=require('../src/models/task.js')
const { 
    defaultUserId,
    defaultUser,
    secondUserId,
    secondUser,
    taskOne,
    taskTwo,
    taskThree,
    setupDB
}=require('./fixtures/db.js')

beforeEach(setupDB)

test('Testing task creation', async()=>{
    const response=await request(app).post('/tasks')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send({
            description:'This is a test'
        })
        .expect(201)
    const task=await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Testing getting tasks for a user', async()=>{
    const response=await request(app).get('/tasks')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Testing fetching user task by id', async()=>{
    await request(app).get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Testing not fetching user task if unauthenticated', async()=>{
    await request(app).get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Testing not fetching other user task', async()=>{
    await request(app).get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${secondUser.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Testing fetching only completed tasks', async()=>{
    const response=await request(app).get(`/tasks?completed=true}`)
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(1)
})

test('Testing fetching only completed tasks', async()=>{
    const response=await request(app).get(`/tasks?completed=false}`)
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(1)
})

test('Testing fetching tasks sorted by completed', async()=>{
    const response=await request(app).get(`/tasks?sortBy=completed_asc`)
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].completed).toEqual(false)
})

test('Testing delete task security', async()=>{
    const response=await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${secondUser.tokens[0].token}`)
        .send()
        .expect(404)
    const task=await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Testing deleting user task', async()=>{
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Testing not deleting user task if unauthenticated', async()=>{
    await request(app).delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Testing update task security', async()=>{
    await request(app).patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${secondUser.tokens[0].token}`)
        .send()
        .expect(404)
})