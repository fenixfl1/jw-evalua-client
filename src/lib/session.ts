import Cookies from 'js-cookie'
import moment from 'moment'

const COOKIE_KEY_USER_NAME = 'appUsername'
const COOKIE_KEY_USER_DATA = 'appUserData'
const COOKIE_KEY_SESSION_TOKEN = 'appSession'

export const isLoggedIn = (): boolean => {
  const requiredCookiesKeys = [COOKIE_KEY_SESSION_TOKEN, COOKIE_KEY_USER_DATA]

  return !requiredCookiesKeys.some(
    (cookieKey) => Cookies.get(cookieKey) === undefined
  )
}

export type UserData = {
  username: string
  userId: string
  name: string
  avatar: string
  sessionCookie: {
    token: string
    expiration: string
  }
}

export const createSession = async (user: UserData): Promise<void> => {
  const { username, sessionCookie, userId, avatar } = user
  const { token: sessionToken, expiration: sessionExpiration } = sessionCookie
  const expires = new Date(sessionExpiration)
  const sessionInfo = JSON.stringify({
    username,
    userId,
  })

  sessionStorage.setItem('avatar', avatar)

  Cookies.set(COOKIE_KEY_USER_DATA, sessionInfo, { expires })
  Cookies.set(COOKIE_KEY_SESSION_TOKEN, sessionToken, { expires })
  Cookies.set(COOKIE_KEY_USER_NAME, username, {
    expires: new Date(moment(expires).add(-1, 'minutes').toISOString()),
  })
}

export const removeSession = (): void => {
  const requiredCookiesKeys = [
    COOKIE_KEY_SESSION_TOKEN,
    COOKIE_KEY_USER_DATA,
    COOKIE_KEY_USER_NAME,
  ]

  sessionStorage.removeItem('avatar')
  requiredCookiesKeys.forEach((cookieKey) => Cookies.remove(cookieKey))
}

/**@description obtiene los datos de la sesión del usuario actualmente conectado */
export const getSessionInfo = (): UserData => {
  if (!isLoggedIn()) {
    return <UserData>{}
  }

  const avatar = sessionStorage.getItem('avatar') || ''
  const userData = JSON.parse(Cookies.get(COOKIE_KEY_USER_DATA))
  return {
    ...userData,
    avatar,
  }
}

export const getSessionToken = (): string => {
  return Cookies.get(COOKIE_KEY_SESSION_TOKEN) || ''
}
