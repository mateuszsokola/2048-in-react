import Board from "@/components/board";
import Score from "@/components/score";
import Background from "@/components/background";
import TileGallery from "@/components/tile-gallery";

export default function Game() {
  return (
    <Background>
      <header
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          margin: '0 auto',
        }}
      >
        <h1>2048</h1>
        <Score />
      </header>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          gap: '16px',
          flex: '1 0 auto',
        }}
      >
        <Board />
        <div style={{ marginTop: '16px', width: '100%' }}>
          <TileGallery />
        </div>
      </main>
    </Background>
  );
}
