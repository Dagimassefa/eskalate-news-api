import { signJwt } from '../../utils/jwt'
export function makeAuthorToken(userId = 'a1') {
	return signJwt({ sub: userId, role: 'author' })
}

export function makeReaderToken(userId = 'r1') {
	return signJwt({ sub: userId, role: 'reader' })
}
