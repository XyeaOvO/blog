import type { Creator } from '../scripts/types/metadata'
import { getAvatarUrlByGithubName } from '../scripts/utils'

/** 文本 */
export const siteName = 'Xyea的知识库'
export const siteShortName = 'Xyea'
export const siteDescription = '记录回忆，知识和畅想的地方'

/** 文档所在目录 */
export const include = ['笔记', '生活']

/** Repo */
export const githubRepoLink = 'https://github.com/XyeaOvO/nolebase'
/** Discord */
export const discordLink = ''

/** 无协议前缀域名 */
export const plainTargetDomain = 'nolebase.ayaka.io'
/** 完整域名 */
export const targetDomain = `https://${plainTargetDomain}`

/** 创作者 */
export const creators: Creator[] = [
  {
    name: 'Xyea',
    avatar: '',
    username: 'XyeaOvO',
    title: '',
    desc: '热爱生活，热爱学习，热爱分享',
    links: [
      { type: 'github', icon: 'github', link: 'https://github.com/XyeaOvO' },
    ],
    nameAliases: ['Xyea', 'XyeaOvO'],
    emailAliases: ['xyeaovo@gmail.com'],
  },
].map<Creator>((c) => {
  c.avatar = c.avatar || getAvatarUrlByGithubName(c.username)
  return c as Creator
})

export const creatorNames = creators.map(c => c.name)
export const creatorUsernames = creators.map(c => c.username || '')
