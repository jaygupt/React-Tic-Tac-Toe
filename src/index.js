import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button className={`square ${props.winningSquare ? 'winning-square' : ''}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Row(props) {
  return (
    <div className='board-row'>
      {props.rowSquares}
    </div>
  )
}

class Board extends React.Component {
  renderSquare(i, winningSquare) {
    return (
      <Square
        key={'square-' + i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        winningSquare={winningSquare}
      />
    );
  }

  renderRow(i, rowSquares) {
    return (
      <Row
        key={'row-' + i}
        rowSquares={rowSquares}
      />
    );
  }

  render() {
    let board = [];
    for (let i = 0; i < 3; i++) {
      let rowSquares = [];
      for (let j = 0; j < 3; j++) {
        if (this.props.winner && this.props.winner.includes(i * 3 + j)) {
          rowSquares.push(this.renderSquare(i * 3 + j, true));
        } else {
          rowSquares.push(this.renderSquare(i * 3 + j, false));
        }
      }
      board.push(this.renderRow(i, rowSquares))
    }
    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
      currentSelectedMove: null
    }
  }

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return lines[i];
      }
    }
    return null;
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (squares[i] || this.calculateWinner(squares)) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        column: i % 3,
        row: Math.floor(i / 3)
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      currentSelectedMove: null,
      sortedAscending: true
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const column = step.column;
      const row = step.row;
      const desc = move ?
        'Go to move #' + move + " w/ (Column, Row): (" + column + ", " + row + ")":
        'Go to game start';
    
      return (
        <li key={move}>
          <button style={{fontWeight: this.state.currentSelectedMove === move ? 'bold' : 'normal'}} onClick={() => {
            this.jumpTo(move);
            this.setState({
              currentSelectedMove: move
            });
          }}>{desc}</button>
        </li>
      )
    })

    let status;
    let isDraw = false;
    if (winner) {
      status = 'Winner: ' + current.squares[winner[0]] + '!';
    } else if (current.squares.includes(null)) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      isDraw = true;
      status = "It's a draw!";
    }

    if (this.state.sortedAscending) {
      moves = moves.sort();
    } else {
      moves = moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winner={winner}
          />
        </div>
        <div className="game-info">
          <div className={`status ${isDraw ? 'draw' : ''}`}>{status}</div>
          <button onClick={() => this.setState({sortedAscending: !this.state.sortedAscending})}>Sort Moves (Ascending or Descending)</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);