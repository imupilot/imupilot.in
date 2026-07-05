import { motion } from 'framer-motion';

export default function ProgressBar({ label, value, max = 100, color = 'navy' }) {
  const percent = Math.round((value / max) * 100);

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-header">
        <span className="progress-bar-label">{label}</span>
        <span className="progress-bar-value">{percent}%</span>
      </div>
      <div className="progress-bar-track">
        <motion.div
          className={`progress-bar-fill ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
