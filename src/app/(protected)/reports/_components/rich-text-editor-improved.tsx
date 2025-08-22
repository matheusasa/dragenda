"use client";

import "./rich-editor-styles.css";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Blockquote from "@tiptap/extension-blockquote";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  ImageIcon,
  Highlighter,
  Palette,
  Code,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Digite o conteúdo aqui...",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-gray-300 pl-4 italic",
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3 text-sm leading-relaxed [&_p:empty:first-child:before]:content-[attr(data-placeholder)] [&_p:empty:first-child:before]:text-muted-foreground [&_p:empty:first-child:before]:pointer-events-none",
        "data-placeholder": placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const addLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageInput(false);
    }
  };

  const addTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return (
      <div className="border rounded-md min-h-[200px] flex items-center justify-center bg-muted/10">
        <p className="text-muted-foreground text-sm">Carregando editor...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md min-h-[200px] bg-background">
      <div className="border-b p-2 bg-muted/30 flex flex-wrap gap-1">
        {/* Formatação de texto */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 px-2 ${editor.isActive("bold") ? "bg-muted" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 px-2 ${editor.isActive("italic") ? "bg-muted" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 px-2 ${
            editor.isActive("underline") ? "bg-muted" : ""
          }`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Cabeçalhos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Cabeçalhos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 className="h-4 w-4 mr-2" />
              Título 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 className="h-4 w-4 mr-2" />
              Título 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 className="h-4 w-4 mr-2" />
              Título 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Alinhamento */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`h-8 px-2 ${
            editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""
          }`}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`h-8 px-2 ${
            editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""
          }`}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`h-8 px-2 ${
            editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""
          }`}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`h-8 px-2 ${
            editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""
          }`}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Listas */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 px-2 ${
            editor.isActive("bulletList") ? "bg-muted" : ""
          }`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 px-2 ${
            editor.isActive("orderedList") ? "bg-muted" : ""
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Citação */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 px-2 ${
            editor.isActive("blockquote") ? "bg-muted" : ""
          }`}
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Destacar texto */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Destacar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: "#ffff00" })
                  .run()
              }
            >
              <div className="h-4 w-4 mr-2 bg-yellow-300 rounded"></div>
              Amarelo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: "#00ff00" })
                  .run()
              }
            >
              <div className="h-4 w-4 mr-2 bg-green-300 rounded"></div>
              Verde
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: "#ff0000" })
                  .run()
              }
            >
              <div className="h-4 w-4 mr-2 bg-red-300 rounded"></div>
              Vermelho
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              Remover destaque
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Cor do texto */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Cor do texto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setColor("#000000").run()}
            >
              <div className="h-4 w-4 mr-2 bg-black rounded"></div>
              Preto
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setColor("#ef4444").run()}
            >
              <div className="h-4 w-4 mr-2 bg-red-500 rounded"></div>
              Vermelho
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setColor("#3b82f6").run()}
            >
              <div className="h-4 w-4 mr-2 bg-blue-500 rounded"></div>
              Azul
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setColor("#10b981").run()}
            >
              <div className="h-4 w-4 mr-2 bg-green-500 rounded"></div>
              Verde
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              Remover cor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Link */}
        <DropdownMenu open={showLinkInput} onOpenChange={setShowLinkInput}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuLabel>Adicionar Link</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              <Input
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLink()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addLink}>
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                >
                  Remover Link
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Imagem */}
        <DropdownMenu open={showImageInput} onOpenChange={setShowImageInput}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuLabel>Adicionar Imagem</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addImage()}
              />
              <Button size="sm" onClick={addImage}>
                Adicionar Imagem
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tabela */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTable}
          className="h-8 px-2"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 px-2"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 px-2"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="min-h-[150px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
