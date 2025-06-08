# S3 Challenge

This challenge helps you learn AWS S3 (Simple Storage Service) operations using the AWS SDK for JavaScript/TypeScript.

## Overview

You'll implement various S3 operations including:
- Creating buckets
- Uploading and downloading objects
- Listing objects with optional prefix filtering
- Copying objects within buckets
- Configuring bucket versioning
- Deleting objects
- Error handling for common scenarios

## Prerequisites

- AWS credentials configured (via AWS CLI, environment variables, or IAM roles)
- Node.js/Bun runtime
- Required environment variables:
  - `AWS_REGION`: Your preferred AWS region (e.g., 'us-east-1')

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables:
   ```bash
   export AWS_REGION="us-east-1"
   ```

## Files

- `challenge-template.ts`: Starting template with method stubs
- `challenge.ts`: Complete implementation (reference solution)
- `validate.ts`: Validation script to test your implementation
- `package.json`: Project dependencies and scripts

## Challenge Tasks

Implement the following methods in the `Challenge` class:

### 1. `createBucket(): Promise<string>`
- Create an S3 bucket with the provided name
- Handle any region-specific requirements
- Return the bucket name

### 2. `uploadObject(key: string, body: string | Buffer, contentType?: string): Promise<string>`
- Upload content to the specified object key
- Set appropriate content type metadata
- Return the object key

### 3. `downloadObject(key: string): Promise<string>`
- Download object content from the bucket
- Convert response to string format
- Handle missing objects gracefully

### 4. `listObjects(prefix?: string): Promise<string[]>`
- List all objects in the bucket
- Apply prefix filter when provided
- Return array of object keys

### 5. `deleteObject(key: string): Promise<boolean>`
- Delete the specified object from the bucket
- Return success status

### 6. `configureBucketVersioning(enabled: boolean): Promise<boolean>`
- Enable or disable versioning on the bucket
- Return configuration success status

### 7. `copyObject(sourceKey: string, destinationKey: string, sourceBucket?: string): Promise<string>`
- Copy object within the same bucket or from another bucket
- Handle cross-bucket operations when source bucket is specified
- Return the destination key

### 8. `main(): Promise<{ [key: string]: any }>`
- Orchestrate all S3 operations in a demonstration workflow
- Return a summary of operations performed

## Running the Challenge

### Test Your Implementation
```bash
bun run validate
```

### Run the Main Demo
```bash
bun run challenge.ts
```

## Validation Tests

The validation script tests:

1. **Bucket Creation**: Verifies bucket is created and accessible
2. **Object Upload**: Tests file upload with correct metadata
3. **Object Download**: Validates content retrieval and integrity
4. **Object Listing**: Tests listing with and without prefix filters
5. **Object Copying**: Verifies object duplication functionality
6. **Bucket Versioning**: Tests versioning configuration
7. **Object Deletion**: Confirms successful object removal
8. **Error Handling**: Tests error scenarios (missing objects, etc.)
9. **Cleanup**: Ensures proper resource cleanup

## Key Learning Points

- Understanding S3 bucket and object operations
- Working with AWS SDK commands and responses
- Handling binary and text content
- Managing S3 metadata and content types
- Implementing prefix-based filtering
- Configuring bucket features like versioning
- Proper error handling for AWS services
- Resource cleanup and management

## Common Issues

1. **Region Mismatch**: Ensure your AWS region is set correctly
2. **Permissions**: Verify your AWS credentials have S3 permissions
3. **Bucket Names**: S3 bucket names must be globally unique
4. **Content Types**: Set appropriate MIME types for uploaded content
5. **Error Handling**: AWS errors should be caught and handled appropriately

## AWS Permissions Required

Your AWS credentials need the following S3 permissions:
- `s3:CreateBucket`
- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`
- `s3:DeleteObject`
- `s3:PutBucketVersioning`
- `s3:GetBucketVersioning`
- `s3:CopyObject`

## Next Steps

After completing this challenge, consider exploring:
- S3 lifecycle policies
- Cross-region replication
- S3 event notifications
- Presigned URLs for temporary access
- S3 Transfer Acceleration
- CloudFront integration for content delivery