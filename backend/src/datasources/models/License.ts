import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";
import { Medium } from "@whiterabbitjs/dashboard-common";
import { Base } from "./Base";

@table("movies")
export class License extends Base {
  constructor() {
    super();
  }

  @attribute()
  licenseId!: string;

  @attribute()
  companyId!: string;

  @attribute()
  movieId!: string;

  @attribute()
  regions!: string[];

  @attribute()
  medium!: Medium;

  @attribute()
  fromDate!: string;

  @attribute()
  toDate!: string;
}

export class LicenseResponse {
  success!: boolean;
  message!: string;
  license?: License;
}
