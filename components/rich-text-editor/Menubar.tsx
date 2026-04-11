import { useState, useCallback } from "react";
import { type Editor } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  Strikethrough,
  SubscriptIcon,
  SuperscriptIcon,
  Trash2Icon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface iAppProps {
  editor: Editor | null;
}

function ToolbarToggle({
  editor,
  action,
  isActive,
  tooltip,
  icon: Icon,
}: {
  editor: Editor;
  action: () => void;
  isActive: boolean;
  tooltip: string;
  icon: React.ComponentType;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={action}
          className={cn(isActive && "bg-secondary text-secondary-foreground")}
        >
          <Icon />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function ToolbarButton({
  onClick,
  disabled,
  tooltip,
  icon: Icon,
  variant = "ghost",
}: {
  onClick: () => void;
  disabled?: boolean;
  tooltip: string;
  icon: React.ComponentType;
  variant?: "ghost" | "destructive";
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <Button
          size="sm"
          variant={variant}
          type="button"
          onClick={onClick}
          disabled={disabled}
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-border mx-1 shrink-0" />;
}

export function Menubar({ editor }: iAppProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }

    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div className="border border-input border-t-0 border-x-0 rounded-t-lg p-1.5 bg-card">
      <TooltipProvider>
        <div className="flex flex-wrap gap-0.5 items-center">
          {/* Text formatting */}
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            tooltip="Bold (Ctrl+B)"
            icon={BoldIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            tooltip="Italic (Ctrl+I)"
            icon={ItalicIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            tooltip="Underline (Ctrl+U)"
            icon={UnderlineIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            tooltip="Strikethrough"
            icon={Strikethrough}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            tooltip="Highlight"
            icon={HighlighterIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            tooltip="Inline code"
            icon={CodeIcon}
          />

          <Divider />

          {/* Headings */}
          <ToolbarToggle
            editor={editor}
            action={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            tooltip="Heading 1"
            icon={Heading1Icon}
          />
          <ToolbarToggle
            editor={editor}
            action={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            tooltip="Heading 2"
            icon={Heading2Icon}
          />
          <ToolbarToggle
            editor={editor}
            action={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            tooltip="Heading 3"
            icon={Heading3Icon}
          />

          <Divider />

          {/* Lists & blocks */}
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            tooltip="Bullet list"
            icon={ListIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            tooltip="Ordered list"
            icon={ListOrderedIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            tooltip="Blockquote"
            icon={QuoteIcon}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Horizontal rule"
            icon={MinusIcon}
          />

          <Divider />

          {/* Superscript / Subscript */}
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive("superscript")}
            tooltip="Superscript"
            icon={SuperscriptIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive("subscript")}
            tooltip="Subscript"
            icon={SubscriptIcon}
          />

          <Divider />

          {/* Alignment */}
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            tooltip="Align left"
            icon={AlignLeftIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            tooltip="Align center"
            icon={AlignCenterIcon}
          />
          <ToolbarToggle
            editor={editor}
            action={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            tooltip="Align right"
            icon={AlignRightIcon}
          />

          <Divider />

          {/* Link */}
          <ToolbarButton
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                const previousUrl = editor.getAttributes("link").href || "";
                setLinkUrl(previousUrl);
                setShowLinkInput(true);
              }
            }}
            tooltip={editor.isActive("link") ? "Remove link" : "Add link"}
            icon={editor.isActive("link") ? UnlinkIcon : LinkIcon}
          />

          <Divider />

          {/* Utilities */}
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            tooltip="Clear formatting"
            icon={RemoveFormattingIcon}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            tooltip="Undo (Ctrl+Z)"
            icon={Undo2Icon}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            tooltip="Redo (Ctrl+Shift+Z)"
            icon={Redo2Icon}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().clearContent().run()}
            tooltip="Clear all content"
            icon={Trash2Icon}
            variant="ghost"
          />
        </div>

        {showLinkInput && (
          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border">
            <input
              type="url"
              placeholder="Enter URL…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setLink();
                }
                if (e.key === "Escape") {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }
              }}
              autoFocus
              className="flex-1 h-7 px-2 text-sm bg-transparent border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={setLink}
              className="h-7 text-xs"
            >
              Apply
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}
