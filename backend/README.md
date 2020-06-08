# Dashboard Backend Server

Graphql powered backend server

- Local `npm run start-local`
- Visit `http://localhost:4000/graphql`
- Click play button to load test query

## Available requests

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
      contact
      status
    }
    pricing {
      region
      medium
      amount
    }
  }
}
```

### Get user data and movies registered by the user

```graphql
{
  user(accountAddress: "0xaf0939af286A35DBfab7DEd7c777A5F6E8BE26A8") {
    contact
    name
    movies {
      IMDB
      ISAN
    }
  }
}
```

### Get movie prices
```graphql
{
  prices(IMDB: "336223"){
    priceId
    type
    amount
    region
    fromWindow
    toWindow
  }
}
```

### Get current movie price by region and medium

```graphql
{
  price(filter: { IMDB: "336222", region:"DE", medium: "EST" }){
    priceId
    type
    amount
    region
    fromWindow
    toWindow
		medium
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
    contact: "kosta@leapdao.org",
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
    movie: {
      IMDB: "336222",
      record: {
        source: "themoviedb",
        value: "{\"adult\":false,\"backdrop_path\":\"/eAgKvahrg6EY521kEA11GwGvjY2.jpg\",\"belongs_to_collection\":null,\"budget\":0,\"genres\":[{\"id\":18,\"name\":\"Drama\"}],\"homepage\":\"\",\"id\":336222,\"imdb_id\":\"tt3296658\",\"original_language\":\"is\",\"original_title\":\"Hrútar\",\"overview\":\"In a secluded valley in Iceland, Gummi and Kiddi live side by side, tending to their sheep. Their ancestral sheep-stock is considered one of the country’s best and the two brothers are repeatedly awarded for their prized rams who carry an ancient lineage. Although they share the land and a way of life, Gummi and Kiddi have not spoken to each other in four decades. When a lethal disease suddenly infects Kiddi’s sheep, the entire valley comes under threat. The authorities decide to cull all the animals in the area to contain the outbreak. But Gummi and Kiddi don’t give up so easily – and each brother tries to stave off the disaster in his own fashion: Kiddi by using his rifle and Gummi by using his wits.\",\"popularity\":10.268,\"poster_path\":\"/dDURoH8rc35vjisYr62vzlaBUF1.jpg\",\"production_companies\":[{\"id\":72742,\"logo_path\":null,\"name\":\"Aeroplan Film\",\"origin_country\":\"\"},{\"id\":118,\"logo_path\":\"/AiBorgNTCS1lT1FdFPYheax9jfF.png\",\"name\":\"Det Danske Filminstitut\",\"origin_country\":\"DK\"},{\"id\":125301,\"logo_path\":null,\"name\":\"Icelandic Film Center\",\"origin_country\":\"\"},{\"id\":94775,\"logo_path\":null,\"name\":\"Netop Films\",\"origin_country\":\"IS\"},{\"id\":64293,\"logo_path\":null,\"name\":\"Profile Pictures\",\"origin_country\":\"DK\"}],\"production_countries\":[{\"iso_3166_1\":\"DK\",\"name\":\"Denmark\"},{\"iso_3166_1\":\"IS\",\"name\":\"Iceland\"},{\"iso_3166_1\":\"NO\",\"name\":\"Norway\"},{\"iso_3166_1\":\"PL\",\"name\":\"Poland\"}],\"release_date\":\"2015-05-28\",\"revenue\":0,\"runtime\":93,\"spoken_languages\":[{\"iso_639_1\":\"is\",\"name\":\"Íslenska\"}],\"status\":\"Released\",\"tagline\":\"This Winter Get Sheepish\",\"title\":\"Rams\",\"video\":false,\"vote_average\":7.1,\"vote_count\":148}"
      }
	  }
  ) {
    message
    movies {
      IMDB
    }
  }
}
```
### Add movie prices

```graphql
mutation {
  addPrice( pricing:
    {
    	IMDB: "336223",
      type: "WHITERABBIT", 
      region: "MA",
      amount: "65344", 
      medium: "FREETV", 
      fromWindow: "2020-06-01T17:45:23+00:00", 
      toWindow: "2020-06-01T17:45:23+00:00"
    }
  )  {
    message
    pricing {
      	priceId
        type
        region
        medium
        amount
        fromWindow
        toWindow
    },
  }
}
```

### Update price
```graphql
mutation {
  updatePrice( pricing: 
    {
      priceId: "ae9d5cfc-4fbd-41e7-b46e-e5a665b3e271"
    	IMDB: "336222",
      type: "WHITERABBIT", 
      region: "MA",
      amount: "70000", 
      medium: "SVOD", 
      fromWindow: "2020-06-01T17:45:23+00:00", 
      toWindow: "2020-06-01T17:45:23+00:00"
  	})  {
    message
    pricing {
      	priceId
        type
        region
        medium
        amount
        fromWindow
        toWindow
    },
  }
}
```

## Authorization

HTTP headers required for restricted APIs (e.g. addMovie). These are set automatically by FE when user signs the message with his private key.

For Graphql Playground use the following structure in "HTTP Headers" (take the actual values from your Local Storage):

```json
{
  "x-wr-signature": "0xc42679d99609c13b5375c76dd002417d0ef0cc098d49963f4bdf932229187b5e4f40179525ee68d8fb5dad7b631105c59915bfb5369ee4ded32666285de807341b",
  "x-wr-sigdata": "{\"timestamp\":1590840035105}"
}
```
