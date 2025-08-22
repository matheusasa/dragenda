"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Carregamento dinâmico do RichTextEditor melhorado para evitar problemas de SSR
const RichTextEditorImproved = dynamic(
  () =>
    import("./rich-text-editor-improved").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando editor avançado...</p>
      </div>
    ),
  }
);

export function DynamicRichTextEditorImproved(
  props: ComponentProps<typeof RichTextEditorImproved>
) {
  return <RichTextEditorImproved {...props} />;
}
