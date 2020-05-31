import { Base } from '../models/Base';
import DBConnection from '../DB';

console.log('NODE_ENV: ', process.env.NODE_ENV);
DBConnection.deleteTable(Base)
    .then(() => {
        console.log('Table and indices were DELETED');
    }).catch((error) => {
        console.error(error);
    });