import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, iconColor, title, value, subtitle, change, changeType, delay = 0 }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      id={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div className={`card-icon ${iconColor}`}>
          <Icon />
        </div>
      </div>
      <div className="card-value">
        {value}
        {change && (
          <span className={`card-change ${changeType}`}>{change}</span>
        )}
      </div>
      <div className="card-subtitle">{subtitle}</div>
    </motion.div>
  );
}
