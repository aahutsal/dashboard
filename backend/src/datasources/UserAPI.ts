import { DataSource } from 'apollo-datasource';
import DBConnection from './DB';
import { User } from './models/User';
import { toArray } from '../util';
import { PendingStatus, ApprovalStatus } from '@whiterabbitjs/dashboard-common';

class UserAPI extends DataSource {

    // Add new record
    async add(user: User, companyId: string): Promise<{item: User}> {
        user.pk = `USER#${user.accountAddress}`;
        user.sk = 'PROFILE';
        user.pendingStatus = PendingStatus.USER;
        user.status = ApprovalStatus.PENDING;
        user.companyId = companyId;
        return DBConnection.put({ item: user });
    }

    // Get record by id
    async findById(accountAddress: string): Promise<{ item?: User }> {
        const toFind = Object.assign(new User(), { 
            pk: `USER#${accountAddress}`,
            sk: 'PROFILE',
        });
        return DBConnection.get({ item: toFind }).catch(() => ({}));
    }   

    async getPending(): Promise<User[]> {
        return toArray(
            DBConnection.query(User, {
                pendingStatus: `Pending#USER`
            }, { 
                indexName: 'pendingItemsIndex'
            })
        );
    }

    async approve(userId: string): Promise<{ item?: User}> {
        const user = await this.findById(userId) as User;
        if (!user) throw new Error(`No such user ${userId}`);
        user.status = ApprovalStatus.APPROVED;
        user.pendingStatus = 'Approved';
        return DBConnection.update({ item: user });
    }

    async decline(userId: string): Promise<void> {
        const user = await this.findById(userId) as User;
        if (!user) throw new Error(`No such user ${userId}`);
        await DBConnection.delete({ item: user });
    }

}

export default new UserAPI();