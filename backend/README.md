# Dashboard Backend Server

Graphql powered backend server

- Local `npm run start-local`
- Visit `http://localhost:4000/graphql`
- Click play button to load test query


# Available get requests
### Get movies using specific IDs
```
{
  movies {
    id
    IMDB
    rightsHolder {
      name
      contact
      status
    }
  }
}
```
### Get movie by id
```
{
  movie(id: "b018053a-57f8-4eed-8046-b940ac83d0be") {
    id
    IMDB
    rightsHolder {
      name
      contact
      status
    }
  }
}
```

# Available update requests

### Add Movie

```
mutation {
  addMovie(movies: [ {IMDB: "Secondary Peace", ISAN: "First Output", payoutAddress: "0xdkfadjf", ownerAddress: "0xkdjklfj"}]) {
    message
    movies {
      id
      IMDB
    }
  }
}
```

### Update RightsHolder

```
mutation {
  attachRightsHolder(info: { movies: ["b018053a-57f8-4eed-8046-b940ac83d0be", "9467ae49-2c1f-43b5-a18f-bb87dfa5661b"], rightsHolder: { name:"Joel", contact: "email", address: "Regional"}}) {
    message
    movies {
      id
      rightsHolder {
        name
        contact
        address
      }
    }
  }
}
```