import Hero from "../components/home/Hero";
import HomeSections from "../components/home/HomeSections";
import Seo from "../components/common/Seo";

export default function HomePage() {
  return (
    <>
      <Seo
        title="Premium Accessories"
        description="Shop premium earrings, necklaces, hampers, charms, and handcrafted gifting."
      />
      <Hero />
      <HomeSections />
    </>
  );
}
