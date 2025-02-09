"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Language, SUPPORTED_LANGUAGES } from "@/types/quiz";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
      if (savedTheme === "dark") {
        document.body.classList.add("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.body.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    router.push(`/${lang}/quiz`);
  };

  return (
    <div className="container">
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label={
          theme === "light" ? "Switch to dark mode" : "Switch to light mode"
        }
      >
        {theme === "light" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        )}
      </button>

      <main>
        <h1>Official Lebanese Driving Questions Test</h1>

        <div className="language-section">
          <p className="language-prompt">Choose a language</p>

          <div className="language-buttons">
            <button
              className="language-button"
              onClick={() => handleLanguageSelect("en")}
            >
              English
            </button>
            <button
              className="language-button"
              onClick={() => handleLanguageSelect("fr")}
            >
              Français
            </button>
            <button
              className="language-button"
              onClick={() => handleLanguageSelect("ar")}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              العربية
            </button>
          </div>
          <p className="coming-soon">Arabic coming soon</p>
        </div>
      </main>

      <footer>
        <div className="attribution">
          <span>Made by </span>
          <a
            href="https://github.com/JanoTheDev"
            target="_blank"
            rel="noopener noreferrer"
          >
            JanoTheDev
          </a>
        </div>
      </footer>
    </div>
  );
}
