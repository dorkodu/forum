import auth from "@/lib/api/controllers/auth";
import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";

export default function DorkoduID() { return <></> }

export const getServerSideProps: GetServerSideProps = async (props) => {
  const req = props.req as NextApiRequest;
  const res = props.res as NextApiResponse;

  const code = typeof props.query.code === "string" ? props.query.code : undefined;

  if (code) {
    const input: typeof auth.getAccessToken.arg = { code };
    await auth.getAccessToken.executor(input, { req, res, shared: {} });
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    }
  }
}