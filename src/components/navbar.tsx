import * as React from "react";
import { Link, useI18next } from "gatsby-plugin-react-i18next";
import RedirectButton from "./redirect-button";
import Logo from "../components/logo.js";

import WebShufflePlayer from "../components/player";

function LanguageSwitcher() {
  const { languages, language, originalPath } = useI18next();

  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const displayNames = React.useMemo(() => {
    if (typeof Intl !== "undefined" && (Intl as any).DisplayNames) {
      return new Intl.DisplayNames([language], { type: "language" });
    }
    return null;
  }, [language]);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger */}
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow hover:bg-neutral-100 dark:hover:bg-neutral-600 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-900"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="lang-menu"
        aria-label="Change language"
      >
        {displayNames ? displayNames.of(language) : language}
        <svg aria-hidden="true" className="w-4 h-4 ms-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.25 8.29a.75.75 0 0 1-.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Menu */}
      <div
        id="lang-menu"
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 z-50 mt-2 my-4 min-w-[12rem] text-base list-none bg-white divide-y divide-neutral-100 rounded-lg shadow-sm dark:bg-neutral-700 ${open ? '' : 'hidden'}`}
      >
        <ul className="py-2 font-medium" role="none">
          {languages.map((lng) => (
            <li key={lng}>
              <Link
                to={originalPath}
                language={lng}
                hrefLang={lng}
                role="menuitem"
                data-dropdown-item
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-600 dark:hover:text-white"
                aria-selected={lng === language}
                onClick={() => setOpen(false)}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="font-medium">{displayNames ? displayNames.of(lng) : lng}</span>
                  {lng === language && <span className="sr-only">(current)</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function DefaultNavbar() {
  return (
    /*  <nav className="bg-white dark:bg-neutral-900 fixed w-full z-20 top-0 start-0 border-b border-neutral-200 dark:border-neutral-600">
  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"> */

    <nav className="z-20 backdrop-blur bg-neutral-200/80 dark:bg-neutral-800/80 md:fixed start-0 top-0 left-0 right-0 border-b border-neutral-300 dark:border-neutral-700">
      <div className="lg:max-w-screen-lg md:max-w-screen-md flex flex-wrap items-center justify-center mx-auto gap-2 py-2">
        <span className="sm:hidden mx-4">
          <Logo />
        </span>
        <WebShufflePlayer />
        <div className="flex flex-inline gap-x-4">
          <LanguageSwitcher />
          <RedirectButton className="m-4" />
        </div>
      </div>
    </nav>
  );
}
