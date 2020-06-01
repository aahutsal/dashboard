import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { ApprovalStatus, Base } from './Base';

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
    @attribute()
    accountAddress!: string;

    @attribute()
    name!: string;

    @attribute()
    email!: string;

    @attribute()
    phone = '';

    @attribute()
    roles!: Array<UserRole>;

    isRightsHolder(): boolean {
      return this.status === ApprovalStatus.APPROVED 
        && this.roles.includes(UserRole.RIGHTSHOLDER);
    }
}
