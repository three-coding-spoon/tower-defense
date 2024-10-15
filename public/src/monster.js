// public/src/monster.js

export class Monster {
  constructor(path, monsterImages, level, monster_unlock, monster_data, isBonus = false) {
    // 생성자 안에서 몬스터의 속성을 정의한다고 생각하시면 됩니다!
    if (!path || path.length <= 0) {
      throw new Error('몬스터가 이동할 경로가 필요합니다.');
    }

    this.path = path; // 몬스터가 이동할 경로
    this.currentIndex = 0; // 몬스터가 이동 중인 경로의 인덱스
    this.x = path[0].x; // 몬스터의 x 좌표 (최초 위치는 경로의 첫 번째 지점)
    this.y = path[0].y; // 몬스터의 y 좌표 (최초 위치는 경로의 첫 번째 지점)
    this.width = 80; // 몬스터 이미지 가로 길이
    this.height = 80; // 몬스터 이미지 세로 길이
    this.speed = 7; // 몬스터의 이동 속도
    this.level = level; // 몬스터 레벨
    this.monsterNumber = !isBonus ? this.createMonster(monster_unlock) : 5; // 몬스터 번호 (현재 스테이지에 나올 수 있는 몬스터 번호)
    this.baseHp = monster_data.data[this.monsterNumber].hp;
    this.baseAttackPower = monster_data.data[this.monsterNumber].attackPower;
    this.image = monsterImages[this.monsterNumber]; // 몬스터 이미지
    this.score = monster_data.data[this.monsterNumber].score;
    this.isKilledByPlayer = false; // 몹이 플레이어에 의해 죽었는지 여부
    this.init(level);
  }

  createMonster(monster_unlock) {
    const BONUS_MONSTER_ID = 5; // 보너스 몬스터 ID 정의
    const currentStage = this.level;
    const stageData = monster_unlock.data.find((stage) => stage.wave_id === currentStage + 999);

    // stageData가 없을 경우 예외 처리
    if (!stageData) {
      throw new Error(`현재 스테이지(${currentStage})에 해당하는 데이터가 없습니다.`);
    }

    let allowedMonsters = stageData.monster_id;

    // monster_id가 빈 배열이거나 undefined일 경우 예외 처리
    if (!Array.isArray(allowedMonsters) || allowedMonsters.length === 0) {
      throw new Error(`현재 스테이지(${currentStage})에 사용할 수 있는 몬스터가 없습니다.`);
    }

    // 보너스 몬스터 ID 제외
    allowedMonsters = allowedMonsters.filter((monsterId) => monsterId !== BONUS_MONSTER_ID);

    // 보너스 몬스터 ID를 제외한 후 배열이 비어있을 경우 예외 처리
    if (allowedMonsters.length === 0) {
      throw new Error(
        `현재 스테이지(${currentStage})에서 보너스 몬스터만 존재합니다. 일반 몬스터를 스폰할 수 없습니다.`,
      );
    }

    // monster_id 배열의 길이가 1인 경우 바로 반환
    if (allowedMonsters.length === 1) {
      return allowedMonsters[0];
    }

    // monster_id 배열에서 무작위 몬스터 선택
    const monsterId = allowedMonsters[Math.floor(Math.random() * allowedMonsters.length)];
    console.log(monsterId);
    return monsterId;
  }

  init(level) {
    this.maxHp = this.baseHp + 10 * level; // 몬스터의 현재 HP
    this.hp = this.maxHp; // 몬스터의 현재 HP
    this.attackPower = this.baseAttackPower + 1 * level; // 몬스터의 공격력 (기지에 가해지는 데미지)
  }

  move(base) {
    if (this.currentIndex < this.path.length - 1) {
      const nextPoint = this.path[this.currentIndex + 1];
      const deltaX = nextPoint.x - this.x;
      const deltaY = nextPoint.y - this.y;
      // 2차원 좌표계에서 두 점 사이의 거리를 구할 땐 피타고라스 정리를 활용하면 됩니다! a^2 = b^2 + c^2니까 루트를 씌워주면 되죠!
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < this.speed) {
        // 거리가 속도보다 작으면 다음 지점으로 이동시켜주면 됩니다!
        this.currentIndex++;
      } else {
        // 거리가 속도보다 크면 일정한 비율로 이동하면 됩니다. 이 때, 단위 벡터와 속도를 곱해줘야 해요!
        this.x += (deltaX / distance) * this.speed; // 단위 벡터: deltaX / distance
        this.y += (deltaY / distance) * this.speed; // 단위 벡터: deltaY / distance
      }
      return false;
    } else {
      const isDestroyed = base.takeDamage(this.attackPower); // 기지에 도달하면 기지에 데미지를 입힙니다!
      this.hp = 0; // 몬스터는 이제 기지를 공격했으므로 자연스럽게 소멸해야 합니다.
      this.isKilledByPlayer = false; // 베이스에 도착해서 사라진 경우
      return isDestroyed;
    }
  }

  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isKilledByPlayer = true; // 플레이어가 보내버림
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`(레벨 ${this.level}) ${this.hp}/${this.maxHp}`, this.x, this.y - 5);
  }
}
