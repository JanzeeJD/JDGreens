import jwt from 'jsonwebtoken';

export function createMagicLink(baseURL, userId) {
  // Set the payload with userId
  const payload = {
    userId,
  };

  // todo: Put the secret in process.env
  // Sign the payload with a secret key, add expiration time, and create the JWT token
  const token = jwt.sign(payload, process.env.MAGICLINK_SECRET_KEY, { expiresIn: '5m' });

  // Construct the magic link by appending the token to the baseURL
  const magicLink = `${baseURL}/${token}`;

  return magicLink;
}

export function verifyMagicLink(token) {
  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.MAGICLINK_SECRET_KEY);
    return decoded.userId;

  } catch (error) {
    return null;
  }
}