// public/src/trap.js

export class Trap {
  constructor(x, y, audio) {
    this.x = x; // 트랩 이미지 x 좌표
    this.y = y; // 트랩 이미지 y 좌표
    this.typeId = 300;
    this.width = 80; // 트랩 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
    this.height = 80; // 트랩 이미지 세로 길이
    this.range = 2; // 트랩 사거리
    this.cost = 1000; // 트랩 구매 가격
    this.attackPower = 30; // 트랩 공격력
    this.audio = audio;
  }

  draw(ctx, trapImage) {
    ctx.drawImage(trapImage, this.x, this.y, this.width, this.height);
    ctx.font = '15px DepartureMono-Regular';
    ctx.fillStyle = 'red';
    ctx.fillText(`공격력: ${this.attackPower}`, this.x, this.y - 5);
  }

  attack(monster) {
    this.audio.playSoundEffect('attack_trap');
    monster.takeDamage(this.attackPower);
  }
}
