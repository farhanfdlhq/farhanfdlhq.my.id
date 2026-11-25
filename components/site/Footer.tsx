export function Footer({ name, note }: { name: string; note?: React.ReactNode }) {
  return (
    <footer className="foot">
      <span>© {new Date().getFullYear()} {name}</span>
      {note ? <span className="foot-note">{note}</span> : null}
      <span className="mono">farhanfdlhq.my.id</span>
    </footer>
  );
}
