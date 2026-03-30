export default function LcarsButton({ color = 'gold', size = '', label, icon, onClick, disabled }) {
  return (
    <button
      className={`lcars-btn lcars-btn--${color}${size ? ' lcars-btn--' + size : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Left half-circle cap */}
      <div className="lcars-btn__cap" />
      {/* Black notch cutout */}
      <div className="lcars-btn__notch" />
      {/* Rectangular body */}
      <div className="lcars-btn__body">
        {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
        {label}
      </div>
    </button>
  )
}