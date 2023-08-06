const App = () => {
  return (
    <>
      <div className="score">
        <div id="player1-score">0</div>
        <div id="player2-score">0</div>
      </div>

      <div className="ball" id="ball"></div>
      <div className="paddle left" id="player-paddle"></div>
      <div className="paddle right" id="player-paddle"></div>
    </>
  )
}

export default App;