import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="container-shell grid items-center gap-6 py-8 sm:gap-8 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-20">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-7">
        <span className="inline-flex rounded-full border border-clay/20 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-clay dark:bg-white/5 sm:px-4 sm:py-2">
          Premium Accessories House
        </span>
        <div className="space-y-2 sm:space-y-4">
          <h1 className="font-display text-3xl font-semibold leading-none text-wine dark:text-pearl sm:text-4xl md:text-5xl lg:text-7xl">
            Accessories that feel editorial, giftable, and timeless.
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-ink/70 dark:text-pearl/70 md:text-lg">
            Discover curated jewelry, charms, hampers, and keepsakes designed with a softer luxury language.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link to="/category/Earrings" className="btn-primary text-xs sm:text-sm">
            Shop the drop <ArrowRight className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
          </Link>
          <Link to="/category/Gift%20Hampers" className="btn-secondary text-xs sm:text-sm">
            Explore gifting
          </Link>
        </div>
        <div className="grid max-w-xl grid-cols-3 gap-2 pt-3 sm:gap-4 sm:pt-4">
          {[
            ["15k+", "Orders delivered"],
            ["4.9/5", "Average rating"],
            ["48h", "Dispatch promise"]
          ].map(([value, label]) => (
            <div key={label} className="glass-panel p-2 sm:p-4">
              <p className="font-display text-lg sm:text-3xl text-wine dark:text-pearl">{value}</p>
              <p className="text-xs sm:text-sm text-ink/60 dark:text-pearl/60">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative hidden sm:block"
      >
        <div className="glass-panel overflow-hidden p-3 sm:p-4">
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80"
            alt="Premium accessories"
            className="h-64 sm:h-80 md:h-96 lg:h-[520px] w-full rounded-[24px] object-cover"
          />
        </div>
        <div className="glass-panel absolute -bottom-4 left-3 max-w-xs p-3 sm:-bottom-6 sm:left-6 sm:p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Spring Edit</p>
          <p className="mt-1.5 font-display text-lg sm:mt-2 sm:text-2xl text-wine dark:text-pearl">
            Modern silhouettes with pearlescent, blush, and gold notes.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
