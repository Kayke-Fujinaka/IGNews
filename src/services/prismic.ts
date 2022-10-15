import * as prismic from '@prismicio/client'

export function getPrismicClient(req?: unknown) {
    const client = prismic.createClient(
        process.env.PRISMIC_ENDPOINT,
        {
            accessToken: process.env.PRISMIC_ACESS_TOKEN,
        }
    )

    client.enableAutoPreviewsFromReq(req);

    return client
}