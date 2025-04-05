# AWS Training

This repository contains various AWS service challenges and examples, organized using Bun workspaces. These challenges are generated using Generative AI to provide practical, hands-on learning experiences with AWS services.

## Structure

- `sqs/` - Amazon Simple Queue Service (SQS) challenge
  - Producer and consumer implementations
  - Environment configuration for SQS queue
  - `challenge-template.ts` - Template file for implementing new challenges

## Challenge Template

Each service challenge includes a template file (`challenge-template.ts`) that provides:
- The required interface and class structure
- Method signatures with TypeScript types
- JSDoc comments explaining each method's purpose
- TODO comments for implementation guidance

To implement a new challenge:
1. Copy the template file to a new file (e.g., `challenge.ts`)
2. Implement the required methods following the TODO comments
3. Test your implementation using the validation scripts

## Getting Started

1. Install Bun if you haven't already
2. Install dependencies:
   ```bash
   bun install
   ```
3. Navigate to the specific service directory to run scripts.

## Workspace Management

This repository uses Bun workspaces to manage dependencies across different services. Each service is a separate package under the `@aws-training` scope.

### Adding a New Service

1. Create a new directory for the service
2. Create a `package.json` with the name `@aws-training/<service-name>`
3. Add the directory to the `workspaces` array in the root `package.json`

## Requirements

- Bun
- AWS CLI configured with appropriate credentials
- AWS account with necessary permissions

## Security Note

This repository uses `.env` files for configuration. Make sure to never commit sensitive credentials or environment variables. The `.gitignore` file is configured to prevent this.

## License

MIT 