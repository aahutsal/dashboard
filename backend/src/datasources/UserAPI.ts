import { DataSource } from 'apollo-datasource';
import { User } from './models/User';
import { toArray } from '../util';
import { ApprovalStatus } from '@whiterabbitjs/dashboard-common';
import { DataMapper } from '@aws/dynamodb-data-mapper';

class UserAPI extends DataSource {
    private db: DataMapper;

    constructor(db: DataMapper) {
        super();
        this.db = db;
    }    

    // Add new record
    async add(user: User, companyId: string): Promise<User> {
        user.pk = `USER#${user.accountAddress}`;
        user.sk = 'PROFILE';
        user.pendingStatus = `USER#${ApprovalStatus.PENDING}`;
        user.status = ApprovalStatus.PENDING;
        user.companyId = companyId;
        return this.db.put({ item: user }).then(({ item }) => item);
    }

    // Get record by id
    async findById(accountAddress: string): Promise<User | undefined> {
        const toFind = Object.assign(new User(), { 
            pk: `USER#${accountAddress}`,
            sk: 'PROFILE',
        });
        const result = await this.db.get({ item: toFind }).catch(() => undefined);
        return result as unknown as User;
    }   

    async getPending(): Promise<User[]> {
        return toArray(
            this.db.query(User, {
                pendingStatus: `USER#${ApprovalStatus.PENDING}`
            }, { 
                indexName: 'pendingItemsIndex'
            })
        );
    }

    async approve(userId: string): Promise<User> {
        const user = await this.findById(userId) as User;
        if (!user) throw new Error(`No such user ${userId}`);
        user.status = ApprovalStatus.APPROVED;
        user.pendingStatus = `USER#${ApprovalStatus.APPROVED}`;
        const result = this.db.update({ item: user });
        return result as unknown as User;
    }

    async decline(userId: string): Promise<void> {
        const user = await this.findById(userId) as User;
        if (!user) throw new Error(`No such user ${userId}`);
        await this.db.delete({ item: user });
    }

}

export default UserAPI;