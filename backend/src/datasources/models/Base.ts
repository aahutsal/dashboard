import { attribute, hashKey, table, rangeKey } from '@aws/dynamodb-data-mapper-annotations';
import { ApprovalStatus } from '@whiterabbitjs/dashboard-common';
import { TABLE_NAME } from '../DB';

@table(TABLE_NAME)
export class Base {
  @hashKey()
  pk!: string;

  @rangeKey({
    indexKeyConfigurations: {
      byIdIndex: 'HASH',
    }
  })
  sk!: string;

  @attribute()
  status = ApprovalStatus.PENDING

  @attribute({
    indexKeyConfigurations: {
        pendingItemsIndex: 'HASH',
    }
  })
  pendingStatus!: string;
}