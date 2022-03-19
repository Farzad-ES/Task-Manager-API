const nodemailer=require('nodemailer')

const sendWelcomeEmail=async(email, name)=>{
    let welcomeAccountForTest=await nodemailer.createTestAccount()

    let transporter=nodemailer.createTransport({
        host:'smtp.ethereal.email',
        port:587,
        secure:false,
        auth:{
            user:welcomeAccountForTest.user,
            pass:welcomeAccountForTest.pass
        }
    })

    let info=await transporter.sendMail({
        from:'farzad78es@gmail.com',
        to:email,
        subject:'Thanks for joining in',
        text:`Welcome to task manager app, ${name}. Let me know how it's going with the app`
    })
}

const sendCancelationEmail=async(email, name)=>{
    let cancelationAccountForTest=await nodemailer.createTestAccount()

    let transporter=nodemailer.createTransport({
        host:'smtp.ethereal.email',
        port:587,
        secure:false,
        auth:{
            user:cancelationAccountForTest.user,
            pass:cancelationAccountForTest.pass,
        }
    })

    let info=await transporter.sendMail({
        from:'farzad78es@gmail.com',
        to:email,
        subject:'Sorry to see you go!',
        text:`Thanks for using our app, ${name}. Please let us know your feedback to make our app better`
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancelationEmail
}