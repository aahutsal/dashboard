import PriceAPI from './PriceAPI';

const mockDB = {
    query: jest.fn(),
};

const withCurrentTimeWindow = [
    {
        priceId: 'e38a2763-1111-4a7b-a0e8-b1307fbafbf7',
        IMDB: 'tt2133196',
        region: '276',
        medium: 'EST',
        amount: '1',
        fromWindow: 'Thu Jun 25 2020 03:00:00 GMT+0300 (Moscow Standard Time)',
        toWindow: 'Thu Jun 30 2020 03:00:00 GMT+0300 (Moscow Standard Time)',
    },
    {
        priceId: 'e38a2763-1111-4a7b-a0e8-b1307fbafbf7',
        IMDB: 'tt2133196',
        region: '276',
        medium: 'EST',
        amount: '2',
        fromWindow: 'Thu Jul 01 2020 03:00:00 GMT+0300 (Moscow Standard Time)',
        toWindow: 'Thu Jul 25 2022 03:00:00 GMT+0300 (Moscow Standard Time)',
    },
    {
        priceId: 'e38a2763-2222-4a7b-a0e8-b1307fbafbf7',
        IMDB: 'tt2133196',
        region: '276',
        medium: 'EST',
        amount: '3',
    }
];

const noCurrentTimeWindowAndNoDefault = [
    {
        priceId: 'e38a2763-1111-4a7b-a0e8-b1307fbafbf7',
        IMDB: 'tt2133196',
        region: '276',
        medium: 'EST',
        amount: '1',
        fromWindow: 'Thu Jun 25 2020 03:00:00 GMT+0300 (Moscow Standard Time)',
        toWindow: 'Thu Jun 30 2020 03:00:00 GMT+0300 (Moscow Standard Time)',
    },
];

const noCurrentTimeWindowWithDefault = [
    {
        priceId: 'e38a2763-1111-4a7b-a0e8-b1307fbafbf7',
        IMDB: 'tt2133196',
        region: '276',
        medium: 'EST',
        amount: '1',
        fromWindow: 'Thu Jun 25 2020 03:00:00 GMT+0300 (Moscow Standard Time)',
        toWindow: 'Thu Jun 30 2020 03:00:00 GMT+0300 (Moscow Standard Time)',
    },
    {
        priceId: 'e38a2763-2222-4a7b-a0e8-b1307fbafbf7',
        IMDB: 'tt2133196',
        region: '276',
        medium: 'EST',
        amount: '2',
    }
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API = new PriceAPI(mockDB as any);

describe('#findPrice', () => {
    test('no matching region, no matching window', async () => {
        mockDB.query.mockReturnValue([]);
        const price = await API.findPrice({ 
            IMDB: 'tt2133196',
            region: '276',
            medium: 'EST',
        });
        expect(price.amount).toEqual('20000000000000000');
        expect(price.priceId).toEqual('DEFAULT');
    });

    test('matching region, no matching window, no region default', async () => {
        mockDB.query.mockReturnValue(noCurrentTimeWindowAndNoDefault);
        const price = await API.findPrice({ 
            IMDB: 'tt2133196',
            region: '276',
            medium: 'EST',
        });
        expect(price.amount).toEqual('20000000000000000');
        expect(price.priceId).toEqual('DEFAULT');
    });

    test('matching region, no matching window, with region default', async () => {
        mockDB.query.mockReturnValue(noCurrentTimeWindowWithDefault);
        const price = await API.findPrice({ 
            IMDB: 'tt2133196',
            region: '276',
            medium: 'EST',
        });
        expect(price.amount).toEqual('2');
    });

    test('matching region, matching window', async () => {
        mockDB.query.mockReturnValue(withCurrentTimeWindow);
        const price = await API.findPrice({ 
            IMDB: 'tt2133196',
            region: '276',
            medium: 'EST',
        });
        expect(price.amount).toEqual('2');
    })
})