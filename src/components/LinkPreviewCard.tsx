import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { formatUrlForDisplay } from '../utils/urlHelper';

interface LinkPreviewCardProps {
  url: string;
  domain: string;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url, domain }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2.5 flex items-center justify-between gap-3 p-2.5 bg-[#0C0F17] hover:bg-[#141A26] border border-[#1E2433] rounded-md transition-colors group block text-left"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded bg-[#161B26] border border-[#262F40] flex items-center justify-center shrink-0 text-[#10B981]">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-white truncate group-hover:text-[#00FF66] transition-colors">
            {domain}
          </p>
          <p className="text-[11px] text-zinc-400 font-mono truncate">
            {formatUrlForDisplay(url)}
          </p>
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#00FF66] shrink-0 transition-colors" />
    </a>
  );
};
