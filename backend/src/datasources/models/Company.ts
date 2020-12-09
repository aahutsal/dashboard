import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { ApprovalStatus } from '@whiterabbitjs/dashboard-common';
import { TABLE_NAME } from '../DB';
import { Base } from './Base';

@table(TABLE_NAME)
export class Company extends Base {

    constructor() {
      super();
      this.status = ApprovalStatus.PENDING;
      this.pendingStatus = `COMPANY#${ApprovalStatus.PENDING}`;
    }

    @attribute()
    id!: string;

    @attribute()
    name!: string;

    @attribute()
    kind!: string;
}