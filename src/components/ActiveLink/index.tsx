import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactElement, cloneElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement; // Quer receber apenas um elemento React. Vai ser a tag a.
  activeClassName: string;
}

export function ActiveLink({
  children,
  activeClassName,
  ...rest
}: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === rest.href ? activeClassName : "";

  // O cloneElement serve para manipular um elemento criando um clone a partir dele
  // O primeiro parâmetro é o elemento que você quer clonar
  // O segundo é uma propriedade que você quer passar para ele
  // O terceiro é um filho para esse elemento

  return <Link {...rest}>{cloneElement(children, { className })}</Link>;
}
