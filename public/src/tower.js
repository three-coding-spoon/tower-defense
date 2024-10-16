// public/src/tower.js

export class Tower {
  constructor(x, y, towerImages, level, tower_data, towerId, audio) {
    this.x = x; // 타워 이미지 x 좌표
    this.y = y; // 타워 이미지 y 좌표
    this.typeId = 300;
    this.width = 78; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
    this.height = 150; // 타워 이미지 세로 길이
    this.towerNumber = towerId; // 타워 번호
    this.attackPower = tower_data.data[this.towerNumber].attackPower;
    this.range = tower_data.data[this.towerNumber].range; // 타워 사거리
    this.cost = tower_data.data[this.towerNumber].cost; // 타워 구매 가격
    this.cooldown = tower_data.data[this.towerNumber].cooldown; // 타워 공격 쿨타임
    this.beamDuration = tower_data.data[this.towerNumber].beamDuration; // 타워 광선 지속 시간
    this.image = towerImages[this.towerNumber];
    this.init(level);
    this.target = null; // 타워 광선의 목표
    this.audio = audio;
    this.baseCooldown = tower_data.data[this.towerNumber].cooldown;
    this.baseBeamDuration = tower_data.data[this.towerNumber].beamDuration;
  }

  getLevel() {
    return this.level;
  }

  init(level) {
    this.level = level; // 타워 레벨
    this.price = this.cost * 1.3; // 레벨당 타워 가치
    this.cooldown *= 0.9; // 타워 공격 쿨타임
    this.attackPower *= 1.2;

    this.price = Math.round(this.price);
    this.attackPower = Math.round(this.attackPower);
  }

  upgrade() {
    this.init(this.level + 1);
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    if (this.beamDuration > 0 && this.target) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.lineTo(this.target.x + this.target.width / 2, this.target.y + this.target.height / 2);
      ctx.strokeStyle = 'skyblue';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.closePath();
      this.beamDuration--;
    }
    ctx.font = '15px DepartureMono-Regular';
    ctx.fillStyle = 'red';
    ctx.fillText(`(레벨 ${this.level})`, this.x, this.y - 30);
    ctx.fillText(`(공격력: ${this.attackPower})`, this.x, this.y - 5);
  }

  attack(monster) {
    // 타워가 타워 사정거리 내에 있는 몬스터를 공격하는 메소드이며 사정거리에 닿는지 여부는 game.js에서 확인합니다.
    if (this.cooldown <= 0) {
      this.audio.playSoundEffect('beam_attack');
      monster.takeDamage(this.attackPower);
      this.target = monster; // 광선의 목표 설정
      this.cooldown = this.baseCooldown;
      this.beamDuration = this.baseBeamDuration;
    }
  }

  updateCooldown() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }
}
