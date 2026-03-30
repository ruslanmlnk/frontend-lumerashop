'use client';

import { useState } from 'react';

type LogoutButtonProps = {
  children: React.ReactNode;
  className?: string;
};

const LogoutButton = ({ children, className }: LogoutButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
      });
    } finally {
      window.location.replace('/my-account');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className={className}
    >
      {children}
    </button>
  );
};

export default LogoutButton;
