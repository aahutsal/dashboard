import { DataSource } from 'apollo-datasource';
import DBConnection from './DB';
import { User } from './models/User';
import { ApprovalStatus } from './models/Base';

class UserAPI extends DataSource {

    // Add new record
    async add(user: User): Promise<{item: User}> {
        user.pk = `USER#${user.accountAddress}`;
        user.sk = 'PROFILE';
        user.status = ApprovalStatus.PENDING;
        return DBConnection.put({ item: user });
    }

    // Get record by id
    async findById(accountAddress: string): Promise<{ item: User }> {
        const toFind = Object.assign(new User(), { 
            pk: `USER#${accountAddress}`,
            sk: 'PROFILE',
        });
        return DBConnection.get({ item: toFind });
    }   
}

export default new UserAPI();