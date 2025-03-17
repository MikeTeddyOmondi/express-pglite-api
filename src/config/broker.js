// @ts-ignore
import amqp from "amqplib";

import { RABBITMQ_URL } from "./env.js"

/**
 * MessageBroker Class for interacting with RabbitMQ
 * @param {string} brokerUrl 
 * @returns {MessageBroker} MessageBroker
 */
export class MessageBroker {
  /**
   * @param {string} brokerUrl
   */
  constructor(brokerUrl) {
    this.brokerUrl = brokerUrl;
    this.connection = null;
    this.channel = null;
  }

  async init() {
    this.connection = await amqp.connect(this.brokerUrl);
    this.channel = await this.connection.createChannel();
  }

  /**
   * @param {string} exchangeName
   * @param {string} type
   * @returns {Promise<void>} void
   */
  async createExchange(exchangeName, type) {
    await this.channel.assertExchange(exchangeName, type, { durable: true });
  }

  /**
   * @param {string} exchange
   * @param {string} routingKey
   * @param {string | object} message
   * @returns {Promise<void>} void
   */
  async publish(exchange, routingKey, message) {
    await this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  /**
   * @param {string} exchange
   * @param {string} queue
   * @param {string} routingKey
   * @param {function} callback
   * @returns {Promise<void>} void
   */
  async subscribe(exchange, queue, routingKey, callback) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.bindQueue(queue, exchange, routingKey);
    // @ts-ignore
    this.channel.consume(queue, (msg) => {
      if (msg) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

/**
 * Create MessageBroker factory function
 * @param {string} brokerUrl 
 * @returns {MessageBroker} MessageBroker
 */
export function createBroker(brokerUrl) {
    return new MessageBroker(brokerUrl);
}

const brokerUrl = RABBITMQ_URL;

export const messageBroker = createBroker(brokerUrl);