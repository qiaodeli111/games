interface Props {
  visible: boolean;
}

export default function TransitionOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="transition-overlay">
      <div className="transition-spinner">
        <div className="spinner-ring"></div>
      </div>
    </div>
  );
}
