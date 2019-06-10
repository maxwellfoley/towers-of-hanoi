import React, { Component } from 'react';
import CgiHanoiDisplay from './cgiHanoiDisplay';
import GameOverlay from './gameOverlay';
import Sizer from './sizer';

export default class Hanoi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      towers: [[3, 2, 1], [], [] ],
      difficulty : "easy"
    }
    this.move = this.move.bind(this);
    this.restartPrompt = this.restartPrompt.bind(this);
    this.restart = this.restart.bind(this);
    this.cancelRestart = this.cancelRestart.bind(this);
  }

  //indexes of two towers as arguments
  move(a, b) {
    var towerA = this.state.towers[a];
    var towerB = this.state.towers[b];
    if(towerA.length == 0) {
      // cannot move a plate from a tower with no plates
      return false;
    }
    //if the second tower is empty or the highest plate on it is smaller than the
    // one we're moving, then the move is valid 
    if(towerB.length == 0 
      || towerA[towerA.length - 1] < towerB[towerB.length-1]) {
        towerB.push(towerA.pop());
        //update state
        var towers = this.state.towers;
        towers[a] = towerA;
        towers[b] = towerB;
        this.setState( { towers:towers, fresh:false });

        //check for victory
        if(towers[0].length ==0 && towers[1].length == 0) {
          var column2InOrder = true;
          for(var i = 1; i < towers[2].length; i++) {
            if(towers[2][i-1] < towers[2][i]) { column2InOrder = false }
          }
          if(column2InOrder) { this.setState({ victory: true })} 
        }
        return true;
    }
    else {
      return false;
    }
  }

  restartPrompt(difficulty) {
    this.setState({restartFunction: () => this.restart(difficulty)})
  }

  restart(difficulty) {
    var newTowers;
    if(difficulty == "easy") {
      newTowers = [[3, 2, 1], [], [] ];
    }
    else if(difficulty == "medium") {
      newTowers = [[5, 4, 3, 2, 1], [], [] ];
    }
    else{// if(difficulty == "hard") 
      newTowers = [[7, 6, 5, 4, 3, 2, 1], [], [] ];
    }

    this.setState({
      towers: newTowers, 
      victory: false,
      difficulty: difficulty,
      restartFunction: null,
      fresh: true
    })
  }

  cancelRestart() {
    this.setState({ restartFunction: null })
  }


  render() {
    return <div id="hanoi" >
      <h2>Towers of Hanoi</h2>
      {
        this.state.victory 
        ?
        <GameOverlay>
          <p>Congratulations, you win!</p><br/>
          <a className="btn" onClick={() => this.restart(this.state.difficulty)}>Play again</a>
        </GameOverlay>        :
        null
      }
      {
        this.state.restartFunction
        ?
        <GameOverlay>
          <p>Are you sure you want to restart?</p>
          <br/>
          <a className="btn" onClick={this.state.restartFunction}>Yes</a>
          <a className="btn" onClick={this.cancelRestart}>Never mind</a>
        </GameOverlay>
        :
        null
      }
      {
        !this.state.rulesRead 
        ?
        <GameOverlay>
          <h4>Rules</h4>
          <p className="left">Click and drag to move disks from one tower to another.</p>
          <p className="left">You cannot place a larger disk on top of a smaller one.</p>
          <p className="left">The goal of the game is to move all the disks to the tower on the right.</p>
          <p className="left">Good luck!</p>
          <a className="btn" onClick={() => this.setState({rulesRead:true})}>Ok</a></GameOverlay>
        :
        null
      }
      <CgiHanoiDisplay move={this.move} towers={this.state.towers} fresh={this.state.fresh}></CgiHanoiDisplay> 
      <Sizer>
        <div id="hanoi-options-container">
          <div id="hanoi-options" >
            <div id="difficulty">
              Difficulty: 
                { this.state.difficulty == "easy" ? <span className="link inactive">easy</span> : <a className="link active" onClick={() => this.restartPrompt("easy")}>easy</a> }  
                { this.state.difficulty == "medium" ? <span className="link inactive">medium</span> : <a className="link active" onClick={() => this.restartPrompt("medium")}>medium</a> }  
                { this.state.difficulty == "hard" ? <span className="link inactive">hard</span> : <a className="link active" onClick={() => this.restartPrompt("hard")}>hard</a> }  

            </div>
            <div id="restart">
              <a className="btn" onClick={() =>this.restartPrompt(this.state.difficulty)}>Restart</a>
            </div>
          </div>
        </div>
      </Sizer>
    </div>
  }

}