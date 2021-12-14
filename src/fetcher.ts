import axios from 'axios'

import {
  PRICE_ENDPOINT,
  POKTSCAN_DATA_URL,
  POKT_PER_RELAY,
  NODE_REWARD_SHARE,
  VALIDATOR_REWARD_SHARE,
  DAO_REWARD_SHARE,
} from './constants'

import { PriceEntry, RewardsData } from './types'

export const getRewardsData = async (dateFrom: string, dateTo: string) => {
  let rewardsData: RewardsData[] = []

  try {
    const response = await axios.post(POKTSCAN_DATA_URL, {
      from: dateFrom,
      to: dateTo,
      debug: true,
    })

    const poktPrices: PriceEntry[] = await getPrices(dateFrom, dateTo)

    const [{ blocks }] = response.data

    for (const i in blocks) {
      // Blockchain Data
      const parsedDate = new Date(blocks[i].time)
      const unixTimestap = Math.floor(parsedDate.getTime() / 1000)
      const baseBlockReward = blocks[i].total_relays_completed * POKT_PER_RELAY

      // Pricing Data
      const dateISO = formatDate(parsedDate)

      // Map each price with its corresponding day data
      const { price: poktPrice } = poktPrices.find((x) => x.created_date === dateISO)

      rewardsData.push({
        nodeRewards: baseBlockReward * NODE_REWARD_SHARE * poktPrice,
        daoRewards: baseBlockReward * DAO_REWARD_SHARE * poktPrice,
        validatorRewards: baseBlockReward * VALIDATOR_REWARD_SHARE * poktPrice,
        timestamp: unixTimestap,
      } as RewardsData)
    }

    return rewardsData
  } catch (e) {
    console.error(e)
  }
}

const getPrices = async (dateFrom: string, dateTo: string): Promise<PriceEntry[]> => {
  try {
    const { data: response } = await axios.get(PRICE_ENDPOINT, {
      params: { date_from: dateFrom, date_to: dateTo },
    })

    const prices = response.data

    if (!prices) {
      return []
    }

    return prices
  } catch (e) {
    console.error(e)
  }
}

const formatDate = (date: Date): string => {
  return date.toISOString().slice(0, 10)
}
