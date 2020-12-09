import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";
import { Base } from "./Base";
import { Medium } from "@whiterabbitjs/dashboard-common";
import { DateFrame, dateFrameIncluded, dateFramesOverlap, intersects, isStrictSubset } from "../../util";
import { License } from "./License";
import { TABLE_NAME } from "../DB";

enum PriceType {
  WHITERABBIT = "WHITERABBIT",
  RIGHTSHOLDER = "RIGHTSHOLDER",
}

@table(TABLE_NAME)
export class Price extends Base {
  @attribute()
  type!: PriceType;

  @attribute()
  amount!: string;

  @attribute()
  regions!: string[];

  @attribute()
  medium!: Medium;

  // TODO: rename to fromDate for consistency
  @attribute()
  fromWindow!: string;

  // TODO: rename to toDate for consistency
  @attribute()
  toWindow!: string;

  priceId(): string {
    return this.sk.replace("PRICE#", "");
  }

  /**
   * Checks if the current Price attributes match the attributes of the given License
   * 
   * @param license License — license to check the current one against
   * @param strict boolean — whether regions and timeframes should strictly match, otherwise
   *                         partial overlap is sufficient
   */
  // TODO: extract to super class BaseRestricted along with regions, medium, fromDate, toDate
  // duplicates the one in Price model
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
    const priceTimeframe: DateFrame = [this.fromWindow, this.toWindow];
    const timeMatch = strict
        ? dateFrameIncluded(licenseTimeframe, priceTimeframe)
        : dateFramesOverlap(licenseTimeframe, priceTimeframe);
    
    return regionMatch && timeMatch && mediumMatch;
  }
}

export class PriceResponse {
  success!: boolean;
  message!: string;
  pricing?: Price;
}
