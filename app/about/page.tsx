import React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* Header Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          O <span className="text-accent">mnie</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Cześć! Nazywam się Michał Jaremczuk. To miejsce jest moim osobistym zakątkiem 
          w sieci, gdzie dzielę się przemyśleniami z codziennego życia, sprawami zawodowymi 
          oraz moją pasją do sportu.
        </p>
      </section>

      {/* Grid with Bio Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
              />
            </svg>
            <h2 className="font-bold text-lg">Zawodowo</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jestem programistą. Pasjonuję się nowoczesnymi technologiami webowymi, 
            architekturą oprogramowania oraz pisaniem czystego, czytelnego kodu. 
            Cenię sobie pragmatyzm i ciągły rozwój w rzemiośle programistycznym.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z"
              />
            </svg>
            <h2 className="font-bold text-lg">Sportowo</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Moim największym hobby jest sport, w szczególności dyscypliny wytrzymałościowe. 
            Trenuję triathlon – łączę pływanie, kolarstwo szosowe oraz bieganie. 
            Aktywność fizyczna pozwala mi oczyścić umysł i uczy dyscypliny w codziennym życiu.
          </p>
        </div>
      </div>

      {/* Social Links Section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold tracking-tight">Znajdziesz mnie tutaj</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* LinkedIn Link */}
          <a
            href="https://www.linkedin.com/in/micha%C5%82-jaremczuk-559018a1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-neutral-900/50 hover:border-neutral-800 transition-all group">
              <div className="flex items-center gap-3">
                {/* LinkedIn SVG Icon */}
                <svg
                  className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-sm font-medium">LinkedIn</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.63l-3.01-3.01a.75.75 0 1 1 1.06-1.06l4.28 4.28a.75.75 0 0 1 0 1.06l-4.28 4.28a.75.75 0 1 1-1.06-1.06l3.01-3.01H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </a>

          {/* GitHub Link */}
          <a
            href="https://mjaremczuk.github.io/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-neutral-900/50 hover:border-neutral-800 transition-all group">
              <div className="flex items-center gap-3">
                {/* GitHub SVG Icon */}
                <svg
                  className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.63l-3.01-3.01a.75.75 0 1 1 1.06-1.06l4.28 4.28a.75.75 0 0 1 0 1.06l-4.28 4.28a.75.75 0 1 1-1.06-1.06l3.01-3.01H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </a>

          {/* Strava Link */}
          <a
            href="https://www.strava.com/athletes/91551100"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-neutral-900/50 hover:border-neutral-800 transition-all group">
              <div className="flex items-center gap-3">
                {/* Strava SVG / Custom Path */}
                <svg
                  className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.387 17.944l-2.089-4.116h-3.065l5.154 10.172 5.154-10.172h-3.065l-2.089 4.116zm-7.662-15.096L0 17.944h4.757l2.968-5.839 2.968 5.839H15.45L7.725 2.848z" />
                </svg>
                <span className="text-sm font-medium">Strava</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.63l-3.01-3.01a.75.75 0 1 1 1.06-1.06l4.28 4.28a.75.75 0 0 1 0 1.06l-4.28 4.28a.75.75 0 1 1-1.06-1.06l3.01-3.01H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </a>
        </div>
      </section>

      {/* Back button */}
      <div className="flex justify-center pt-6">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Wróć do strony głównej
          </Button>
        </Link>
      </div>
    </div>
  );
}
