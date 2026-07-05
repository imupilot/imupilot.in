import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function ComingSoon({ title = 'Coming Soon', icon: Icon = BookOpen }) {
  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <div
          className="card-icon purple"
          style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)' }}
        >
          <Icon size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem' }}>{title}</h2>
        <p style={{ maxWidth: 400, color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
          We're building something amazing. This feature will be available soon — stay tuned!
        </p>
        <span
          className="label purple"
          style={{ marginTop: 'var(--space-2)' }}
        >
          In Development
        </span>
      </motion.div>
    </div>
  );
}
