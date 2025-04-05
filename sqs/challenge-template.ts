import { SQSClient } from '@aws-sdk/client-sqs';

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
        // TODO: Implement message sending
        throw new Error('Not implemented');
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
        throw new Error('Not implemented');
    }

    /**
     * Main function that orchestrates the message sending and processing
     * @returns Array of message IDs
     */
    async main(): Promise<string[]> {
        // TODO: Implement main orchestration
        throw new Error('Not implemented');
    }
} 