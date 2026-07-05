// src/components/MathText.jsx
// Drop this file into src/components/
// Run: npm install katex
// This component renders text containing $...$ inline LaTeX via KaTeX.
// Plain text outside $ delimiters renders normally.
// Usage: <MathText text={question.question_text} />

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathText({ text, style = {}, className = '' }) {
  if (!text) return null;

  // Split on $ delimiters — odd indices are math, even indices are plain text
  const parts = String(text).split('$');

  return (
    <span style={style} className={className}>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          // Plain text segment
          return <span key={i}>{part}</span>;
        } else {
          // Math segment — render with KaTeX
          try {
            const html = katex.renderToString(part, {
              throwOnError: false,
              displayMode: false,
              strict: false,
            });
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ verticalAlign: 'middle' }}
              />
            );
          } catch (e) {
            // If KaTeX fails, show raw text so student at least sees something
            return <span key={i} style={{ color: '#c0392b' }}>{part}</span>;
          }
        }
      })}
    </span>
  );
}
