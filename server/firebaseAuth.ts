import type { RequestHandler } from "express";

export const verifyFirebaseToken: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const token = authHeader.split("Bearer ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString());
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return res.status(401).json({ message: "Token expired" });
    }
    
    (req as any).user = {
      uid: payload.user_id || payload.sub,
      email: payload.email,
      name: payload.name,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
