import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from 'graphql'
import { getRewardsData } from './fetcher'

const OLDEST_PRICE_DATE = '2021-07-01'

const poktRewardsSchema = buildSchema(`
  type Query {
    poktRewards(dateFrom: String!, dateTo: String!): [PoktRewards!]
  }

  type PoktRewards {
      nodeRewards: Float!
      daoRewards: Float!
      validatorRewards: Float!
      timestamp: Int!
  }
`)

const root = {
  poktRewards: async (args) => {
    const { dateFrom, dateTo } = args

    const parsedFromDate = new Date(dateFrom)
    const parsedOldestPriceDate = new Date(OLDEST_PRICE_DATE)

    if (parsedFromDate.getTime() < parsedOldestPriceDate.getTime()) {
      return new Error(`You cannot query dates before ${OLDEST_PRICE_DATE}.`)
    }

    return await getRewardsData(dateFrom, dateTo)
  },
}

var app = express()
app.use(
  '/graphql',
  graphqlHTTP({
    schema: poktRewardsSchema,
    rootValue: root,
    graphiql: true,
  })
)

app.listen(4000)

console.log('Running a GraphQL API server at http://localhost:4000/graphql')
