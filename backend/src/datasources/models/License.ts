import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";
import { Medium } from "@whiterabbitjs/dashboard-common";
import { isStrictSubset, intersects, DateFrame, dateFrameIncluded, dateFramesOverlap } from "../../util";
import { TABLE_NAME } from "../DB";
import { Base } from "./Base";

@table(TABLE_NAME)
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

  /**
   * Checks if the current License attributes match the attributes of the given License
   * 
   * @param license License — license to check the current one against
   * @param strict boolean — whether regions and timeframe should strictly match, otherwise
   *                         partial overlap is sufficient
   */
  matchesLicense(license: License, strict?: boolean): boolean {
    const anyRegion =
      !license.regions ||
      !license.regions.length ||
      !this.regions ||
      !this.regions.length;
    const regionMatch =
      anyRegion ||
      (strict
        ? isStrictSubset(license.regions, this.regions)
        : intersects(this.regions, license.regions));

    const mediumMatch =
      !license.medium || !this.medium || this.medium === license.medium;

    const licenseTimeframe: DateFrame = [license.fromDate, license.toDate];
    const priceTimeframe: DateFrame = [this.fromDate, this.toDate];
    const timeMatch = strict
        ? dateFrameIncluded(licenseTimeframe, priceTimeframe)
        : dateFramesOverlap(licenseTimeframe, priceTimeframe);
    
    return regionMatch && timeMatch && mediumMatch;
  }
}

export class LicenseResponse {
  success!: boolean;
  message!: string;
  license?: License;
}
