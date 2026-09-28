"use client";

import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Editor da descrição do dispositivo.
 *
 * O site atual usa `document.execCommand`, marcado como obsoleto pelos
 * navegadores há anos e sujeito a sumir. O Tiptap produz a mesma marcação
 * simples (negrito, itálico, sublinhado, parágrafos) de forma estável, e o
 * conteúdo ainda passa por `sanitizar()` antes de ser exibido no site.
 */
export function EditorDescricao({
  valorInicial,
  aoMudar,
}: {
  valorInicial: string;
  aoMudar: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
    ],
    content: valorInicial || "<p></p>",
    onUpdate: ({ editor: atual }) => aoMudar(atual.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-40 max-h-80 overflow-y-auto rounded-b-teia bg-sur px-3 py-2.5 text-sm leading-relaxed focus:outline-none [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
  });

  if (!editor) {
    return <div className="h-52 rounded-teia bg-sur-2" aria-hidden />;
  }

  return (
    <div className="rounded-teia border border-black/12">
      <div className="flex gap-1 rounded-t-teia border-b border-black/10 bg-sur-2 p-1.5">
        <Botao
          ativo={editor.isActive("bold")}
          rotulo="Negrito"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </Botao>
        <Botao
          ativo={editor.isActive("italic")}
          rotulo="Itálico"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </Botao>
        <Botao
          ativo={editor.isActive("underline")}
          rotulo="Sublinhado"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={15} />
        </Botao>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function Botao({
  children,
  ativo,
  rotulo,
  onClick,
}: {
  children: React.ReactNode;
  ativo: boolean;
  rotulo: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      aria-pressed={ativo}
      title={rotulo}
      className={cn(
        "rounded p-1.5 transition-colors",
        ativo ? "bg-marca-600 text-white" : "text-tx-2 hover:bg-black/5",
      )}
    >
      {children}
    </button>
  );
}
