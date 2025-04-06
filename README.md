# AWS Learning Sandbox 🚀

A workspace to learn the basics of some foundational AWS services that I don't typically use day to day. 

To generate the challenges, I use Gen AI to help create test scripts with various workflows, and then a script with placeholder functions for me to then implement with the help of the AWS docs.

If you're interested in leveraging this, each folder has a `challenge-template.ts` without the solution code.

## What's Inside 📦

Folders:
- `sqs/` - Amazon Simple Queue Service (SQS)
  - Playing around with producer and consumer implementations

## Getting Started 🚀

If you want to try these challenges yourself:
1. Make sure you have Bun installed
2. Install the dependencies at the root:
   ```bash
   bun install
   ```
3. Jump into any service directory to start playing around

### Adding New Services

When I want to add a new service:
1. Create a new directory for it
2. Set up a `package.json` with the name `@aws-training/<service-name>`
3. Add the directory to the `workspaces` array in the root `package.json`

## What You'll Need 🛠️

- Bun
- AWS CLI with your credentials set up
- An AWS account with the right permissions
