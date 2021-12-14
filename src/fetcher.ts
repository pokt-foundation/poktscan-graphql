import axios from 'axios'

import {
  PRICE_ENDPOINT,
  POKTSCAN_DATA_URL,
  POKT_PER_RELAY,
  NODE_REWARD_SHARE,
  VALIDATOR_REWARD_SHARE,
  DAO_REWARD_SHARE,
} from './constants'

import { RewardsData } from './types'

export const getRewardsData = async (dateFrom: string, dateTo: string) => {
  let rewardsData: RewardsData[] = []

  try {
    const response = await axios.post(POKTSCAN_DATA_URL, {
      from: dateFrom,
      to: dateTo,
      debug: true,
    })

    const [{ blocks }] = response.data

    for (const i in blocks) {
      // Blockchain Data
      const parsedDate = new Date(blocks[i].time)
      const unixTimestap = Math.floor(parsedDate.getTime() / 1000)
      const baseBlockReward = blocks[i].total_relays_completed * POKT_PER_RELAY

      // Pocket Pricing
      const dateISO = formatDate(parsedDate)
      const poktPrice = await getPrice(dateISO)

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

const getPrice = async (date: string): Promise<number> => {
  try {
    const { data: response } = await axios.get(PRICE_ENDPOINT, {
      params: { date_from: date, date_to: date },
    })

    const [{ price }] = response.data

    if (!price) {
      return 0
    }

    return price
  } catch (e) {
    console.error(e)
  }
}

const formatDate = (date: Date): string => {
  return date.toISOString().slice(0, 10)
}
