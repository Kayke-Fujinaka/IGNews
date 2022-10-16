import { useRouter } from "next/router";
import { ActiveLink } from "../ActiveLink";
import { SignInButton } from "../SignInButton";
import styles from "./styles.module.scss";

// O Next é uma ótima ferramenta para que você não precise ficar renderizando
// uma página toda vez que clicar em uma âncora.

// Por isso podemos utilizar o "Link" do next/link,
// a qual só devemos passa-lo em volta da âncora e passar o href

// Ele possui uma propriedade chamada prefetch que deixa
// uma página pré-recarregada para que o carregamento seja bem mais rápido.
// Ele deve ser usado em páginas que o usuário irá acessar bastante.

export function Header() {

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="Logo do ig.news" />
        <nav>
          <ActiveLink activeClassName={styles.active} href="/">
            <a>Home</a>
          </ActiveLink>
          <ActiveLink activeClassName={styles.active} href="/posts" prefetch>
            <a>Posts</a>
          </ActiveLink>
        </nav>

        <SignInButton />
      </div>
    </header>
  );
}
