/**
 * GithubUserSpan Component
            <span 
                className={`cursor-pointer inline-block underline underline-offset-2 decoration-dashed ${className}`}
                onClick={handleClick}
            > * Displays a GitHub username with hover information and click navigation to GitHub profile
 */
import { Tooltip } from "flowbite-react";
import { MouseEvent } from "react";

interface GithubUserSpanProps {
  username: string;
  userId?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void;
}

export default function GithubUserSpan({
  username,
  userId,
  className = "",
  onClick,
}: GithubUserSpanProps) {
  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      onClick(e);
      return;
    }

    e.preventDefault();
    window.open(`https://github.com/${username}`, "_blank");
  };

  return (
    <div className="inline-block">
      <Tooltip
        content={`View GitHub profile for ${username}${userId ? ` (ID: ${userId})` : ""}`}
        placement="top"
        style="light"
      >
        <span
          className={`cursor-pointer underline underline-offset-2 decoration-dashed ${className}`}
          onClick={handleClick}
        >
          @{username}
        </span>
      </Tooltip>
    </div>
  );
}
