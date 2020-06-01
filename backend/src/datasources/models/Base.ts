import { attribute, hashKey, table, rangeKey } from '@aws/dynamodb-data-mapper-annotations';

export enum ApprovalStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum PendingStatus {
  USER = "Pending#USER",
  MOVIE = "Pending#MOVIE"
}

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