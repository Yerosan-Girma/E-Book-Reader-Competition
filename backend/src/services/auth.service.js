const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repo');

const sign = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async ({ username, email, password, displayName }) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (await userRepo.findByEmail(normalizedEmail)) {
    const e = new Error('Email already registered');
    e.status = 409;
    throw e;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await userRepo.create({
      username,
      email: normalizedEmail,
      passwordHash,
      displayName: displayName || username,
    });
  } catch (error) {
    if (error.code === '23505') {
      const conflict = new Error(
        error.constraint === 'users_username_key' ? 'Username already registered' : 'Email already registered'
      );
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  }
  return { user, token: sign(user) };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const e = new Error('Invalid email or password');
    e.status = 401;
    throw e;
  }
  const safe = {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    role: user.role,
  };
  return { user: safe, token: sign(safe) };
};

const loginWithGoogle = async ({ credential, code, redirectUri }) => {
  let googleUser = null;

  // Case 1: ID token credential (from Google Identity Services popup / One Tap)
  if (credential) {
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!tokenInfoRes.ok) {
      const errText = await tokenInfoRes.text();
      console.error('Google tokeninfo error:', errText);
      const err = new Error('Invalid Google credential token');
      err.status = 401;
      throw err;
    }
    const tokenInfo = await tokenInfoRes.json();

    // Verify audience matches configured Google Client ID
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && tokenInfo.aud !== expectedClientId) {
      console.error(`Token audience ${tokenInfo.aud} mismatch with ${expectedClientId}`);
      const err = new Error('Invalid Google credential token: audience mismatch');
      err.status = 401;
      throw err;
    }

    if (!tokenInfo.email) {
      const err = new Error('Google account must provide an email');
      err.status = 400;
      throw err;
    }

    googleUser = {
      googleId: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name || tokenInfo.given_name,
      picture: tokenInfo.picture,
    };
  } else if (code) {
    // Case 2: Authorization Code exchange
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri || 'postmessage',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange error:', errText);
      const err = new Error('Failed to exchange Google authorization code');
      err.status = 401;
      throw err;
    }

    const tokenData = await tokenRes.json();
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      const err = new Error('Failed to retrieve user info from Google');
      err.status = 401;
      throw err;
    }

    const userInfo = await userInfoRes.json();
    googleUser = {
      googleId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };
  } else {
    const err = new Error('Missing Google credential or authorization code');
    err.status = 400;
    throw err;
  }

  // Find or create the user in the database
  const user = await userRepo.findOrCreateGoogleUser(googleUser);

  const safe = {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    role: user.role,
  };

  return {
    user: safe,
    token: sign(safe),
    message: 'Google login successful',
  };
};

const me = async (id) => userRepo.findById(id);

module.exports = { register, login, loginWithGoogle, me };
