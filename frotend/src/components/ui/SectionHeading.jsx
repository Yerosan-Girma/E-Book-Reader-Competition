import { motion } from 'framer-motion';

export default function SectionHeading({ eyebrow, heading, description, align = 'left', className = '' }) {
  const alignClasses = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
      className={`flex flex-col max-w-2xl ${alignClasses} ${className}`}
    >
      {eyebrow && (
        <span className="section-eyebrow">{eyebrow}</span>
      )}
      <h2 className="section-heading">{heading}</h2>
      {description && (
        <p className={`section-description ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
