import { create } from "domain";
import { query as QY } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = true
) {
  // Buscar o usuário no banco do FaunaDB com o ID {customerId}
  const userRef = await fauna.query(
    QY.Select(
      "ref",
      QY.Get(QY.Match(QY.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Salvar apenas alguns dados da subscription
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  } 

  // Salvar os dados da subscription no FaunaDB

  if (createAction) {
    await fauna.query(
      QY.Create (
        QY.Collection('subscriptions'),
        { data: subscriptionData }
      )
    )
  } else {
    await fauna.query(
      QY.Replace(
        QY.Select(
          "ref",
          QY.Get(
            QY.Match(
              QY.Index("subscription_by_id"),
              subscriptionId
            )
          )
        ),
        { data: subscriptionData }
      )
    )
  }
}
