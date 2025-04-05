import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, SendMessageRequest } from '@aws-sdk/client-sqs';

interface ChallengeProps {
    sqsClient: SQSClient;
    queueUrl: string;
}

export class Challenge {
    private sqsClient: SQSClient;
    private queueUrl: string | undefined;

    constructor({sqsClient, queueUrl}: ChallengeProps) {
        this.sqsClient = sqsClient;
        this.queueUrl = queueUrl;
    }

    /**
     * Sends a message to the SQS queue
     * @param message - The message to send
     * @param queueUrl - The URL of the SQS queue
     * @returns The message ID
     */
    async sendMessage(message: string): Promise<string> {
        if (message.length < 1) {
            throw new Error('Cannot process empty message');
        }
        try {
            const sendMessageInput: SendMessageRequest = {
                QueueUrl: this.queueUrl,
                MessageBody: message,
            }
            const result = await this.sqsClient.send(new SendMessageCommand(sendMessageInput));
            console.log(`Message sent: ${result.MessageId}`);
            if (!result.MessageId) {
                throw new Error('Failed to send message, no message ID returned');
            }
            return result.MessageId;
        } catch (err) {
            console.error(`Error sending SQS message: ${err.message}`)
            throw err;
        }
    }

    /**
     * Processes a message from the SQS queue
     * @param queueUrl - The URL of the SQS queue
     * @returns processed message IDs
     */
    async processMessages(): Promise<string[]> {
        // TODO: Implement message processing
        // - Receive message from queue
        // - Process the message (log it)
        // - Delete the message after processing
        // - Handle visibility timeouts
        // - Handle errors appropriately
        try {
            const messages = await this.sqsClient.send(new ReceiveMessageCommand({
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 1,
            }));
            if (!messages.Messages) {
                console.log('No messages to process');
                return [];
            }
            for (const message of messages.Messages) {
                console.log(`Processing message: ${message.Body}`);
                // Simulate message processing
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Delete the message after processing
                await this.sqsClient.send(new DeleteMessageCommand({
                    QueueUrl: this.queueUrl,
                    ReceiptHandle: message.ReceiptHandle,
                }));
                console.log(`Message deleted: ${message.MessageId}`);
            }
            return messages.Messages.map(message => message.MessageId!);
        } catch (error) {
            const errorMessage = `Error processing SQS messages: ${error.message}`
            throw new Error(errorMessage); 
        }
    }

    /**
     * Main function that orchestrates the message sending and processing
     * @returns Array of message IDs
     */
    async main(): Promise<string[]> {
        if (!this.queueUrl) {
            throw new Error('Queue URL is not configured');
        }

        const messageIds: string[] = [];
        const messages = ['Hello, SQS!', 'This is a test message.', 'SQS is awesome!'];
        
        for (const message of messages) {
            try {
                const messageId = await this.sendMessage(message);
                messageIds.push(messageId);
            } catch (err) {
                console.error(`Error sending message: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
        const processingResults = await this.processMessages();
        console.log(`Processed message IDs: ${processingResults}`);
        return messageIds;
    }
}