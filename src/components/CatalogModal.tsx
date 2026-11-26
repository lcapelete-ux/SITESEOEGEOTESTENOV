import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Ruler, Weight, ChevronRight } from "lucide-react";

import { catalogData } from "../catalogData";


interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CatalogModal({ isOpen, onClose }: CatalogModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 bg-[#183e26] text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <Ruler className="text-[#A1C913]" /> Catálogo de Medidas
                </h2>
                <p className="text-brand-200 text-sm mt-1">Consulte os pesos e dimensões padrão de nossos produtos</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {catalogData.map((category, idx) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                      <div className="w-2 h-6 bg-[#A1C913] rounded-full" />
                      <h3 className="text-xl font-bold text-stone-900">{category.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex justify-between items-center p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-stone-700 font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-sm">
                            <Weight className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{item.weight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Note */}
              <div className="mt-12 p-6 bg-brand-50 rounded-2xl border border-brand-100">
                <h4 className="font-bold text-brand-800 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Observações Importantes
                </h4>
                <ul className="text-sm text-brand-700 space-y-2">
                  <li>• O diâmetro é medido na PONTA de cada peça, sendo a BASE naturalmente mais grossa.</li>
                  <li>• Pesos são aproximados e podem variar conforme a umidade da madeira.</li>
                  <li>• Madeira de Eucalipto Citriodora tratada em autoclave com CCA.</li>
                  <li>• Padrões de qualidade seguindo as normas ABNT e NBR 9480.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#183e26] text-white rounded-full font-bold hover:bg-[#122e1c] transition-colors shadow-lg"
              >
                Fechar Catálogo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { ShieldCheck } from "lucide-react";
