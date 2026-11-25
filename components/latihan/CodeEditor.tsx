"use client";
import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, drawSelection, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { tags } from "@lezer/highlight";

export type EditorHandle = { getCode(): string; setCode(code: string): void };

// Warna dari token DESIGN.md: putih es untuk teks, abu untuk komentar, merah hanya untuk kata kunci.
const highlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#FF4D3D" },
  { tag: [tags.string, tags.special(tags.string)], color: "#C9D6C3" },
  { tag: [tags.number, tags.bool, tags.null], color: "#E8C9A0" },
  { tag: tags.comment, color: "#8B929B", fontStyle: "italic" },
  { tag: [tags.definition(tags.variableName), tags.function(tags.variableName), tags.className], color: "#FFFFFF", fontWeight: "600" },
  { tag: tags.propertyName, color: "#C7D2DE" },
]);

const theme = EditorView.theme({
  "&": { color: "#DDE6F0", backgroundColor: "rgba(0, 0, 0, .45)", border: "1px solid rgba(221, 230, 240, .14)", borderRadius: "2px", fontSize: "16px" },
  "&.cm-focused": { outline: "2px solid #DDE6F0", outlineOffset: "2px" },
  ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.55", minHeight: "240px" },
  ".cm-content": { caretColor: "#DDE6F0", padding: "10px 0" },
  ".cm-gutters": { backgroundColor: "transparent", color: "#8B929B", border: "none" },
  ".cm-cursor": { borderLeftColor: "#DDE6F0" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgba(221, 230, 240, .22)" },
  ".cm-matchingBracket": { backgroundColor: "rgba(221, 230, 240, .16)", outline: "1px solid rgba(221, 230, 240, .4)" },
}, { dark: true });

/** Editor kode untuk latihan manual: penyorotan, nomor baris, indentasi, dan pasangan kurung. Tanpa autocomplete, saran, atau lint. */
export default function CodeEditor({ initial, onChange, onReady, label, helpId, handle }: {
  initial: string; onChange(code: string): void; onReady(): void; label: string; helpId: string; handle: { current: EditorHandle | null };
}) {
  const host = useRef<HTMLDivElement>(null);
  const change = useRef(onChange);
  change.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial,
        extensions: [
          lineNumbers(), history(), drawSelection(), indentOnInput(), bracketMatching(), closeBrackets(),
          javascript(), syntaxHighlighting(highlight), theme, EditorView.lineWrapping,
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.contentAttributes.of({ "aria-label": label, "aria-describedby": helpId, spellcheck: "false", autocorrect: "off", autocapitalize: "off", translate: "no" }),
          EditorView.updateListener.of((u) => { if (u.docChanged) change.current(u.state.doc.toString()); }),
        ],
      }),
    });
    handle.current = {
      getCode: () => view.state.doc.toString(),
      setCode: (code) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } }),
    };
    onReady();
    return () => { handle.current = null; view.destroy(); };
    // Editor dibuat sekali; isi berikutnya diubah lewat handle.setCode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} className="editor" />;
}
