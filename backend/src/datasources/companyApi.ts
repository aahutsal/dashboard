import { DataSource } from "apollo-datasource";
import { toArray } from "../util";
import { DataMapper } from "@aws/dynamodb-data-mapper";
import { Company } from "./models/Company";
import { CompanyType, ApprovalStatus, toCompanyType } from "@whiterabbitjs/dashboard-common";


export class CompanyAPI extends DataSource {
  private db: DataMapper;

  constructor(db: DataMapper) {
    super();
    this.db = db;
  }

  // Add new record
  async add(company: Company): Promise<Company> {
    if (!parseInt(company.id)) {
        company.id = name;
    }
    company.pk = `COMPANY#${company.id}`;
    company.sk = `PROFILE`;
    await this.db.put({ item: company });
    return company;
  }

  async approve(companyId: string): Promise<Company> {
    const company = await this.findById(companyId);
    if (!company) throw new Error(`No such company ${companyId}`);
    company.status = ApprovalStatus.APPROVED;
    company.pendingStatus = this.getApprovedStatus(company);
    return this.db.update({ item: company }).then(({ item }) => item);
  }

  async findById(companyId: string): Promise<Company> {
    const companies = await toArray(
      this.db.query(Company, { pk: `COMPANY#${companyId}`, sk: 'PROFILE' })
    );
    return companies[0];
  }

  async getDistributors(): Promise<Company[]> {
    return toArray(
        this.db.query(Company, {
            pendingStatus: `COMPANY#APPROVED#SUBLICENSEE`,
        }, { 
            indexName: 'pendingItemsIndex'
        })
    );
  }

  getApprovedStatus({ kind }: Company): string {
    const companyType = toCompanyType(kind);
    const isDistributor = companyType === CompanyType.DISTRIBUTION || companyType === CompanyType.SALES;
    return `COMPANY#APPROVED${isDistributor ? '#SUBLICENSEE' : ''}`;
  }
}

export default CompanyAPI;
