import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Heart, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const CONDITIONS = [
  { name: 'Acne', emoji: '😣', color: 'from-orange-500/20 to-yellow-500/10', border: 'border-orange-500/20', desc: 'A common skin condition that occurs when hair follicles become plugged with oil and dead skin cells.' },
  { name: 'Eczema', emoji: '🔴', color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/20', desc: 'A condition that makes your skin red and itchy. Common in children but can occur at any age.' },
  { name: 'Psoriasis', emoji: '🌿', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', desc: 'A skin disease that causes red, itchy scaly patches, most commonly on the knees, elbows, trunk and scalp.' },
  { name: 'Ringworm', emoji: '⭕', color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/20', desc: 'A contagious itching skin disease occurring in small circular patches, caused by any of a number of fungi.' },
  { name: 'Melanoma', emoji: '⚠️', color: 'from-red-500/20 to-pink-500/10', border: 'border-red-500/20', desc: 'The most serious type of skin cancer, develops in the cells (melanocytes) that produce melanin.' },
  { name: 'Vitiligo', emoji: '✨', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', desc: 'A disease that causes loss of skin color in blotches.' },
  { name: 'Warts', emoji: '🦠', color: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/20', desc: 'Small fleshy bumps on the skin or mucous membranes caused by human papillomavirus (HPV).' },
  { name: 'Impetigo', emoji: '🔶', color: 'from-red-500/20 to-orange-500/10', border: 'border-red-500/20', desc: 'A highly contagious skin infection that causes red sores on the face.' },
];

const ALLERGIES = [
  { name: 'Food Allergy', emoji: '🍽️', desc: 'Reaction to specific proteins in food. Common triggers: nuts, shellfish, dairy.' },
  { name: 'Skin Allergy', emoji: '👤', desc: 'Contact dermatitis or hives from substances like latex, nickel, or fragrances.' },
  { name: 'Dust Allergy', emoji: '💨', desc: 'Reaction to microscopic dust mites living in household dust and fabrics.' },
  { name: 'Drug Allergy', emoji: '💊', desc: 'Abnormal immune reaction to medications like penicillin or aspirin.' },
  { name: 'Pollen Allergy', emoji: '🌿', desc: 'Often called Hay Fever; reaction to airborne pollen from trees and grasses.' },
];

const HYGIENE_PROTOCOL = [
  'Sterilize clinical equipment and personal items.',
  'Avoid direct contact with suspected contagious patches.',
  'Apply non-comedogenic hydration barriers.',
  'Utilize mineral-based photo protection (SPF 30+).',
  'Maintain a neutral pH environment for skin recovery.',
  'Monitor symptoms daily and record changes for analysis.',
];

const CRITICAL_MARKERS = [
  { name: 'Acute Inflammation', desc: 'Persistent heat or rapid localized swelling.' },
  { name: 'Systemic Distress', desc: 'Onset of fever or significant chills.' },
  { name: 'Expansion Rate', desc: 'Conditions spreading faster than 2cm/day.' },
  { name: 'Dyspnea', desc: 'Difficulty breathing (Emergency Response required).' },
];

const FAQS = [
  {
    q: 'How accurate is the AI classification?',
    a: 'Our models are trained on large dermatological datasets (HAM10000) and aim for 85%+ accuracy. However, AI can misinterpret shadows or lighting. Always verify with a doctor.',
  },
  {
    q: 'What type of images work best?',
    a: 'Use well-lit, clear images taken from about 10-15cm away. Avoid using flash directly on reflective skin surfaces if possible.',
  },
  {
    q: 'Can I use it for emergencies?',
    a: 'No. In case of severe allergic reactions (Anaphylaxis) or rapid swelling, seek emergency medical care immediately.',
  },
  {
    q: 'Is my data secure?',
    a: 'Images are processed for analysis and not stored permanently in a public database. We prioritize your privacy and medical confidentiality.',
  },
];

const InfoPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-1">Knowledge Base</div>
        <h1 className="text-3xl font-bold text-white mb-2">Health Library</h1>
        <p className="text-slate-400 text-sm">Condition overview, hygiene protocols, and diagnostic indicators.</p>
      </div>

      {/* Supported Skin Conditions */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          Supported Skin Conditions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONDITIONS.map((cond) => (
            <div
              key={cond.name}
              className={`bg-gradient-to-br ${cond.color} border ${cond.border} rounded-xl p-4 card-hover cursor-pointer`}
            >
              <div className="text-2xl mb-2">{cond.emoji}</div>
              <div className="text-sm font-semibold text-white mb-1">{cond.name}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{cond.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Allergy Classifications */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-purple-400">⚡</span>
          Allergy Classifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ALLERGIES.map((allergy) => (
            <div key={allergy.name} className="glass rounded-xl p-4 border border-white/5 card-hover">
              <div className="text-2xl mb-2">{allergy.emoji}</div>
              <div className="text-sm font-semibold text-white mb-1">{allergy.name}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{allergy.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hygiene Protocol & Critical Markers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <section className="glass rounded-2xl p-5 border border-emerald-500/15">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Hygiene Protocol
          </h2>
          <ul className="space-y-2.5">
            {HYGIENE_PROTOCOL.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass rounded-2xl p-5 border border-red-500/15">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Critical Markers
          </h2>
          <p className="text-[10px] text-red-400/70 font-semibold uppercase tracking-widest mb-4">
            Consult a Medical Professional If You Observe:
          </p>
          <div className="space-y-3">
            {CRITICAL_MARKERS.map((marker) => (
              <div key={marker.name} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5">{marker.name}</div>
                <div className="text-xs text-red-400/80">{marker.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FAQ */}
      <section>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="glass rounded-xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-start justify-between p-4 text-left hover:bg-white/3 transition-colors"
              >
                <span className="text-sm font-semibold text-white pr-3">{faq.q}</span>
                {openFaq === idx
                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                }
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InfoPage;
