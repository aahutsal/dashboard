import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { Base } from './Base';

@table('movies')
export class Company extends Base {

    @attribute()
    id!: string;

    @attribute()
    name!: string;

}