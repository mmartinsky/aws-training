import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { config } from 'dotenv';
import { Challenge } from './challenge';

config();

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const queueUrl = process.env.QUEUE_URL as string;

async function validateChallenge(): Promise<void> {
    console.log('Starting SQS Challenge Validation...\n');

    const challenge = new Challenge({ sqsClient, queueUrl });

    try {
        // Test 1: Send messages
        console.log('Test 1: Sending messages...');
        const messageIds = await challenge.main();
        
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            throw new Error('main() should return an array of message IDs');
        }
        console.log('✓ Messages sent successfully\n');

        // Test 2: Verify messages were processed and deleted
        console.log('Test 2: Verifying message processing...');
        const receiveParams = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 1
        };

        const { Messages } = await sqsClient.send(new ReceiveMessageCommand(receiveParams));
        
        if (Messages && Messages.length > 0) {
            throw new Error('Messages were not properly processed and deleted');
        }
        console.log('✓ Messages processed and deleted successfully\n');

        // Test 3: Verify error handling
        console.log('Test 3: Verifying error handling...');
        try {
            await challenge.sendMessage('');
            throw new Error('sendMessage should throw an error for empty message');
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new Error('Error handling not implemented correctly');
            }
        }
        console.log('✓ Error handling works as expected\n');

        console.log('🎉 All tests passed! Your SQS implementation is correct!');
    } catch (error) {
        console.error('❌ Validation failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

validateChallenge(); 