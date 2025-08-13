import bcrypt from "bcryptjs";
import NextAuth, { User, Session } from "next-auth";
import { type SessionStrategy, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { JWT } from "next-auth/jwt";
import { Adapter, AdapterUser } from "next-auth/adapters";
import { nanoid } from "nanoid";
import prisma from "@/lib/db";

// Custom adapter that ensures username is set
function CustomPrismaAdapter(p: typeof prisma): Adapter {
  const baseAdapter = PrismaAdapter(p) as Adapter;

  return {
    ...baseAdapter,
    async createUser(data: AdapterUser) {
      // Ensure username is set when creating user
      const userData = {
        id: data.id,
        name: data.name ?? "",
        email: data.email,
        emailVerified: data.emailVerified,
        username: `user-${nanoid(6).toLowerCase()}`, // Generate username
        profileImage: data.image, // Map image to profileImage
      };

      return p.user.create({ data: userData });
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
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

      async authorize(credentials): Promise<User | null> {
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
          if (!user.password) {
            throw new Error("Password not found");
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
            id: user.id.toString(),
            email: user.email.toLowerCase(),
            username: user.username ? user.username.toLowerCase() : "",
            profileImage: user.profileImage || undefined,
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
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User | AdapterUser;
      trigger?: "signIn" | "signUp" | "update";
      session?: Session;
    }): Promise<JWT> {
      // if user is logged in add user properties to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.profileImage = user.profileImage || undefined;
        token.role = user.role;
        token.emailVerified = user.emailVerified || undefined;
      }

      // When session is updated -> update token
      if (trigger === "update" && session?.user) {
        token.username = session.user.username ?? token.username;
        token.email = session.user.email ?? token.email;
        token.profileImage = session.user.profileImage ?? token.profileImage;
        token.role = session.user.role ?? token.role;
        token.emailVerified = session.user.emailVerified ?? token.emailVerified;
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      // add user properties to session
      session.user = {
        id: token.id,
        email: token.email!,
        username: token.username,
        profileImage: token.profileImage,
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
