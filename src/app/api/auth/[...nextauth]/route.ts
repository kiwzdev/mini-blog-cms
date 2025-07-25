import bcrypt from "bcryptjs";
import NextAuth, { User as AuthUser, Session } from "next-auth";
import { type SessionStrategy, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

// Extended types for our custom user properties
interface ExtendedUser extends AuthUser {
  id: string;
  email: string;
  username: string;
  image?: string;
  role: string;
  emailVerified: Date | null;
}

interface ExtendedToken extends JWT {
  id: string;
  email: string;
  username: string;
  image?: string;
  role: string;
  emailVerified: Date | null;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    username: string;
    image?: string;
    role: string;
    emailVerified: Date | null;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("User not found");
          }
          console.log(user);

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("INVALID_PASSWORD");
          }

          // Check if email is verified (optional - you can disable this check if needed)
          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          return {
            id: user._id.toString(),
            email: user.email.toLowerCase(),
            username: user.username.toLowerCase(),
            image: user.image || undefined,
            role: user.role || "user", // default role
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: ExtendedToken;
      user?: ExtendedUser | AdapterUser;
      trigger?: "signIn" | "signUp" | "update";
      session?: Session;
    }): Promise<ExtendedToken> {
      // if user is logged in add user properties to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.image = user.image;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      // When session is updated -> update token
      if (trigger === "update" && session?.user) {
        token.username = session.user.username ?? token.username;
        token.email = session.user.email ?? token.email;
        token.image = session.user.image ?? token.image;
        token.role = session.user.role ?? token.role;
        token.emailVerified = session.user.emailVerified ?? token.emailVerified;
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: ExtendedToken;
    }): Promise<ExtendedSession> {
      // add user properties to session
      session.user = {
        id: token.id,
        email: token.email!,
        username: token.username,
        image: token.image,
        role: token.role,
        emailVerified: token.emailVerified,
      };

      // send session to client
      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect to dashboard after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", {
        user: user.email,
        account: account?.provider,
        profile: profile,
      });
    },
    async signOut({ token }) {
      console.log("User signed out:", { user: token?.email });
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Export types for use in other files
export type { ExtendedUser, ExtendedToken, ExtendedSession };
