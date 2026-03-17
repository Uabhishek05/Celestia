import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="container-shell grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
        <span className="inline-flex rounded-full border border-clay/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay dark:bg-white/5">
          Premium Accessories House
        </span>
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-semibold leading-none text-wine dark:text-pearl md:text-7xl">
            Accessories that feel editorial, giftable, and timeless.
          </h1>
          <p className="max-w-xl text-base text-ink/70 dark:text-pearl/70 md:text-lg">
            Discover curated jewelry, charms, hampers, and keepsakes designed with a softer luxury language.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/category/Earrings" className="btn-primary">
            Shop the drop <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link to="/category/Gift%20Hampers" className="btn-secondary">
            Explore gifting
          </Link>
        </div>
        <div className="grid max-w-xl grid-cols-3 gap-4 pt-4">
          {[
            ["15k+", "Orders delivered"],
            ["4.9/5", "Average rating"],
            ["48h", "Dispatch promise"]
          ].map(([value, label]) => (
            <div key={label} className="glass-panel p-4">
              <p className="font-display text-3xl text-wine dark:text-pearl">{value}</p>
              <p className="text-sm text-ink/60 dark:text-pearl/60">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="glass-panel overflow-hidden p-4">
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80"
            alt="Premium accessories"
            className="h-[520px] w-full rounded-[24px] object-cover"
          />
        </div>
        <div className="glass-panel absolute -bottom-6 left-6 max-w-xs p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Spring Edit</p>
          <p className="mt-2 font-display text-2xl text-wine dark:text-pearl">
            Modern silhouettes with pearlescent, blush, and gold notes.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
