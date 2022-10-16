import { GetStaticProps } from "next";
import Head from "next/head";
import { getPrismicClient } from "../../services/prismic";
import { RichText } from "prismic-dom";
import styles from "./styles.module.scss";
import Link from "next/link";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};
interface PostsProps {
  posts: Post[];
}

type ExcerptContent = {
  start: number;
  end: number;
  type: string;
};

interface ExcerptContentProps {
  type: string;
  text: string;
  spans: ExcerptContent[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link href={`/posts/${post.slug}`}>
              <a key={post.slug}>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // O "getByType" aceita o ID da API e permite passar um objeto de parâmetros opcionais
  // Ele consultará o seu repositório do Prismic e retornará uma promessa com as respostas da API
  const response = await prismic.getByType("post", {
    fetch: ["post.title", "post.content"], // Quais os dados que quero buscar do "post"
    pageSize: 100, // Quantos post deseja trazer. Ele serve como uma páginação que funciona como performace
  });

  // Sempre faça a formatação dos dados logo depois que você consumir os dados da API externa

  // Mapeando cada um dos posts
  const posts = response.results.map((post) => {
    return {
      slug: post.uid, // Vai ser a URL do post
      title: RichText.asText(post.data.title), // Vai ser o título do post
      // Vai ser o resumo do post
      excerpt:
        post.data.content.find(
          (content: ExcerptContentProps) => content.type === "paragraph"
        )?.text ?? "",
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        // Vai ser o dia da publicação do post
        "pt-BR",
        {
          day: "2-digit", // A data vai aparecer com dois digitos
          month: "long", // O mês vai aparecer inteiro e por extenso
          year: "numeric", // O ano vai aparecer como numerico
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
