import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Everything that isn't a day-to-day tool (those live on the Dashboard
// tiles) or the Home link lives in the navbar instead — the footer is
// just the Help banner (the one thing new users most need to find
// quickly) and the tagline.
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

        <p className="text-center text-sm font-semibold text-black">
          VLQ — Learn at the Speed of Sight
        </p>
      </div>
    </footer>
  );
}
