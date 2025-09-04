import React from 'react';

const PageLayout = ({ 
  children, 
  className = '', 
  containerClassName = '',
  maxWidth = '7xl',
  padding = 'px-4 sm:px-6 lg:px-8'
}) => {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${padding} ${containerClassName}`}>
        {children}
      </div>
    </div>
  );
};

const Section = ({ 
  children, 
  className = '', 
  padding = 'py-16 md:py-24',
  background = 'bg-white'
}) => {
  return (
    <section className={`${background} ${padding} ${className}`}>
      {children}
    </section>
  );
};

const SectionHeader = ({ 
  title, 
  subtitle, 
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  centered = true
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-16 lg:mb-20 ${className}`}>
      <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-800 leading-tight ${titleClassName}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xl md:text-2xl text-gray-600 max-w-4xl ${centered ? 'mx-auto' : ''} leading-relaxed ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

const GridContainer = ({ 
  children, 
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  gap = 'gap-8 lg:gap-12',
  className = ''
}) => {
  return (
    <div className={`grid ${columns} ${gap} ${className}`}>
      {children}
    </div>
  );
};

const FlexContainer = ({ 
  children, 
  direction = 'flex-col sm:flex-row',
  align = 'items-center',
  justify = 'justify-center',
  gap = 'gap-6',
  className = ''
}) => {
  return (
    <div className={`flex ${direction} ${align} ${justify} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export { PageLayout, Section, SectionHeader, GridContainer, FlexContainer };
export default PageLayout;
