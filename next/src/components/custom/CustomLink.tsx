import Link from 'next/link'
import { useRouter } from 'next/router';

interface Props {
  children?: React.ReactNode;
  href: string;
  locale?: string;
}

function CustomLink({ children, href, locale }: Props) {
  const { locale: routerLocale } = useRouter();

  return (
    <Link
      href={href}
      locale={locale || routerLocale}
      style={{ textDecoration: "none" }}
    >
      {children}
    </Link>
  )
}

export default CustomLink