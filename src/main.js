import Phaser from 'phaser';
import { lesson } from './content.js';
import './style.css';

const ui = Object.fromEntries(['overlay', 'play', 'restart', 'score', 'lives', 'progress', 'question', 'feedback', 'screen-title', 'screen-label', 'screen-copy'].map(id => [id, document.getElementById(id)]));
const positions = [1, 3, 5];
class Quest extends Phaser.Scene {
  constructor() { super('Quest'); }
  preload() {
    this.load.svg('robot', './assets/robot.svg', { width: 64, height: 64 });
    this.load.svg('star', './assets/star.svg', { width: 72, height: 72 });
  }
  create() {
    this.state = { mode: 'title', score: 0, lives: lesson.lives, round: 0, x: 1, y: 3 };
    this.add.text(36, 22, 'THE DISCOVERY GARDEN', { fontFamily: 'Arial', fontSize: 16, color: '#a8c1bd', letterSpacing: 3 });
    for (let y = 0; y < 5; y++) for (let x = 0; x < 7; x++) {
      this.add.rectangle(100 + x * 100, 110 + y * 70, 90, 60, (x + y) % 2 ? 0x25413d : 0x213b38, 1).setStrokeStyle(1, 0x365650);
    }
    this.cards = positions.map(x => ({
      star: this.add.image(100 + x * 100, 180, 'star').setDisplaySize(55, 55),
      label: this.add.text(100 + x * 100, 230, '', { fontFamily: 'Arial', fontSize: 25, fontStyle: 'bold', color: '#ffe8a6' }).setOrigin(0.5),
    }));
    this.robot = this.add.image(200, 320, 'robot').setDisplaySize(54, 54);
    const onKeyDown = event => {
      // Native buttons keep Enter/Space activation and keyboard focus behavior.
      if (event.target instanceof HTMLButtonElement && ['Enter', ' '].includes(event.key)) return;
      const action = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ' ': 'collect', r: 'restart', Enter: 'start' }[event.key.length === 1 ? event.key.toLowerCase() : event.key];
      if (action) { event.preventDefault(); this.act(action); }
    };
    // Handle native events once, without waiting for Phaser's frame event queue.
    window.addEventListener('keydown', onKeyDown);
    this.events.once('shutdown', () => window.removeEventListener('keydown', onKeyDown));
    ui.play.addEventListener('click', () => this.act('restart'));
    ui.restart.addEventListener('click', () => this.act('restart'));
    document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => this.act(button.dataset.action)));
    this.render();
  }
  act(action) {
    if (action === 'restart' || (action === 'start' && this.state.mode !== 'playing')) {
      this.state = { mode: 'playing', score: 0, lives: lesson.lives, round: 0, x: 1, y: 3 };
      ui.feedback.textContent = 'Move to an answer star, then press Space.';
      ui.play.blur(); ui.restart.blur();
    } else if (this.state.mode === 'playing') {
      const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[action];
      if (delta) {
        this.state.x = Phaser.Math.Clamp(this.state.x + delta[0], 0, 6);
        this.state.y = Phaser.Math.Clamp(this.state.y + delta[1], 0, 4);
      } else if (action === 'collect') this.collect();
    }
    this.render();
  }
  collect() {
    const index = this.state.y === 1 ? positions.indexOf(this.state.x) : -1;
    if (index < 0) { ui.feedback.textContent = 'Stand on a star to collect an answer.'; return; }
    const question = lesson.questions[this.state.round];
    if (index === question.correct) {
      this.state.score += lesson.points;
      this.state.round++;
      ui.feedback.textContent = `Correct! ${question.explanation} +${lesson.points} stars.`;
      if (this.state.round === lesson.questions.length) this.state.mode = 'won';
      else { this.state.x = 1; this.state.y = 3; }
    } else {
      this.state.lives--;
      ui.feedback.textContent = `Try again. ${question.explanation}`;
      if (this.state.lives === 0) this.state.mode = 'lost';
    }
  }
  render() {
    const s = this.state;
    ui.score.textContent = s.score; ui.lives.textContent = s.lives;
    ui.progress.textContent = `Mission ${Math.min(s.round + 1, lesson.questions.length)} / ${lesson.questions.length}`;
    ui.question.textContent = s.mode === 'title' ? 'Your first mission is waiting.' : s.mode === 'won' ? 'All three sums solved!' : lesson.questions[s.round].prompt;
    this.robot.setPosition(100 + s.x * 100, 110 + s.y * 70);
    this.cards.forEach((card, i) => card.label.setText(lesson.questions[Math.min(s.round, lesson.questions.length - 1)].answers[i]));
    ui.overlay.hidden = s.mode === 'playing';
    if (s.mode === 'won' || s.mode === 'lost') {
      ui['screen-label'].textContent = s.mode === 'won' ? 'MISSION COMPLETE' : 'KEEP EXPLORING';
      ui['screen-title'].textContent = s.mode === 'won' ? 'You’re a number star!' : 'Every try is learning.';
      ui['screen-copy'].textContent = `You earned ${s.score} stars. ${s.mode === 'won' ? 'All three puzzles solved. Ready for another adventure?' : 'You used all three lives. Try the mission again!'} `;
      ui.play.innerHTML = 'Play again <span>↗</span>';
    }
    // Read-only DOM telemetry lets tests verify real input without exposing game mutations.
    Object.assign(document.querySelector('#game').dataset, { ready: 'true', mode: s.mode, x: s.x, y: s.y, round: s.round });
  }
}
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#19332f', width: 800, height: 460, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: Quest, render: { antialias: true } });
