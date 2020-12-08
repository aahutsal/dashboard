import { beginsWith } from '@aws/dynamodb-expressions';
import { DataSource } from 'apollo-datasource';
import { toArray } from '../util';
import { DataMapper, StringToAnyObjectMap } from '@aws/dynamodb-data-mapper';
import { License } from './models/License';
import { UserInputError } from 'apollo-server-express';

export class LicenseApi extends DataSource {
    private db: DataMapper;

    constructor(db: DataMapper) {
        super();
        this.db = db;
    }

    // Add new record
    async add(issuerId: string, license: License): Promise<License> {
        license.licenseId = `${license.movieId}#COMPANY:${license.companyId}#ISSUER:${issuerId}`;
        const existing = await this.findById(license.licenseId);
        if (existing) throw new UserInputError("You have already licensed this company");
        license.pk = `COMPANY#${license.companyId}`;
        license.sk = `MOVIE_LICENSE#${license.licenseId}`; //need unique identifier to allow updates
        license.pendingStatus = `ISSUER#${issuerId}`;
        license.regions = license.regions || [];
        await this.db.put({ item: license });
        return license;
    }

    // Update a record
    async update(license: License): Promise<void> {
        await this.db.update({ item: license });
    }

    // Delete a record
    async delete(companyId: string, licenseId: string): Promise<void> {
        const license = new License();
        license.pk = `COMPANY#${companyId}`;
        license.sk = `MOVIE_LICENSE#${licenseId}`;
        await this.db.delete({ item: license });
    }

    async deleteAll(): Promise<void> {
      for await (const _ of this.db.batchDelete(await this.getAll())) {
          // nothing
      }
    }

    async findById(licenseId: string): Promise<License|undefined> {
      return toArray(
          this.db.query(License, { 
            sk: `MOVIE_LICENSE#${licenseId}`
          }, { 
            indexName: 'byIdIndex',
            limit: 1,
          })
      ).then(m => m[0]);
    }

    async findByIssuingCompany(issuerId: string, movieId?: string): Promise<License[]> {
      const query = {
        pendingStatus: `ISSUER#${issuerId}`,
      } as StringToAnyObjectMap;

      if (movieId) {
        query.sk = beginsWith(`MOVIE_LICENSE#${movieId || ''}`);
      }

      return await toArray(
        this.db.query(License, query, { indexName: 'pendingItemsIndex' })
     );
    }

    async findByLicensedCompany(companyId: string, movieId?: string): Promise<License[]> {
      return await toArray(
        this.db.query(License, { 
          pk: `COMPANY#${companyId}`,
          sk: beginsWith(`MOVIE_LICENSE#${movieId || ''}`),
        })
     );
    }

    async getAll(): Promise<License[]> {
      const onlyLicenseCriteria = {
          filter: {
              ...beginsWith('MOVIE_LICENSE#'),
              subject: 'sk',
          }
      };
      return toArray(this.db.scan(License, onlyLicenseCriteria));
  }

}

export default LicenseApi;
