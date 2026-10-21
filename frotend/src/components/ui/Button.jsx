import { forwardRef } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

const Button = forwardRef(({ variant = 'primary', size = 'md', children, className = '', icon, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2';

  const variants = {
    primary: 'bg-gradient-to-b from-forest-400 to-forest-500 text-cream-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    gold: 'bg-gradient-to-b from-gold-400 to-gold-500 text-forest-600 shadow-gold hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
    outline: 'bg-white/80 text-forest-500 border border-cream-200 shadow-sm hover:bg-white hover:border-forest-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'bg-transparent text-forest-500 hover:bg-cream-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {icon === 'arrow' && <ArrowRight className="w-4 h-4" />}
      {icon === 'book' && <BookOpen className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
