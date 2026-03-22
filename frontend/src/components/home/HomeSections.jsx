import { Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { categories, reviews } from "../../data/products";
import { useStore } from "../../context/StoreContext";
import ProductCard from "../product/ProductCard";

function Section({ title, eyebrow, children }) {
  return (
    <section className="container-shell py-6 sm:py-10 md:py-14">
      <div className="mb-4 sm:mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-clay">{eyebrow}</p>
          <h2 className="section-title mt-1 sm:mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function HomeSections() {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);
  const bestSellers = products.slice(2, 5);

  return (
    <>
      <Section title="Trending Accessories" eyebrow="New season">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </Section>

      <Section title="Shop by Category" eyebrow="Signature assortment">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category}
              to={`/category/${encodeURIComponent(category)}`}
              className="glass-panel flex min-h-36 flex-col justify-between p-5 transition hover:-translate-y-1"
            >
              <span className="text-sm uppercase tracking-[0.18em] text-clay">0{index + 1}</span>
              <span className="font-display text-3xl text-wine dark:text-pearl">{category}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Best Sellers" eyebrow="Loved by customers">
        <div className="grid gap-6 md:grid-cols-3">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </Section>

      <Section title="Customer Reviews" eyebrow="Proof of delight">
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="glass-panel p-6">
              <p className="text-base leading-7 text-ink/75 dark:text-pearl/75">"{review.text}"</p>
              <p className="mt-4 font-semibold text-wine dark:text-pearl">{review.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Instagram Feed" eyebrow="Styled in the wild">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            "photo-1524504388940-b1c1722653e1",
            "photo-1515886657613-9f3515b0c78f",
            "photo-1487412720507-e7ab37603c6f",
            "photo-1506634572416-48cdfe530110"
          ].map((id) => (
            <a
              key={id}
              href="https://instagram.com"
              className="glass-panel overflow-hidden"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`}
                alt="Instagram inspiration"
                loading="lazy"
                className="h-60 w-full object-cover"
              />
            </a>
          ))}
        </div>
      </Section>

      <section className="container-shell py-10 md:py-14">
        <div className="glass-panel grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-clay">Newsletter</p>
            <h2 className="section-title mt-2">Join the inner circle for early drops.</h2>
            <p className="mt-3 max-w-2xl text-ink/70 dark:text-pearl/70">
              Receive launch alerts, gifting edits, styling notes, and members-only offers.
            </p>
          </div>
          <form className="flex flex-col gap-3 md:flex-row">
            <div className="glass-panel flex items-center gap-3 px-4 py-3">
              <Mail className="h-4 w-4 text-clay" />
              <input className="bg-transparent outline-none" placeholder="Enter your email" />
            </div>
            <button className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}
