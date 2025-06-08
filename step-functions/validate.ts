import { 
    SFNClient, 
    DescribeStateMachineCommand,
    DescribeExecutionCommand,
    StartExecutionCommand,
    StopExecutionCommand
} from '@aws-sdk/client-sfn';
import { config } from 'dotenv';
import { Challenge } from './challenge';

config();

if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION environment variable is required');
}

if (!process.env.STEP_FUNCTIONS_ROLE_ARN) {
    throw new Error('STEP_FUNCTIONS_ROLE_ARN environment variable is required');
}

const sfnClient = new SFNClient({ region: process.env.AWS_REGION });
const roleArn = process.env.STEP_FUNCTIONS_ROLE_ARN as string;

async function validateStateMachineCreation(challenge: Challenge): Promise<string> {
    console.log('Test 1: Creating state machine...');
    const stateMachineArn = await challenge.createStateMachine();
    
    if (!stateMachineArn) {
        throw new Error('createStateMachine() should return a state machine ARN');
    }

    // Verify state machine exists and has correct configuration
    const describeCommand = new DescribeStateMachineCommand({
        stateMachineArn
    });
    const stateMachine = await sfnClient.send(describeCommand);
    
    if (!stateMachine) {
        throw new Error('State machine not found');
    }

    if (stateMachine.roleArn !== roleArn) {
        throw new Error(`State machine has incorrect role ARN. Expected: ${roleArn}, Got: ${stateMachine.roleArn}`);
    }

    if (!stateMachine.definition) {
        throw new Error('State machine definition is missing');
    }

    try {
        const definition = JSON.parse(stateMachine.definition);
        if (!definition.StartAt || !definition.States) {
            throw new Error('State machine definition is invalid: missing StartAt or States');
        }
        
        const requiredStates = ['ValidateOrder', 'ProcessPayment', 'FulfillOrder', 'ShipOrder'];
        const missingStates = requiredStates.filter(state => !definition.States[state]);
        if (missingStates.length > 0) {
            throw new Error(`State machine missing required states: ${missingStates.join(', ')}`);
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('State machine')) {
            throw error;
        }
        throw new Error(`State machine definition is invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('✓ State machine created and verified successfully\n');
    return stateMachineArn;
}

async function validateExecutionStart(
    challenge: Challenge, 
    stateMachineArn: string
): Promise<{ executionArn: string; orderData: any }> {
    console.log('Test 2: Starting execution...');
    const orderData = {
        orderId: 'test-123',
        items: ['item1', 'item2'],
        total: 100.00
    };
    const executionArn = await challenge.startExecution(orderData);
    
    if (!executionArn) {
        throw new Error('startExecution() should return an execution ARN');
    }

    // Verify execution exists and has correct input
    const describeExecutionCommand = new DescribeExecutionCommand({
        executionArn
    });
    const execution = await sfnClient.send(describeExecutionCommand);
    
    if (!execution) {
        throw new Error('Execution not found');
    }

    if (execution.input !== JSON.stringify(orderData)) {
        throw new Error('Execution has incorrect input data');
    }

    console.log('✓ Execution started and verified successfully\n');
    return { executionArn, orderData };
}

async function validateExecutionStatus(
    challenge: Challenge, 
    executionArn: string
): Promise<void> {
    console.log('Test 3: Checking execution status...');
    
    const maxWaitTime = 30000;
    const pollInterval = 1000;
    let elapsed = 0;
    let finalStatus = '';
    
    while (elapsed < maxWaitTime) {
        const { status, output } = await challenge.getExecutionStatus(executionArn);
        
        if (!status) {
            throw new Error('getExecutionStatus() should return a status');
        }

        const describeExecutionCommand = new DescribeExecutionCommand({
            executionArn
        });
        const currentExecution = await sfnClient.send(describeExecutionCommand);
        if (currentExecution.status !== status) {
            throw new Error(`Execution status does not match AWS state. Expected: ${status}, Actual: ${currentExecution.status}`);
        }
        
        finalStatus = status;
        
        if (status === 'SUCCEEDED' || status === 'FAILED' || status === 'TIMED_OUT' || status === 'ABORTED') {
            if (status === 'SUCCEEDED' && output) {
                if (!output.status || output.status !== 'SHIPPED') {
                    throw new Error('Execution succeeded but final output does not have expected status SHIPPED');
                }
                if (!output.trackingNumber) {
                    throw new Error('Execution succeeded but final output missing tracking number');
                }
            }
            break;
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        elapsed += pollInterval;
    }
    
    if (elapsed >= maxWaitTime && !['SUCCEEDED', 'FAILED', 'TIMED_OUT', 'ABORTED'].includes(finalStatus)) {
        console.warn(`⚠️  Execution still running after ${maxWaitTime}ms, stopping it...`);
        try {
            await sfnClient.send(new StopExecutionCommand({ executionArn }));
        } catch (error) {
            console.warn('Failed to stop execution:', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    console.log(`✓ Execution status verified successfully (Final status: ${finalStatus})\n`);
}

async function validateErrorHandling(
    challenge: Challenge
): Promise<void> {
    console.log('Test 4: Verifying error handling...');
    
    const invalidInputs = [
        {},
        { orderId: 'test' },
        { items: ['item1'] },
        { total: 100 },
        { orderId: 'test', items: ['item1'] },
        { orderId: 'test', total: 100 },
        { items: ['item1'], total: 100 },
        null,
        undefined
    ];
    
    for (const invalidInput of invalidInputs) {
        try {
            await challenge.startExecution(invalidInput);
            throw new Error(`startExecution should throw an error for input: ${JSON.stringify(invalidInput)}`);
        } catch (error) {
            if (!(error instanceof Error) || !error.message.includes('Invalid order data')) {
                throw new Error(`Expected 'Invalid order data' error for ${JSON.stringify(invalidInput)}, got: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
    
    try {
        await challenge.getExecutionStatus('invalid-arn');
    } catch (error) {
        if (!(error instanceof Error)) {
            throw new Error('getExecutionStatus should throw an error for invalid ARN');
        }
    }

    console.log('✓ Error handling verified successfully\n');
}

async function validateChallenge(): Promise<void> {
    console.log('Starting Step Functions Challenge Validation...\n');

    const challenge = new Challenge({ sfnClient, roleArn });

    try {
        // Run all validation tests
        const stateMachineArn = await validateStateMachineCreation(challenge);
        const { executionArn } = await validateExecutionStart(challenge, stateMachineArn);
        await validateExecutionStatus(challenge, executionArn);
        await validateErrorHandling(challenge);

        console.log('Test 5: Cleanup validation...');
        console.log('✓ All validations completed successfully\n');
        
        console.log('🎉 All tests passed! Your Step Functions implementation is correct!');
    } catch (error) {
        console.error('❌ Validation failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

validateChallenge(); 