import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { ApprovalStatus, Base, PendingStatus } from './Base';

enum UserRole {
  ADMIN = "ADMIN",
  RIGHTSHOLDER = "RIGHTSHOLDER",
}

export class UserResponse {
  success!: boolean;
  message!: string;
  user!: User;
}

export class User extends Base {
  constructor() {
    super();
    this.status = ApprovalStatus.PENDING;
    this.pendingStatus = PendingStatus.USER;
  }

  @attribute()
  accountAddress!: string;

  @attribute()
  name!: string;

  @attribute()
  contact!: string;

  @attribute()
  roles!: Array<UserRole>;

  isRightsHolder(): boolean {
    return this.status === ApprovalStatus.APPROVED 
      && this.roles.includes(UserRole.RIGHTSHOLDER);
  }
}
