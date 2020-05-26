import { Movie } from './Movie';
import DBConnection from './DB';

DBConnection.ensureTableExists(Movie, { readCapacityUnits: 1, writeCapacityUnits: 1 })
    .then(() => {
        console.log('The table has been provisioned and is ready for use!');
    }).catch((error) => {
        console.error(error);
    });
