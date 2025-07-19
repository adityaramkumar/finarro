import React from 'react';

const Logo = ({
  className = 'h-8 w-8',
  showText = false,
  textClassName = 'text-xl font-bold text-white ml-2',
}) => {
  return (
    <div className="flex items-center">
      <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="6" fill="#4F46E5" />
        <path
          d="M16 4C16.55 4 17 4.45 17 5V7.05C19.84 7.29 22 9.58 22 12.5C22 13.05 21.55 13.5 21 13.5C20.45 13.5 20 13.05 20 12.5C20 10.57 18.43 9 16.5 9H15.5C13.57 9 12 10.57 12 12.5C12 14.43 13.57 16 15.5 16H16.5C19.54 16 22 18.46 22 21.5C22 24.42 19.84 26.71 17 26.95V29C17 29.55 16.55 30 16 30C15.45 30 15 29.55 15 29V26.95C12.16 26.71 10 24.42 10 21.5C10 20.95 10.45 20.5 11 20.5C11.55 20.5 12 20.95 12 21.5C12 23.43 13.57 25 15.5 25H16.5C18.43 25 20 23.43 20 21.5C20 19.57 18.43 18 16.5 18H15.5C12.46 18 10 15.54 10 12.5C10 9.58 12.16 7.29 15 7.05V5C15 4.45 15.45 4 16 4Z"
          fill="white"
        />
      </svg>
      {showText && <span className={textClassName}>finarro</span>}
    </div>
  );
};

export default Logo;
