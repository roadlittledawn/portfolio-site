import { css } from "@emotion/react";

export default css`
  --border-color: var(--color-neutrals-400);
  .light-mode {
    --primary-background-color: var(--color-white);
    --primary-text-color: var(--color-neutrals-700);
    --primary-text-hover-color: var(--color-neutrals-600);

    --secondary-background-color: var(--color-neutrals-100);
    --secondary-text-color: var(--color-neutrals-600);
    --secondary-text-hover-color: var(--color-neutrals-700);

    --text-color-on-teal-300: #112a46;

    --tertiary-background-color: var(--color-neutrals-200);

    --accent-text-color: var(--color-neutrals-500);
    --link-color: var(--color-brand-500);
    --link-hover-color: var(--color-brand-300);
    --border-color: var(--color-neutrals-400);
    --border-hover-color: var(--color-neutrals-500);
    --divider-color: var(--color-neutrals-100);
    --heading-text-color: var(--color-neutrals-900);

    --callout-caution-background-color: #fce9e935;
    --callout-important-background-color: #fff9cc30;
    --callout-tip-background-color: #d1f7d925;

    --tile-background-color: var(--color-neutrals-050);
    --tile-border: 1px solid var(--color-neutrals-300);
    --tile-foreground-neutral: var(--color-neutrals-550);
    --tile-foreground-contrast: var(--color-teal-400);
    --tile-box-shadow: 0 10px 30px -15px var(--color-neutrals-600);

    input::placeholder {
      color: var(--color-neutrals-500);
    }

    *:not(pre) > code,
    var {
      background: var(--color-neutrals-200);
    }
  }

  .dark-mode {
    --primary-background-color: #232728;
    --primary-text-color: var(--color-dark-700);
    --primary-text-hover-color: var(--color-dark-900);

    --secondary-background-color: var(--color-dark-050);
    --secondary-text-color: var(--color-dark-600);
    --secondary-text-hover-color: var(--color-dark-700);

    --tertiary-background-color: var(--color-dark-100);

    --accent-text-color: var(--color-dark-600);
    --link-color: var(--color-brand-300);
    --link-hover-color: var(--color-brand-050);
    --border-color: var(--color-dark-400);
    --border-hover-color: var(--color-dark-500);
    --divider-color: var(--color-dark-200);
    --heading-text-color: var(--color-dark-900);

    --callout-caution-background-color: #1b000020;
    --callout-important-background-color: #14110020;
    --callout-tip-background-color: #02120020;

    --tile-background-color: var(--color-neutrals-750);
    --tile-border: 1px solid var(--color-neutrals-800);
    --tile-foreground-neutral: var(--color-neutrals-550);
    --tile-foreground-contrast: var(--color-teal-400);
    --tile-box-shadow: 0 10px 30px -15px var(--color-neutrals-900);

    input::placeholder {
      color: var(--color-dark-500);
    }

    *:not(pre) > code,
    var {
      background: var(--color-dark-200);
    }
  }
`;
