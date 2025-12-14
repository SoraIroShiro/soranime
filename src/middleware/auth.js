import jwt from 'jsonwebtoken';

export function verifyToken(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check both 'role' and 'isAdmin' for compatibility
    return decoded.role === 'admin' || decoded.isAdmin === true;
  } catch {
    return false;
  }
}

export function getTokenFromRequest(request) {
  return request.headers.get('authorization')?.replace('Bearer ', '');
}