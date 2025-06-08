import { 
    SFNClient, 
    CreateStateMachineCommand,
    StartExecutionCommand,
    DescribeExecutionCommand
} from '@aws-sdk/client-sfn';

interface ChallengeProps {
    sfnClient: SFNClient;
    roleArn: string;
}

export class Challenge {
    private sfnClient: SFNClient;
    private roleArn: string;
    private stateMachineArn: string | undefined;

    constructor({ sfnClient, roleArn }: ChallengeProps) {
        this.sfnClient = sfnClient;
        this.roleArn = roleArn;
    }

    /**
     * Creates a Step Functions state machine for order processing
     * @returns The state machine ARN
     */
    async createStateMachine(): Promise<string> {
        const definition = {
            Comment: "Order processing workflow",
            StartAt: "ValidateOrder",
            States: {
                ValidateOrder: {
                    Type: "Pass",
                    Parameters: {
                        "orderId.$": "$.orderId",
                        "items.$": "$.items",
                        "total.$": "$.total",
                        "status": "VALIDATED"
                    },
                    Next: "ProcessPayment"
                },
                ProcessPayment: {
                    Type: "Pass",
                    Parameters: {
                        "orderId.$": "$.orderId",
                        "items.$": "$.items",
                        "total.$": "$.total",
                        "status": "PAYMENT_PROCESSED"
                    },
                    Next: "FulfillOrder"
                },
                FulfillOrder: {
                    Type: "Pass",
                    Parameters: {
                        "orderId.$": "$.orderId",
                        "items.$": "$.items",
                        "total.$": "$.total",
                        "status": "FULFILLED"
                    },
                    Next: "ShipOrder"
                },
                ShipOrder: {
                    Type: "Pass",
                    Parameters: {
                        "orderId.$": "$.orderId",
                        "items.$": "$.items",
                        "total.$": "$.total",
                        "status": "SHIPPED",
                        "trackingNumber": "TRACK123"
                    },
                    End: true
                }
            }
        };

        const command = new CreateStateMachineCommand({
            name: `order-processing-${Date.now()}`,
            definition: JSON.stringify(definition),
            roleArn: this.roleArn
        });

        const response = await this.sfnClient.send(command);
        if (!response.stateMachineArn) {
            throw new Error('Failed to create state machine');
        }

        this.stateMachineArn = response.stateMachineArn;
        return response.stateMachineArn;
    }

    /**
     * Starts a new execution of the state machine
     * @param orderData - The order data to process
     * @returns The execution ARN
     */
    async startExecution(orderData: any): Promise<string> {
        if (!this.stateMachineArn) {
            throw new Error('State machine must be created first');
        }

        if (!orderData || !orderData.orderId || !orderData.items || !orderData.total) {
            throw new Error('Invalid order data: orderId, items, and total are required');
        }

        const command = new StartExecutionCommand({
            stateMachineArn: this.stateMachineArn,
            name: `execution-${orderData.orderId}-${Date.now()}`,
            input: JSON.stringify(orderData)
        });

        const response = await this.sfnClient.send(command);
        if (!response.executionArn) {
            throw new Error('Failed to start execution');
        }

        return response.executionArn;
    }

    /**
     * Gets the status of an execution
     * @param executionArn - The ARN of the execution to check
     * @returns The execution status and output
     */
    async getExecutionStatus(executionArn: string): Promise<{
        status: string;
        output?: any;
    }> {
        const command = new DescribeExecutionCommand({
            executionArn
        });

        const response = await this.sfnClient.send(command);
        
        const result: { status: string; output?: any } = {
            status: response.status || 'UNKNOWN'
        };

        if (response.output) {
            try {
                result.output = JSON.parse(response.output);
            } catch {
                result.output = response.output;
            }
        }

        return result;
    }

    /**
     * Main function that orchestrates the state machine creation and execution
     * @returns The execution ARN
     */
    async main(): Promise<string> {
        try {
            console.log('Creating state machine...');
            await this.createStateMachine();
            console.log('State machine created successfully');

            const orderData = {
                orderId: `order-${Date.now()}`,
                items: ['laptop', 'mouse', 'keyboard'],
                total: 999.99
            };

            console.log('Starting execution...');
            const executionArn = await this.startExecution(orderData);
            console.log('Execution started successfully');

            console.log('Monitoring execution...');
            let attempts = 0;
            const maxAttempts = 30;
            
            while (attempts < maxAttempts) {
                const { status, output } = await this.getExecutionStatus(executionArn);
                console.log(`Execution status: ${status}`);
                
                if (status === 'SUCCEEDED') {
                    console.log('Execution completed successfully');
                    console.log('Final output:', output);
                    break;
                } else if (status === 'FAILED' || status === 'TIMED_OUT' || status === 'ABORTED') {
                    throw new Error(`Execution failed with status: ${status}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }

            if (attempts >= maxAttempts) {
                throw new Error('Execution monitoring timed out');
            }

            return executionArn;
        } catch (error) {
            console.error('Error in main orchestration:', error);
            throw error;
        }
    }
}