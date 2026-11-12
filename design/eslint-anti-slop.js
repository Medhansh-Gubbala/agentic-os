// Anti-slop lint — flat-config entry banning default-AI aesthetics the Tailwind
// preset can't catch (arbitrary values, v4 projects, font imports).
// Usage in eslint.config.js:  const antiSlop = require('./design/eslint-anti-slop');
//                             module.exports = [/* existing config */, antiSlop];
// ponytail: regex-on-string-literals, not a Tailwind AST parser — catches the 95% case.

const PURPLE_FAMILY = '(bg|from|via|to|text|border|ring|fill|stroke)-(indigo|purple|violet|fuchsia)-[0-9]'
const ARBITRARY_COLOR = '(bg|text|border|from|via|to|ring)-\\[(#|rgb|hsl|oklch)'

module.exports = {
  name: 'anti-slop',
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'next/font/google',
        importNames: ['Inter'],
        message: 'Inter is banned — use the display/body pairing from DESIGN.md.',
      }],
    }],
    'no-restricted-syntax': ['error',
      {
        selector: `Literal[value=/${PURPLE_FAMILY}/]`,
        message: 'Default purple-family palette is banned — use token colors (dominant/accent/neutral).',
      },
      {
        selector: `TemplateElement[value.raw=/${PURPLE_FAMILY}/]`,
        message: 'Default purple-family palette is banned — use token colors (dominant/accent/neutral).',
      },
      {
        selector: `Literal[value=/${ARBITRARY_COLOR}/]`,
        message: 'Arbitrary color value — add it to tokens.json or don’t use it.',
      },
      {
        selector: 'Literal[value=/gradient-to-.*(indigo|purple|violet|fuchsia)/]',
        message: 'Purple gradient — the #1 AI-slop marker. Rethink per DESIGN.md.',
      },
    ],
  },
}
