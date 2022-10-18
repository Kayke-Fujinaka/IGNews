// Quando uma página é dinâmica, ela é de UM post e não de uma rota "/post"
// Para isso criamos um arquivo com colchetes

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";
import styles from "./post.module.scss";

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
            // O dangerouslySetInnerHTML é perigoso, pois estamos setando o innerHTML direto.
            // Nesse caso ele foi usado, pois o post.content retorna tags HTML, ou seja,
            // o React reconhece que o elemento especifcado é dinâmico, porém não reconhece os seus filhos.
            // É importante ficar atento com script maliciosos devido a vunerabilidade
            // Utilizar o DOMPurify que é um desinfetante de script maliciosos
          />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const session = await getSession({ req });

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    }
  }

  const { slug } = params;
  const prismic = getPrismicClient(req);
  // O "getByUID" é para buscar um documento a partir do slug dele
  const response = await prismic.getByUID("post", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      // Vai ser o dia da publicação do post
      "pt-BR",
      {
        day: "2-digit", // A data vai aparecer com dois digitos
        month: "long", // O mês vai aparecer inteiro e por extenso
        year: "numeric", // O ano vai aparecer como numerico
      }
    ),
  };

  return {
    props: {
      post,
    },
  };
};
