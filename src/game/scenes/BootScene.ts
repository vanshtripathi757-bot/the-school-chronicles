import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  create() {
    this.scene.start("AcademyScene");
  }
}

export class AcademyScene extends Phaser.Scene {
  private statusText?: Phaser.GameObjects.Text;

  constructor() { super("AcademyScene"); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#202638");
    this.add.rectangle(width / 2, height / 2, width, height, 0x202638);
    this.add.rectangle(width / 2, height * 0.37, width * 0.78, height * 0.42, 0x35445a);
    this.add.rectangle(width / 2, height * 0.63, width * 0.9, height * 0.3, 0x19212f);
    this.add.text(width / 2, height * 0.19, "THE ACADEMY", {
      fontFamily: "Georgia, serif", fontSize: "clamp(20px, 4vw, 34px)", color: "#f5e9d2",
      letterSpacing: 5
    }).setOrigin(0.5);
    this.statusText = this.add.text(width / 2, height * 0.84, "PHASER 3 • INITIAL SCENE ACTIVE", {
      fontFamily: "Arial, sans-serif", fontSize: "14px", color: "#c8c4d8"
    }).setOrigin(0.5);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.statusText?.setPosition(gameSize.width / 2, gameSize.height * 0.84);
  }
}