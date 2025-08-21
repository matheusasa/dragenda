"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Carregamento dinâmico do RichTextEditor para evitar problemas de SSR
const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando editor...</p>
      </div>
    ),
  }
);

export function DynamicRichTextEditor(props: ComponentProps<typeof RichTextEditor>) {
  return <RichTextEditor {...props} />;
}
