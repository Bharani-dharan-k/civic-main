import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-saffron hover:shadow-xl transform hover:scale-105 focus:ring-orange-500',
    secondary: 'border-2 border-blue-800 text-blue-800 bg-white hover:bg-blue-800 hover:text-white shadow-chakra hover:shadow-xl transform hover:scale-105 focus:ring-blue-500',
    outline: 'border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 focus:ring-white',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-green hover:shadow-xl transform hover:scale-105 focus:ring-green-500'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-4 text-xl'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const iconClasses = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-2xl';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={`${iconClasses} ${children ? 'mr-2' : ''} group-hover:rotate-12 transition-transform`}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={`${iconClasses} ${children ? 'ml-2' : ''} group-hover:rotate-12 transition-transform`}>
          {icon}
        </span>
      )}
    </button>
  );
};

const ButtonGroup = ({ 
  children, 
  direction = 'flex-col sm:flex-row',
  gap = 'gap-4 sm:gap-6',
  align = 'items-center',
  justify = 'justify-center',
  className = ''
}) => {
  return (
    <div className={`flex ${direction} ${align} ${justify} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export { Button, ButtonGroup };
export default Button;
