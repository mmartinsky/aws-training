# SQS Challenge: Message Processing System

This challenge will help you learn how to work with Amazon Simple Queue Service (SQS) by implementing a message processing system in TypeScript.

## Challenge Overview

You will implement a system that:
1. Sends messages to an SQS queue
2. Processes messages from the queue
3. Handles message visibility timeouts
4. Implements proper error handling

## Requirements

- [Bun](https://bun.sh/) (JavaScript runtime)
- AWS SDK for JavaScript
- AWS credentials with SQS permissions
- The queue URL from your `.env` file

## Challenge Tasks

1. Implement the `sendMessage` function in `challenge.ts` to:
   - Send a message to the SQS queue
   - Return the message ID
   - Handle errors appropriately

2. Implement the `processMessage` function to:
   - Receive messages from the queue
   - Process them (in this case, just log them)
   - Delete the message after successful processing
   - Handle errors and visibility timeouts

3. Implement the `main` function to:
   - Send multiple test messages
   - Process them
   - Handle any errors that occur

## Validation

Run the validation script to check your implementation:
```bash
bun run validate
```

The validation script will:
1. Send test messages
2. Verify they are processed correctly
3. Check error handling
4. Verify message deletion

## Success Criteria

Your implementation will be considered successful if:
- All test messages are sent successfully
- All messages are processed and deleted
- Error handling works as expected
- No messages are left in the queue after processing

## Getting Started

1. Make sure your `.env` file is properly configured
2. Install dependencies:
   ```bash
   bun install
   ```
3. Implement the functions in `challenge.ts`
4. Run the validation script to test your implementation:
   ```bash
   bun run validate
   ```

## Hints

- Use the AWS SDK's SQS client
- Pay attention to message visibility timeouts
- Implement proper error handling
- Make sure to delete messages after processing
- The code is written in TypeScript, so take advantage of type safety
- Use async/await for better readability

## TypeScript Tips

- All functions are properly typed with TypeScript interfaces
- The `Challenge` interface defines the expected shape of your implementation
- Use type assertions carefully when dealing with AWS SDK responses
- Take advantage of TypeScript's type inference where possible 