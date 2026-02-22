'use client';
import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function RichTextLimited({ value = '', onChange, maxLength = 300, placeholder = 'Start typing...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        blockquote: false,
        strike: false,
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[120px] prose prose-sm max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.state.doc.textContent;
      if (text.length > maxLength) {
        const truncated = text.slice(0, maxLength);
        // Replace document with truncated plain text
        editor.commands.setContent(`<p>${truncated.replace(/\n/g, '<br/>')}</p>`, false, { preserveWhitespace: true });
      }
      onChange?.(editor.getHTML(), editor.state.doc.textContent.length);
    },
  });

  // Keep external value in sync
  useEffect(() => {
    if (editor && value !== undefined) {
      const current = editor.getHTML();
      if (current !== value) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  const textLen = editor.state.doc.textContent.length;

  return (
    <div className="border border-gray-300 rounded-md shadow-sm">
      <div className="flex items-center gap-1 border-b bg-gray-50 px-2 py-1 rounded-t-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          Italic
        </button>
        <div className="ml-auto text-xs text-gray-500">{textLen}/{maxLength}</div>
      </div>
      <div className="px-3 py-2">
        {textLen === 0 && (
          <div
            className="text-gray-400 text-sm select-none cursor-text mb-1"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().run();
            }}
          >
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
