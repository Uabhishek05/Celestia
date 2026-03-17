import { Helmet } from "react-helmet-async";

export default function Seo({ title, description }) {
  return (
    <Helmet>
      <title>{title ? `${title} | Celestia Premium` : "Celestia Premium"}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}
