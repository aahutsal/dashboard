import { attribute, hashKey, rangeKey, table } from '@aws/dynamodb-data-mapper-annotations';
import { ApprovalStatus, User as BaseUser, UserRole } from '@whiterabbitjs/dashboard-common';

export class UserResponse {
  success!: boolean;
  message!: string;
  user?: User;
}

@table('movies')
export class User extends BaseUser {

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

  @attribute()
  accountAddress!: string;

  @attribute()
  name!: string;

  @attribute()
  email!: string;

  @attribute()
  id!: number;

  @attribute()
  imdbId!: string;

  @attribute()
  kind!: string;

  @attribute()
  companyId!: string;

  @attribute()
  roles!: Array<UserRole>;

  constructor(seed?: object) {
    super(seed);
  }
}
