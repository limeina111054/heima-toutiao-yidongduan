import request from '@/utils/request'

export const getArticles = (channelID, timestamp) => {
  return request('app/v1_1/articles', 'get', {
    channel_id: channelID,
    timestamp,
    with_top: 1
  })
}
