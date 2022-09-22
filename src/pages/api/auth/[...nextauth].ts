import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { query as QY } from "faunadb";

import { fauna } from "../../../services/fauna";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user;
      try {
        await fauna.query(
          QY.If(
            QY.Not(
              QY.Exists(
                QY.Match(QY.Index("user_by_email"), QY.Casefold(user.email))
              )
            ),
            QY.Create(QY.Collection("users"), { data: { email } }),
            QY.Get(QY.Match(QY.Index("user_by_email"), QY.Casefold(user.email)))
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },
});
