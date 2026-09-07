import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, GraduationCap, Building2, ArrowRight, CreditCard } from 'lucide-react';

// ============================================================
// PLANS — pricing/plan overview. No billing provider is wired up
// yet, so "Get Started" and "Start Free Trial" route into the
// existing sign-up flow (a real, working action today), and
// "Contact Us" is left as an inert placeholder button. Swap that
// TODO, and the two register links, for real checkout / a payment
// provider (Stripe, etc.) once billing is built — nothing else on
// this page, or in the rest of the app, needs to change to support
// that later.
//
// The Pro plan gets a Monthly/Yearly toggle — $5.99/month, with
// the yearly figure computed straight from that (no discount is
// applied since none has been decided yet; swap PRO_PRICE_YEARLY
// for a real annual price once one exists).
// ============================================================

const PRO_PRICE_MONTHLY = 5.99;
const PRO_PRICE_YEARLY = Math.round(PRO_PRICE_MONTHLY * 12 * 100) / 100;

const SIMPLE_PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    audience: 'For individual learners',
    icon: Sparkles,
    price: '$0',
    priceNote: 'forever',
    tint: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-slate-200',
    features: [
      'AMIVI visual lessons & AMICO comics',
      'Limited quizzes per month',
      'Basic Library access',
    ],
    cta: { label: 'Get Started', to: '/register' },
    ctaStyle: 'bg-slate-900 text-white hover:bg-slate-800',
  },
  {
    key: 'institution',
    name: 'Institution',
    audience: 'For schools & organizations',
    icon: Building2,
    price: 'Custom',
    priceNote: null,
    tint: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-slate-200',
    features: [
      'Multi-user & classroom management',
      'Advanced analytics & reporting',
      'Custom content & branding',
      'Dedicated support',
    ],
    // No contact flow exists yet — inert on purpose (see file header).
    cta: { label: 'Contact Us' },
    ctaStyle: 'bg-white text-slate-800 border-2 border-slate-200 hover:bg-slate-50',
  },
];

const PRO_FEATURES = [
  'Unlimited AI-generated quizzes — no monthly cap',
  'Unlimited AMIVI visual lessons from any material',
  'Unlimited AMICO comic creation',
  'Assign, collect and grade Homework through Classroom',
  'Run live Collaboration study rooms',
  'Full Quiz Decks library + Wrong Answers bank',
  'Progress tracking & analytics for every student',
  'Priority support',
];

function SimplePlanCard({ plan }) {
  const Icon = plan.icon;

  return (
    <div className={`relative rounded-2xl bg-white border-2 ${plan.border} shadow-sm p-8 flex flex-col`}>
      <div className={`w-12 h-12 rounded-xl ${plan.tint} flex items-center justify-center mb-5`}>
        <Icon className={`w-6 h-6 ${plan.iconColor}`} />
      </div>

      <h3 className="font-extrabold text-xl text-slate-900 mb-1">{plan.name}</h3>
      <p className="text-slate-500 font-medium text-sm mb-6">{plan.audience}</p>

      <div className="flex items-baseline gap-1.5 mb-6">
        <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
        {plan.priceNote && <span className="text-slate-400 font-semibold text-sm">{plan.priceNote}</span>}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
            <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {plan.cta.to ? (
        <Link
          to={plan.cta.to}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${plan.ctaStyle}`}
        >
          {plan.cta.label} <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${plan.ctaStyle}`}
        >
          {plan.cta.label} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// The Pro plan is the spotlight: a wide, two-column card with a
// Monthly/Yearly billing toggle, a description + illustration on
// the left, and the price + full feature checklist on the right.
function ProPlanCard() {
  const [billing, setBilling] = useState('monthly');
  const isMonthly = billing === 'monthly';
  const price = isMonthly ? PRO_PRICE_MONTHLY : PRO_PRICE_YEARLY;

  return (
    <div className="relative rounded-2xl bg-white border-2 border-indigo-200 shadow-lg overflow-hidden">
      <span className="absolute top-5 right-5 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
        Most Popular
      </span>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: plan identity + illustration */}
        <div className="p-8 sm:p-10 bg-indigo-50/50 flex flex-col">
          <h3 className="font-extrabold text-2xl text-slate-900 mb-1">Pro</h3>
          <p className="text-slate-500 font-medium text-sm mb-5">For students & teachers</p>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-slate-200 self-start mb-6">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isMonthly ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !isMonthly ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Yearly
            </button>
          </div>

          <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8">
            Ideal for teachers and students who want unlimited AI-generated quizzes and visuals, homework
            tools, and classroom collaboration in one place.
          </p>

          <div className="mt-auto flex justify-center pt-2">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-indigo-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Right: price + features */}
        <div className="p-8 sm:p-10 flex flex-col">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-4xl font-extrabold text-slate-900">${price.toFixed(2)}</span>
            <span className="text-slate-400 font-semibold text-sm">/ {isMonthly ? 'month' : 'year'}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-6">
            {isMonthly ? 'Billed monthly.' : 'Billed annually.'} Pricing is illustrative — final pricing TBD.
          </p>

          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all hover:-translate-y-0.5"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Plans() {
  return (
    <div className="space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 bg-indigo-50 text-indigo-700 border border-indigo-100">
          <CreditCard className="w-3.5 h-3.5" /> Plans
        </div>
        <h1 className="font-extrabold leading-tight text-slate-900" style={{ fontSize: 'clamp(28px,3.4vw,42px)' }}>
          Scalable learning plans for all
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-500">
          Choose the plan that fits your needs.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <ProPlanCard />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto items-start">
        {SIMPLE_PLANS.map((plan) => (
          <SimplePlanCard key={plan.key} plan={plan} />
        ))}
      </div>
    </div>
  );
}
