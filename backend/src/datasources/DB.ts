
import { DataMapper } from '@aws/dynamodb-data-mapper';
import DynamoDB from 'aws-sdk/clients/dynamodb';

const config: { region: string; endpoint?: string } = { region: 'eu-central-1' };
if (process.env.NODE_ENV === 'dev') {
    config.endpoint = 'http://localhost:4567';
}

const client = new DynamoDB(config);
const DBConnection = new DataMapper({ client });

export default DBConnection;