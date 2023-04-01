import Meta from "@/www/components/Meta";
import WebsiteLayout from "@/www/layouts/WebsiteLayout";

const meta = {
  title: "",
  description: ``,
  keywords: ``,
  url: "/",
};

const Page = () => {
  return (
    <WebsiteLayout>
      <Meta {...meta} />
    </WebsiteLayout>
  );
};

export default Page;
