// Quando uma página é dinâmica, ela é de UM post e não de uma rota "/post"
// Para isso criamos um arquivo com colchetes

import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";
import styles from "../post.module.scss";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
            // O dangerouslySetInnerHTML é perigoso, pois estamos setando o innerHTML direto.
            // Nesse caso ele foi usado, pois o post.content retorna tags HTML, ou seja,
            // o React reconhece que o elemento especifcado é dinâmico, porém não reconhece os seus filhos.
            // É importante ficar atento com script maliciosos devido a vunerabilidade
            // Utilizar o DOMPurify que é um desinfetante de script maliciosos
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

// A função ela gera uma página estática no primeiro acesso.
export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [], // Quais caminhos serão gerados durante a Build, porém aqui está vazio então todos post serão gerados caso o usuário faça o primeiro acesso
    fallback: "blocking", // Ele tem o true, false e blocking. Cada um ligado em relação a carregar o conteúdos de uma página.
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  // O "getByUID" é para buscar um documento a partir do slug dele
  const response = await prismic.getByUID("post", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
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
    redirect: 60 * 60, // 30 minutos
  };
};
