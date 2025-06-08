import { 
    S3Client, 
    CreateBucketCommand,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
    PutBucketVersioningCommand,
    CopyObjectCommand
} from '@aws-sdk/client-s3';

interface ChallengeProps {
    s3Client: S3Client;
    bucketName: string;
}

export class Challenge {
    private s3Client: S3Client;
    private bucketName: string;

    constructor({ s3Client, bucketName }: ChallengeProps) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    /**
     * Creates an S3 bucket with the specified configuration
     * @returns The bucket name
     */
    async createBucket(): Promise<string> {
        const command = new CreateBucketCommand({
            Bucket: this.bucketName
        });

        await this.s3Client.send(command);
        return this.bucketName;
    }

    /**
     * Uploads an object to the S3 bucket
     * @param key - The object key (filename)
     * @param body - The object content
     * @param contentType - The MIME type of the content
     * @returns The object key
     */
    async uploadObject(key: string, body: string | Buffer, contentType?: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType || 'text/plain'
        });

        await this.s3Client.send(command);
        return key;
    }

    /**
     * Downloads an object from the S3 bucket
     * @param key - The object key to download
     * @returns The object content as a string
     */
    async downloadObject(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        const response = await this.s3Client.send(command);
        
        if (!response.Body) {
            throw new Error('Object body is empty');
        }

        const content = await response.Body.transformToString();
        return content;
    }

    /**
     * Lists all objects in the S3 bucket
     * @param prefix - Optional prefix to filter objects
     * @returns Array of object keys
     */
    async listObjects(prefix?: string): Promise<string[]> {
        const command = new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix
        });

        const response = await this.s3Client.send(command);
        
        if (!response.Contents) {
            return [];
        }

        return response.Contents
            .filter(obj => obj.Key)
            .map(obj => obj.Key!);
    }

    /**
     * Deletes an object from the S3 bucket
     * @param key - The object key to delete
     * @returns True if deletion was successful
     */
    async deleteObject(key: string): Promise<boolean> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        await this.s3Client.send(command);
        return true;
    }

    /**
     * Sets up versioning on the S3 bucket
     * @param enabled - Whether to enable or disable versioning
     * @returns True if versioning configuration was successful
     */
    async configureBucketVersioning(enabled: boolean): Promise<boolean> {
        const command = new PutBucketVersioningCommand({
            Bucket: this.bucketName,
            VersioningConfiguration: {
                Status: enabled ? 'Enabled' : 'Suspended'
            }
        });

        await this.s3Client.send(command);
        return true;
    }

    /**
     * Copies an object within the same bucket or from another bucket
     * @param sourceKey - The source object key
     * @param destinationKey - The destination object key
     * @param sourceBucket - Optional source bucket (defaults to current bucket)
     * @returns The destination object key
     */
    async copyObject(sourceKey: string, destinationKey: string, sourceBucket?: string): Promise<string> {
        const copySource = `${sourceBucket || this.bucketName}/${sourceKey}`;
        
        const command = new CopyObjectCommand({
            Bucket: this.bucketName,
            Key: destinationKey,
            CopySource: copySource
        });

        await this.s3Client.send(command);
        return destinationKey;
    }

    /**
     * Main function that demonstrates S3 operations
     * @returns Summary of operations performed
     */
    async main(): Promise<{ [key: string]: any }> {
        const summary: { [key: string]: any } = {};

        try {
            // Create bucket
            console.log('Creating S3 bucket...');
            const bucketName = await this.createBucket();
            summary.bucketCreated = bucketName;
            console.log(`Bucket created: ${bucketName}`);

            // Upload test objects
            console.log('Uploading test objects...');
            const testFiles = [
                { key: 'documents/readme.txt', content: 'This is a README file for testing S3 operations.' },
                { key: 'data/sample.json', content: JSON.stringify({ message: 'Hello S3!', timestamp: new Date().toISOString() }) },
                { key: 'images/placeholder.txt', content: 'This represents an image file placeholder.' }
            ];

            const uploadedKeys: string[] = [];
            for (const file of testFiles) {
                const key = await this.uploadObject(file.key, file.content, file.key.endsWith('.json') ? 'application/json' : 'text/plain');
                uploadedKeys.push(key);
            }
            summary.objectsUploaded = uploadedKeys;
            console.log(`Uploaded ${uploadedKeys.length} objects`);

            // List all objects
            console.log('Listing all objects...');
            const allObjects = await this.listObjects();
            summary.allObjects = allObjects;
            console.log(`Found ${allObjects.length} objects`);

            // List objects with prefix
            console.log('Listing objects with prefix "documents/"...');
            const documentsObjects = await this.listObjects('documents/');
            summary.documentsObjects = documentsObjects;
            console.log(`Found ${documentsObjects.length} document objects`);

            // Download an object
            console.log('Downloading readme.txt...');
            const readmeContent = await this.downloadObject('documents/readme.txt');
            summary.downloadedContent = readmeContent;
            console.log('Downloaded content length:', readmeContent.length);

            // Copy an object
            console.log('Copying readme.txt to backup-readme.txt...');
            const copiedKey = await this.copyObject('documents/readme.txt', 'backup-readme.txt');
            summary.copiedObject = copiedKey;
            console.log(`Copied object to: ${copiedKey}`);

            // Configure versioning
            console.log('Enabling bucket versioning...');
            const versioningEnabled = await this.configureBucketVersioning(true);
            summary.versioningEnabled = versioningEnabled;
            console.log('Bucket versioning enabled');

            // Upload a new version of an existing file
            console.log('Uploading new version of readme.txt...');
            const updatedContent = 'This is an updated version of the README file with versioning enabled.';
            await this.uploadObject('documents/readme.txt', updatedContent);
            summary.newVersionUploaded = true;
            console.log('New version uploaded');

            // List objects again to see all objects including copied one
            const finalObjects = await this.listObjects();
            summary.finalObjectCount = finalObjects.length;
            
            // Clean up test objects (optional - comment out to keep objects for inspection)
            console.log('Cleaning up test objects...');
            const objectsToDelete = [...uploadedKeys, copiedKey];
            const deletedObjects: string[] = [];
            for (const key of objectsToDelete) {
                try {
                    await this.deleteObject(key);
                    deletedObjects.push(key);
                } catch (error) {
                    console.warn(`Failed to delete ${key}:`, error instanceof Error ? error.message : 'Unknown error');
                }
            }
            summary.objectsDeleted = deletedObjects;
            console.log(`Cleaned up ${deletedObjects.length} objects`);

            summary.success = true;
            console.log('S3 operations completed successfully!');
            
            return summary;
        } catch (error) {
            console.error('Error in S3 operations:', error);
            summary.error = error instanceof Error ? error.message : 'Unknown error';
            summary.success = false;
            throw error;
        }
    }
}