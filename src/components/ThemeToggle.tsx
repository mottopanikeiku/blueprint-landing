import { useState } from 'react';

type Theme = 'black' | 'blue';

const THEME_COLOR: Record<Theme, string> = { black: '#000000', blue: '#0f3768' };

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'blue' ? 'blue' : 'black';
}

/** Black sheet or classic blueprint. The choice is remembered; index.html applies it before first paint. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const choose = (next: Theme) => {
    setTheme(next);
    if (next === 'blue') document.documentElement.dataset.theme = 'blue';
    else delete document.documentElement.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // storage unavailable (private mode): the toggle still works for this visit
    }
  };

  return (
    // Pressed buttons, not role="radio": radios promise arrow-key navigation these plain buttons do not have.
    <div className="theme-toggle" role="group" aria-label="Sheet colour">
      {(['black', 'blue'] as const).map((t) => (
        <button key={t} type="button" aria-pressed={theme === t} className={theme === t ? 'on' : undefined} onClick={() => choose(t)}>
          <span className={`swatch swatch-${t}`} />
          <span className="label">{t}</span>
        </button>
      ))}
    </div>
  );
}
