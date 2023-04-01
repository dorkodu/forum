import { Container } from "@mantine/core";

import { FooterBlock as Footer } from "@/www/components/Footer/FooterBlock";
import { HeaderWithMegaMenu as Header } from "@/www/components/Header/HeaderWithMegaMenu";

const WebsiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main>
        <Container>{children}</Container>
      </main>
      <Footer />
    </>
  );
};

export default WebsiteLayout;
