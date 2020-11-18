import { DataSource } from "apollo-datasource";
import { toArray } from "../util";
import { DataMapper } from "@aws/dynamodb-data-mapper";
import { Company } from "./models/Company";


export class CompanyAPI extends DataSource {
  private db: DataMapper;

  constructor(db: DataMapper) {
    super();
    this.db = db;
  }

  // Add new record
  async add(id: string, name: string): Promise<{ item: Company }> {
    if (!parseInt(id)) {
        id = name;
    }
    const company = new Company();
    company.pk = `COMPANY#${id}`;
    company.sk = `PROFILE`;
    company.id = id;
    company.name = name;
    return await this.db.put({ item: company });
  }

  async findById(companyId: string): Promise<Company> {
    const companies = await toArray(
      this.db.query(Company, { pk: `COMPANY#${companyId}`, sk: `PROFILE` })
    );
    return companies[0];
  }
}

export default CompanyAPI;
