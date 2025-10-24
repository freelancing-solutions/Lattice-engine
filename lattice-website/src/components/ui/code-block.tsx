"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  fileName: string;
  code: string;
  onCopy?: () => void;
};

export default function CodeBlock({ fileName, code, onCopy }: Props) {
  const copy = () => {
    navigator.clipboard.writeText(code);
    onCopy?.();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{fileName}</span>
        <Button size="sm" variant="ghost" onClick={copy}>
          <Copy className="w-3 h-3" />
        </Button>
      </div>
      <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-words">
        {code}
      </pre>
    </div>
  );
}