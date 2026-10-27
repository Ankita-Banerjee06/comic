import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Video,
  CreditCard,
  Lightbulb,
  Info,
  Sparkles,
  Compass,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Everything that isn't a day-to-day tool (those live on the Dashboard
// tiles) or the Home link lives down here instead of crowding the top
// navbar — it's still reachable from every page, just out of the way.
// Help gets its own banner above the plain link row since it's the
// one new users most need to find quickly.
const footerLinks = [
  {
    name: 'Introduction',
    path: '/introduction',
    icon: Info,
    description: 'Why VLQ exists and what makes it different.',
  },
  {
    name: 'Explore',
    path: '/explore',
    icon: Compass,
    description: "Browse the VLQ engines and jump back into anything you've made.",
  },
  {
    name: 'How We Do It',
    path: '/how-we-do-it',
    icon: Lightbulb,
    description: 'How VLQ actually works, step by step.',
  },
  {
    name: 'Core Ecosystems',
    path: '/core-ecosystems',
    icon: Sparkles,
    description: 'Meet AMIVI and AMICO — the two engines behind everything.',
  },
  {
    name: 'Essential Learning',
    path: '/courses',
    icon: GraduationCap,
    description: 'Guides and articles on getting the most out of VLQ.',
  },
  {
    name: 'Video Tutorials',
    path: '/tutorials',
    icon: Video,
    description: 'Short videos walking through every feature.',
  },
  {
    name: 'Plans',
    path: '/plans',
    icon: CreditCard,
    description: 'Compare plans and pricing.',
  },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white mt-10">
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Help — called out on its own so it isn't just another link
            in the row below. */}
        <Link
          to="/help"
          className="group flex items-center justify-between gap-4 flex-wrap bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white leading-tight">{t('New here? Get Help')}</p>
              <p className="text-sm font-semibold text-white/85">{t('A step-by-step map of where to go and what to do first.')}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-700 rounded-xl font-extrabold text-sm shadow-md group-hover:bg-indigo-50 transition-colors flex-shrink-0">
            {t('Open Help')} <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {footerLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="group flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-black group-hover:text-indigo-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-black group-hover:text-indigo-700 transition-colors">
                    {t(link.name)}
                  </p>
                  <p className="text-sm font-medium text-black mt-0.5">
                    {t(link.description)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-sm font-semibold text-black">
          VLQ — Learn at the Speed of Sight
        </p>
      </div>
    </footer>
  );
}
