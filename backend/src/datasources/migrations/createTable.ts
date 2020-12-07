import { Movie } from '../models/Movie';
import { User } from '../models/User';
import DBConnection from '../DB';
import { GlobalSecondaryIndexOptions } from '@aws/dynamodb-data-mapper';

const tableOptions = { 
    readCapacityUnits: 1,
    writeCapacityUnits: 1,
    indexOptions: {
        byIdIndex: {
            type: 'global',
            projection: 'all',
            readCapacityUnits: 1,
            writeCapacityUnits: 1,
        } as GlobalSecondaryIndexOptions,
        pendingItemsIndex: {
            type: 'global',
            projection: 'all',
            readCapacityUnits: 1,
            writeCapacityUnits: 1,
        } as GlobalSecondaryIndexOptions,
    }
 };

console.log('NODE_ENV: ', process.env.NODE_ENV);
DBConnection.ensureTableExists(User, tableOptions)
    .then(() => DBConnection.ensureTableExists(Movie, tableOptions))
    .then(() => {
        console.log('Table and indices were created');
    }).catch((error) => {
        console.error(error);
    });