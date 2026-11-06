import Phaser from "phaser";
import { BootScene, AcademyScene } from "./scenes/BootScene";

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#202638",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720
    },
    scene: [BootScene, AcademyScene],
    render: { antialias: true, pixelArt: false, roundPixels: true }
  });
}