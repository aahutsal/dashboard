# Follow the guide here to set yourself up for local development
https://thegraph.com/docs/quick-start#local-development

The code for the CollectionPool smart contract is available in the mad-hatter repository.

Importantly install the Graph CLI `npm install -g @graphprotocol/graph-cli`

# Deploy instructions
Before being able to deploy, you need to set yourself up with the authentication token.
`graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>`

To generate the needed schemas run `npm run codegen`

To deploy to the hosted service run `npm run deploy`

# GraphQL based API
Query URL: `https://api.thegraph.com/subgraphs/name/whiterabbittheworldisyours/collectionpool`
# Example requests
## Get total revenue for all movies
```
{
  	revenuePerMovies {
    id
    total
  }
}

```

Example response:

```
{
  "data": {
    "revenuePerMovies": [
      {
        "id": "1343237633",
        "total": "210000000000000000"
      },
      {
        "id": "750969345",
        "total": "30000000000000000"
      }
    ]
  }
}
```
## Get Revenue per Movie and Movie region specified by id

```
  {
  	revenuePerMovie(id: 1343237633) {
    id
    total
   	revenuePerMovieRegions {
      region
      total
    }
  }
}
```
Example response:
```
{
  "data": {
    "revenuePerMovie": {
      "id": "1343237633",
      "revenuePerMovieRegions": [
        {
          "region": 1,
          "total": "10000000000000000"
        },
        {
          "region": 276,
          "total": "190000000000000000"
        },
        {
          "region": 643,
          "total": "10000000000000000"
        }
      ],
      "total": "210000000000000000"
    }
  }
}
```
