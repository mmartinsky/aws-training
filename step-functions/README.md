# Step Functions Challenge: Order Processing Workflow

This challenge will help you learn how to work with AWS Step Functions by implementing an order processing workflow in TypeScript.

## Challenge Overview

You will implement a system that:
1. Creates a Step Functions state machine
2. Defines a workflow for processing orders
3. Handles different order states (Created, Validated, Processed, Shipped)
4. Implements error handling and retries

## Requirements

- [Bun](https://bun.sh/) (JavaScript runtime)
- AWS SDK for JavaScript
- AWS credentials with Step Functions permissions
- The state machine ARN from your `.env` file

## Challenge Tasks

1. Implement the `createStateMachine` function in `challenge.ts` to:
   - Create a Step Functions state machine
   - Define the order processing workflow
   - Return the state machine ARN

2. Implement the `startExecution` function to:
   - Start a new execution of the state machine
   - Pass order data as input
   - Return the execution ARN

3. Implement the `getExecutionStatus` function to:
   - Check the status of an execution
   - Return the current state and output

4. Implement the `main` function to:
   - Create the state machine
   - Start an execution
   - Monitor the execution status
   - Handle any errors that occur

## Validation

Run the validation script to check your implementation:
```bash
bun run validate
```

The validation script will:
1. Create a state machine
2. Start an execution
3. Verify the workflow steps
4. Check error handling
5. Clean up resources

## Success Criteria

Your implementation will be considered successful if:
- The state machine is created successfully
- The execution runs through all states
- Error handling works as expected
- Resources are properly cleaned up

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

- Use the AWS SDK's Step Functions client
- Define your state machine using the Amazon States Language (ASL)
- Implement proper error handling
- Use retry mechanisms for transient failures
- The code is written in TypeScript, so take advantage of type safety
- Use async/await for better readability

## TypeScript Tips

- All functions are properly typed with TypeScript interfaces
- The `Challenge` interface defines the expected shape of your implementation
- Use type assertions carefully when dealing with AWS SDK responses
- Take advantage of TypeScript's type inference where possible 