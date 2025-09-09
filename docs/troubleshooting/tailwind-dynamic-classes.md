# Tailwind Dynamic Classes Not Working

## Problem
When using dynamic class names with Tailwind CSS (e.g., template literals or computed values), the classes may not apply even though the HTML shows the correct class names.

### Example
```js
// GridContainer.astro
const gridCols = `grid-cols-${columns.lg}`;  // Results in "grid-cols-3"
```

The class `grid-cols-3` appears in the HTML but has no effect.

## Cause
Tailwind CSS uses content scanning to keep bundle sizes small. It statically analyzes your source files for class names and only includes CSS for classes it finds.

When you write `grid-cols-${columns.lg}`, Tailwind's scanner sees the template literal string, NOT the final computed value "grid-cols-3". Since it never sees the complete class name, it doesn't include that CSS in the final bundle.

## Solution
Add the dynamic classes to the `safelist` in `tailwind.config.mjs`:

```js
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  safelist: [
    'grid-cols-1',
    'grid-cols-2', 
    'grid-cols-3',
    'grid-cols-4',
    'lg:grid-cols-1',
    'lg:grid-cols-2',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    // Add all possible dynamic class combinations
  ],
  // ... rest of config
}
```

The `safelist` tells Tailwind to always include these classes in the CSS bundle, regardless of whether it finds them during content scanning.

## When This Happens
Common scenarios requiring safelist:
1. **Dynamic class construction** - Template literals or concatenation
2. **JavaScript runtime classes** - Classes added after page load
3. **User-generated content** - Classes from CMS or user input
4. **External libraries** - Classes from npm packages

## Alternative Approaches
1. **Static class maps** - Use objects instead of template literals
2. **Dummy elements** - Include hidden elements with all possible classes
3. **Arbitrary values** - Use Tailwind's bracket syntax: `lg:grid-cols-[3]`

## Key Takeaway
If a Tailwind class appears in your HTML but doesn't work, check if it's being dynamically generated. If so, add it to the safelist.