import { motion } from 'framer-motion';

export default function ActivityChart({ data }) {
  const max = Math.max(...data);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div>
      <div className="activity-chart">
        {data.map((val, i) => {
          const height = (val / max) * 100;
          const isToday = i === data.length - 1;
          return (
            <motion.div
              key={i}
              className={`activity-bar ${isToday ? 'today' : ''}`}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{
                duration: 0.6,
                delay: i * 0.02,
                ease: [0.16, 1, 0.3, 1],
              }}
              title={`${val} questions`}
            />
          );
        })}
      </div>
      <div className="chart-labels">
        {days.map((d) => (
          <span key={d} className="chart-label">{d}</span>
        ))}
      </div>
    </div>
  );
}
