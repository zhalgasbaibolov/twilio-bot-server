#!/usr/bin/env node
/* eslint-disable no-console */

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err, connection) => {
  connection.createChannel((error, channel) => {
    const queue = 'task_queue';

    channel.assertQueue(queue, {
      durable: true,
    });
    channel.prefetch(1);
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
    channel.consume(queue, (msg) => {
      const secs = msg.content.toString().split('.').length - 1;

      console.log(' [x] Received %s', msg.content.toString());
      setTimeout(() => {
        console.log(' [x] Done');
        channel.ack(msg);
      }, secs * 1000);
    }, {
      noAck: false,
    });
  });
});
