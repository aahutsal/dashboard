import { BigInt } from "@graphprotocol/graph-ts"
import {
  Deposit,
  OwnershipTransferred,
  Transfer,
  Refund,
  Distribution
} from "../generated/CollectionPool/CollectionPool"
import { RevenuePerMovie, RevenuePerMovieRegion } from "../generated/schema"

export function handleDeposit(event: Deposit): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let movieId = event.params.movieId.toString()
  let regionId = movieId + "-" + BigInt.fromI32(event.params.region).toString()
  let movie = RevenuePerMovie.load(movieId)
  let region = RevenuePerMovieRegion.load(regionId)
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (movie == null) {
    movie = new RevenuePerMovie(movieId)
    movie.total = BigInt.fromI32(0)
  }
  if (region == null) {
    region = new RevenuePerMovieRegion(regionId)
    region.total = BigInt.fromI32(0)
    region.unclaimed = BigInt.fromI32(0)
    region.region = event.params.region
    region.revenuePerMovie = movieId
  }
  let value = event.transaction.value
  // BigInt and BigDecimal math are supported
  region.total = region.total + value
  region.unclaimed = region.unclaimed + value
  movie.total = movie.total + value
  region.save()
  // Entities can be written to the store with `.save()`
  movie.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {}

export function handleDistribution(event: Distribution): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let movieId = event.params.movieId.toString()
  let regionId = movieId + "-" + BigInt.fromI32(event.params.region).toString()
  let region = RevenuePerMovieRegion.load(regionId)
  // assume that entity exists already,
  // as distribution would not be possible witouth revenue first
  region.unclaimed = region.unclaimed - event.params.amount
  region.save()
}

export function handleRefund(event: Refund): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let movieId = event.params.movieId.toString()
  let regionId = movieId + "-" + BigInt.fromI32(event.params.region).toString()
  let movie = RevenuePerMovie.load(movieId)
  let region = RevenuePerMovieRegion.load(regionId)
  // assume that entity exists already,
  // as refund would not be possible witouth revenue first
  let value = event.transaction.value
  region.unclaimed = region.unclaimed - value
  region.save()
}