import { FC } from 'react';

type Props = {
  className?: string;
  size?: number;
};

export const Loader: FC<Props> = ({
  className = '',
  size = 40,
}) => {
  return (
    <div className={`loader-container ${className}`}>
      <div 
        className="simple-loader" 
        style={{ width: size, height: size }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};