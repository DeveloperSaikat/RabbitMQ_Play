require('dotenv').config();
const express = require('express');
const cors = require('cors');
const amqplib = require("amqplib");
const mongoose = require('mongoose');

mongoose.connect(process.env.MongoDBUri, {
    useNewUrlParser: true, useUnifiedTopology: true
});

const app = express();
const queryCourses = require('./models/querycourses');

app.use(cors());
app.use(express.json());

let channel, connection;

async function connectToRabbitMQ() {
    connection = await amqplib.connect('amqp://0.0.0.0:5672'); // Extablishing a connection with RabbitMQ
    console.log('Rabbit MQ connected');
    channel = await connection.createChannel(); // All queues are created over a channel
    channel.assertQueue('course-creation-queue'); // This checks if we have a queue by this name or not, if no then it creates one 
}

connectToRabbitMQ().then(() => {
    channel.consume('course-creation-queue', async (data) => {
        let { newcourse } = JSON.parse(data.content);
        console.log('Received', newcourse);
        let coursesToBeAdded = new queryCourses({
            ...newcourse,
            reviews: []
        });

        await coursesToBeAdded.save();

        channel.ack(data);
    });
});

app.listen(8080, () => {
    console.log('Connected to query');
});