import { attribute, hashKey, table, rangeKey } from '@aws/dynamodb-data-mapper-annotations';
import { ApprovalStatus } from '@whiterabbitjs/dashboard-common';

@table('movies')
export class Base {
  @hashKey()
  pk!: string;

  @rangeKey({
    indexKeyConfigurations: {
        movieByIdIndex: 'HASH',
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