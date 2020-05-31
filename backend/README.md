# Dashboard Backend Server

Graphql powered backend server

- Local `npm run start-local`
- Visit `http://localhost:4000/graphql`
- Click play button to load test query

## Available get requests

### Get movie by IMDB id

```graphql
{
  movie(IMDB: "0096283") {
    IMDB
    ISAN
    status
    record {
      source
    }
    rightsHolder {
      name
      email
      status
    }
    pricing {
      region
    }
  }
}
```

### Get user data and movies registered by the user

```graphql
{
  user(accountAddress: "0xaf0939af286A35DBfab7DEd7c777A5F6E8BE26A8") {
    email
    name
    movies {
      IMDB
      ISAN
    }
  }
}
```

## Available update requests

### Add User

```graphql
mutation {
  addUser(user: {
    accountAddress: "0xaf0939af286A35DBfab7DEd7c777A5F6E8BE26A8",
    name: "Kosta",
    email: "kosta@leapdao.org",
    roles: [RIGHTSHOLDER]
  }) {
    success
    message
    user { name }
  }
}
```

### Add Movie

```graphql
mutation {
  addMovie(
    movies: [ {
      IMDB: "0096283",
      ISAN: "0000-0001-07AD-0000-Y-0000-0000-9",
    }],
    userId: "0xaf0939af286A35DBfab7DEd7c777A5F6E8BE26A8"
  ) {
    message
    movies {
      IMDB
    }
  }
}
```
