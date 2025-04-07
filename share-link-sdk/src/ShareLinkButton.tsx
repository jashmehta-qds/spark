import React from 'react';

export interface ShareLinkButtonProps {
  buttonText?: string;
  onShare?: (link: string) => void;
}

export const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({
  buttonText = "Share This Product",
  onShare,
}) => {
  const generateLink = () => {
    const random = Math.random().toString(36).substring(2, 10);
    const link = `https://example.com/share/${random}`;
    if (onShare) {
      onShare(link);
    } else {
      alert(`Shareable Link: ${link}`);
    }
  };

  return (
    <button
      onClick={generateLink}
      style={{
        padding: '10px 16px',
        fontSize: '14px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {buttonText}
    </button>
  );
};
