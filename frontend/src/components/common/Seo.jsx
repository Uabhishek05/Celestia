import { Helmet } from "react-helmet-async";
import { defaultDescription, siteName, toAbsoluteUrl } from "../../utils/siteMetadata";

export default function Seo({
  title,
  description = defaultDescription,
  path = "/",
  image,
  type = "website",
  noindex = false,
  structuredData
}) {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const canonicalUrl = toAbsoluteUrl(path);
  const imageUrl = image ? toAbsoluteUrl(image) : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      {structuredData ? (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      ) : null}
    </Helmet>
  );
}
