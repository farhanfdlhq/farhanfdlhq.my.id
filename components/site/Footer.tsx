export function Footer({ name }: { name: string }) {
  return (
    <footer className="foot"><span>© {new Date().getFullYear()} {name}</span><span className="mono">farhanfdlhq.my.id</span></footer>
  );
}
