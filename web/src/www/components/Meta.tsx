import { FunctionComponent } from "react";
import { website } from "@/website";

interface MetaProps {
  title: string;
  url: string;
  description: string;
  keywords: string;
  image?: {
    src: string;
    alt: string;
  };
}

const Meta: FunctionComponent<MetaProps> = ({ title, description, url, keywords, image }) => {
  const URL = website.root + url;

  return (
    <>
      <title key="title">{title}</title>
      <meta name="title" content={description} key="meta:title" />
      <meta name="description" content={description} key="meta:description" />
      <meta name="keywords" content={keywords} key="meta:keywords" />

      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5" key="meta:viewport" />
      <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" key="meta:contentType" />
      <meta charSet="UTF-8" key="meta:charset" />

      <meta name="og:type" content="website" key="og:type" />
      <meta name="og:url" content={URL} key="og:url" />
      <meta name="og:title" content={title} key="og:title" />
      <meta name="og:description" content={description} key="og:description" />

      <meta name="twitter:card" content="summary" key="twitter:card" />
      <meta name="twitter:site" content={website.twitter.username} key="twitter:site" />
      <meta name="twitter:url" content={URL} key="twitter:url" />
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta name="twitter:description" content={description} key="twitter:description" />

      {image && (
        <>
          <meta name="twitter:image" content={image.src} key="twitter:image" />
          <meta name="twitter:image:alt" content={image.alt} key="twitter:image:alt" />
          <meta name="og:image" content={image.src} key="og:image" />
          <meta name="og:image:alt" content={image.alt} key="og:image:alt" />
        </>
      )}

      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" key="apple-touch-icon" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" key="icon:32" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" key="icon:16" />
      <link rel="manifest" href="/site.webmanifest" key="manifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg?v=2" color="#20df30" key="mask-icon" />
      <link rel="shortcut icon" href="/favicon.ico?v=2" key="shortcut icon" />
      <meta name="msapplication-TileColor" content="#20df30" key="msapplication-TileColor" />
      <meta name="msapplication-TileImage" content="/mstile-144x144.png?v=2" key="msapplication-TileImage" />
      <meta name="msapplication-config" content="/browserconfig.xml?v=2" key="msapplication-config" />
      <meta name="theme-color" content="#20df30" key="theme-color" />
    </>
  );
};

export default Meta;
