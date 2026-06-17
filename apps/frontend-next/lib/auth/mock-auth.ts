interface MockUser {
  userId: number;
  username: string;
  password: string;
  nickname: string;
  avatar: string | null;
  roles: string[];
  perms: string[];
}

export interface MockUserInfo {
  userId: number;
  username: string;
  nickname: string;
  avatar: string | null;
  roles: string[];
  perms: string[];
}

export interface MockAuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

const mockUsers: Record<string, MockUser> = {
  admin: {
    userId: 1,
    username: 'admin',
    password: 'password',
    nickname: '管理者',
    avatar: null,
    roles: ['ADMIN'],
    perms: ['*'],
  },
  demo: {
    userId: 2,
    username: 'demo',
    password: 'demo123',
    nickname: 'Demo User',
    avatar: null,
    roles: ['ADMIN'],
    perms: ['*'],
  },
  user: {
    userId: 3,
    username: 'user',
    password: 'password',
    nickname: '一般ユーザー',
    avatar: null,
    roles: ['USER'],
    perms: ['product:read'],
  },
};

function toUserInfo(user: MockUser): MockUserInfo {
  return {
    userId: user.userId,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    roles: user.roles,
    perms: user.perms,
  };
}

export function isLocalMockAuthEnabled(): boolean {
  const backendUrl = process.env.BACKEND_URL;

  return (
    process.env.ENABLE_LOCAL_AUTH_MOCK === 'true' ||
    !backendUrl ||
    backendUrl.includes('localhost') ||
    backendUrl.includes('127.0.0.1')
  );
}

export function authenticateLocalMockUser(
  username: string,
  password: string
): MockAuthToken | null {
  if (!isLocalMockAuthEnabled()) {
    return null;
  }

  const user = mockUsers[username];
  if (!user || user.password !== password) {
    return null;
  }

  return {
    accessToken: `mock_token_${user.username}_${Date.now()}`,
    refreshToken: `mock_refresh_${user.username}`,
    tokenType: 'Bearer',
    expiresIn: 3600,
  };
}

export function getLocalMockUserFromToken(token: string): MockUserInfo | null {
  if (!isLocalMockAuthEnabled()) {
    return null;
  }

  const match = token.match(/^mock_token_([a-zA-Z0-9_-]+)_/);
  const username = match?.[1];
  if (!username) {
    return null;
  }

  const user = mockUsers[username];
  return user ? toUserInfo(user) : null;
}

export function refreshLocalMockToken(
  refreshToken: string
): MockAuthToken | null {
  if (!isLocalMockAuthEnabled() || !refreshToken.startsWith('mock_refresh_')) {
    return null;
  }

  const username = refreshToken.replace('mock_refresh_', '');
  const user = mockUsers[username];
  if (!user) {
    return null;
  }

  return {
    accessToken: `mock_token_${user.username}_${Date.now()}`,
    refreshToken: `mock_refresh_${user.username}`,
    tokenType: 'Bearer',
    expiresIn: 3600,
  };
}
