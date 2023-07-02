require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const amqplib = require('amqplib');
const { randomBytes } = require("crypto");
const cors = require('cors');

mongoose.connect(process.env.MongoDBUri, {
    useNewUrlParser: true, useUnifiedTopology: true
});

const app = express();
const Courses = require('./models/courses');

app.use(cors());
app.use(express.json());


let channel, connection;

async function connectToRabbitMQ() {
    connection = await amqplib.connect('amqp://0.0.0.0:5672'); // Extablishing a connection with RabbitMQ
    console.log('Rabbit MQ connected');
    channel = await connection.createChannel(); // All queues are created over a channel
    channel.assertQueue('course-creation-queue'); // This checks if we have a queue by this name or not, if no then it creates one 
}

connectToRabbitMQ();

app.post('/newcourse', async (req, res) => {
    const courseId = randomBytes(4).toString('hex');
    let { newCourse } = req.body;
    let newCourseAdded = new Courses({
        id: courseId,
        ...newCourse
    });

    await newCourseAdded.save();

    channel.sendToQueue('course-creation-queue', Buffer.from(JSON.stringify({ newcourse: newCourseAdded})));

    res.json({ msg: 'Course added successfully'});
});

app.listen(5000, () => {
    console.log('Connected to courses');
})
