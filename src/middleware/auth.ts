import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/src/utils/auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    iat?: number;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const token = extractTokenFromHeader(
        req.headers.get("authorization") ?? undefined
      );

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            message: "No token provided",
          },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired token",
          },
          { status: 401 }
        );
      }

      (req as AuthenticatedRequest).user = decoded;
      return handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }
  };
}
