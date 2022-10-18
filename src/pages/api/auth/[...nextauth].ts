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
    // Ele permite modificar os dados que tem no session
    async session({ session }) {
      try {
        // Identificar se o usuário possui uma inscrição ativa
        const userActiveSubscription = await fauna.query(
          QY.Get(
            QY.Intersection([
              QY.Match(
                QY.Index("subscription_by_user_ref"),
                QY.Select(
                  "ref",
                  QY.Get(
                    QY.Match(
                      QY.Index("user_by_email"),
                      QY.Casefold(session.user.email)
                    )
                  )
                )
              ),
              QY.Match(QY.Index("subscription_by_status"), "active"),
            ])
          )
        );
        return {
          ...session,
          activeSubscription: userActiveSubscription,
          expires: "never",
        };
      } catch (err) {
        console.log(err);
        return {
          ...session,
          activeSubscription: null,
          expires: "never",
        };
      }
    },

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
  secret: process.env.NEXT_NO_SECRET,
});
