import Link from 'next/link'
import { useRouter } from 'next/router';

interface Props {
  children?: React.ReactNode;
  href: string;
  locale?: string;
}

function CustomLink({ children, href, locale, ...props }: React.ComponentPropsWithoutRef<"a"> & Props) {
  const { locale: routerLocale } = useRouter();
  console.log(props)
  return (
    <Link
      href={href}
      locale={locale || routerLocale}
      style={{ textDecoration: "none" }}
      {...props}
    >
      {children}
    </Link>
  )
}

export default CustomLink