"use client";

import { useEffect, useId, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

type CodeSnippetProps = {
  title: string;
  code: string;
  language?: string;
};

async function copyTextToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  if (typeof document === "undefined") {
    return false;
  }

  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "true");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();

  const success = document.execCommand("copy");
  document.body.removeChild(helper);
  return success;
}

export function CodeSnippet({ title, code, language = "html" }: CodeSnippetProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const statusId = useId();

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopyState("idle");
    }, 1600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copyState]);

  const handleCopy = async () => {
    try {
      const success = await copyTextToClipboard(code);
      setCopyState(success ? "copied" : "failed");
    } catch {
      setCopyState("failed");
    }
  };

  const statusLabel =
    copyState === "copied"
      ? "Gekopieerd"
      : copyState === "failed"
        ? "Kopieren mislukt"
        : "";

  return (
    <article className="w4-snippet" aria-label={title}>
      <header className="w4-snippet__header">
        <div>
          <h3 className="w4-snippet__title">{title}</h3>
          <p className="w4-snippet__meta">{language.toUpperCase()} snippet</p>
        </div>
        <button
          type="button"
          className="w4-copy-button"
          onClick={handleCopy}
          aria-describedby={statusId}
          aria-label={`Kopieer snippet: ${title}`}
        >
          {copyState === "copied" ? "Gekopieerd" : "Kopieer"}
        </button>
      </header>
      <pre className="w4-snippet__pre">
        <code>{code}</code>
      </pre>
      <p id={statusId} className="w4-copy-status" aria-live="polite">
        {statusLabel}
      </p>
    </article>
  );
}
