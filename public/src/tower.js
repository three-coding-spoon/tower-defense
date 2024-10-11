export class Tower {
  constructor(x, y, level) {
    this.x = x; // 타워 이미지 x 좌표
    this.y = y; // 타워 이미지 y 좌표
    this.width = 78; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
    this.height = 150; // 타워 이미지 세로 길이
    this.range = 300; // 타워 사거리
    this.cost = 1000; // 타워 구입 비용
    this.cooldown = 180; // 타워 공격 쿨타임
    this.beamDuration = 50; // 타워 광선 지속 시간
    this.init(level);
    this.target = null; // 타워 광선의 목표
  }
  
  getLevel() {
    return this.level;
  }

  init(level) {
    this.level = level; // 타워 레벨
    this.attackPower = 50 * level; // 타워 공격력
  }

  upgrade() {
    this.init(this.level + 1);
  }

  draw(ctx, towerImage) {
    ctx.drawImage(towerImage, this.x, this.y, this.width, this.height);
    if (this.beamDuration > 0 && this.target) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.lineTo(
        this.target.x + this.target.width / 2,
        this.target.y + this.target.height / 2
      );
      ctx.strokeStyle = "skyblue";
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.closePath();
      this.beamDuration--;
    }
    ctx.font = "15px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(
    `(레벨 ${this.level}) 공격력: ${this.attackPower}`,
    this.x,
    this.y - 5
    );
  }

  attack(monster) {
    // 타워가 타워 사정거리 내에 있는 몬스터를 공격하는 메소드이며 사정거리에 닿는지 여부는 game.js에서 확인합니다.
    if (this.cooldown <= 0) {
      monster.hp -= this.attackPower;
      this.cooldown = 180; // 3초 쿨타임 (초당 60프레임)
      this.beamDuration = 50; // 광선 지속 시간 (0.5초)
      this.target = monster; // 광선의 목표 설정
    }
  }

  updateCooldown() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }
}