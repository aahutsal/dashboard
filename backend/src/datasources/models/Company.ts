import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { ApprovalStatus } from '@whiterabbitjs/dashboard-common';
import { Base } from './Base';

@table('movies')
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