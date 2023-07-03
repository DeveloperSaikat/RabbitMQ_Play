require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const amqplib = require('amqplib');
const { randomBytes } = require("crypto");

const app = express();
const Reviews = require('./models/reviews');

mongoose.connect(process.env.MongoDBUri, {
    useNewUrlParser: true, useUnifiedTopology: true
});

app.use(express.json());

let channel, connection;

async function connectToRabbitMQ() {
    connection = await amqplib.connect('amqp://0.0.0.0:5672');
    console.log('RabbitMQ connected');
    channel = await connection.createChannel();
    channel.assertQueue('review-creation-queue');
}

connectToRabbitMQ();

app.post('/course/:id/review', async (req, res) => {
    const reviewId = randomBytes(4).toString('hex');
    let { content } = req.body;

    let courseId = req.params.id;
    console.log(content, courseId);
    let reviewsAdded = new Reviews({
        reviewId,
        ...content,
        courseId
    });

    await reviewsAdded.save();
    channel.sendToQueue('review-creation-queue', Buffer.from(
        JSON.stringify({ newreview: { id: reviewId, content, courseId } }),
    ));

    res.json({msg: 'Review added successfully'});
});

app.listen(5001, () => {
    console.log('Connected to reviews');
})