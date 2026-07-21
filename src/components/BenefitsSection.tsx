import React from "react";
import { Shield, FlameKindling, Heart, Eye, Sparkles, Activity } from "lucide-react";
import { BENEFITS } from "../data";
import { motion } from "motion/react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Shield: Shield,
  FlameKindling: FlameKindling,
  Heart: Heart,
  Eye: Eye,
  Sparkles: Sparkles,
  Activity: Activity,
};

export default function BenefitsSection() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      id="persimmon-benefits-section" 
      className="py-16 px-4 bg-lime-50 rounded-3xl border border-lime-100 shadow-sm max-w-6xl mx-auto my-12"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="bg-lime-200 text-lime-800 text-sm font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
          অসাধারণ পুষ্টিগুণ
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-4 leading-tight">
          জাপানিজ ফুইয়ু জাতের <span className="text-emerald-700">পার্সিমন ফলের উপকারিতা</span>
        </h2>
        <p className="text-slate-600 mt-3 text-lg">
          পার্সিমন ফলটি কেবল সুস্বাদুই নয়, বরং এতে লুকিয়ে আছে অসাধারণ রোগ প্রতিরোধক ও পুষ্টিগুণ। নিয়মিত পার্সিমন খেলে যে উপকারগুলো পাবেন:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BENEFITS.map((benefit, index) => {
          const IconComponent = iconMap[benefit.iconName] || Shield;
          return (
            <motion.div
              key={benefit.id}
              id={`benefit-${benefit.id}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-start"
            >
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl mb-4 shadow-inner">
                <IconComponent className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 leading-snug">
                {benefit.title}
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
