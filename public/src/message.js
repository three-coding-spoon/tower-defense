/** 게임 진행 중 발생하는 모든 이벤트 메시지에 관련된 스크립트입니다.
 * 1. 게임 시작되면 메시지박스를 다 생성해 두고 draw 하지는 않음.
 * 2. 특정 이벤트가 발생하면 draw 하는 방식
 * 3. 이전 메시지가 출력된 경우 사라지거나 덮어 씌워주기
 * 4. 메시지는 duration이 끝나면 없애주기
 */

/** 게임 현황 메시지 박스
 * 1. 스테이지 이동
 * 2. 최고 랭킹 달성
 * 3. 내 랭크 갱신
 * ... 더 추가될 수 있음
 */

export class GameStateMessage {
  constructor() {
    this.currentMessage = null;
    this.messageTimeout = null;
  }

  draw(ctx) {
    const halfWidth = ctx.canvas.width / 2;
    const halfHeight = ctx.canvas.height / 2;
    // 현재 메시지가 있으면 캔버스에 그리기
    if (this.currentMessage) {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentMessage, halfWidth, halfHeight - ctx.canvas.height / 3);
    }
  }

  showMessage(statusId) {
    // 메시지가 출력 중에 다른 메시지 출력이 입력되었을 때 처리
    // 아래 코드를 넣으면 메시지가 이미 설정된 경우에는 타임아웃을 다시 설정하지 않음
    // 즉, 기존 메시지를 계속 출력하도록 유지하는 것
    // if (this.currentMessage) return;

    // statusId에 따라 메시지 설정
    const messages = {
      1: '게임을 시작합니다!',
      2: '다음 스테이지로 이동합니다!',
      4: '타워를 구매했습니다!',
      5: '타워를 강화했습니다!',
      6: '타워를 판매했습니다!',
      7: '새로운 최고 랭킹 점수를 달성했습니다!',
      8: '새로운 개인 최고 점수를 달성했습니다!',
      9: '타워 개수 한도에 도달했습니다!',
      10: '골드가 부족합니다!',
      11: '타워 정보가 일치하지 않습니다!',
      12: '필드에 타워가 없습니다!',
      13: '타워 데이터가 손상되었습니다!',
      14: '최대 레벨에 도달했습니다!',
      15: '선택된 타워가 없습니다!',
      16: '타워를 선택해주세요!',
    };
    this.currentMessage = messages[statusId] || null;

    // 2초 후에 메시지를 지우는 타임아웃 설정
    if (this.currentMessage) {
      this.messageTimeout = setTimeout(() => {
        this.currentMessage = null;
        this.messageTimeout = null; // 타임아웃 초기화하여 메시지 숨김
      }, 2000); // 현재 2초동안 노출되도록 설정
    }
  }
}

/** 게임 종료 메시지 박스
 * 승리 or 패배
 */
export class GameEndMessage {
  constructor() {
    this.isVictory = false;
    this.isVisible = false; // 메뉴판의 표시 여부
  }

  draw(ctx) {
    const title = this.isVictory ? 'Game Clear!' : 'Game Over';
    const halfWidth = ctx.canvas.width / 2;
    const halfHeight = ctx.canvas.height / 2;
    if (!this.isVisible) return; // 메뉴판이 표시되지 않을 때는 그리지 않음

    // 배경 박스 그리기
    ctx.fillStyle = 'rgba(25, 25, 25, 0.3)'; // 배경색 투명도 지정이 안됨
    ctx.fillRect(halfWidth - halfWidth / 2, halfHeight - halfHeight / 2, halfWidth, halfHeight);

    // 텍스트 설정
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.isVictory ? 'yellow' : 'red';
    ctx.fillText(title, halfWidth, halfHeight - ctx.canvas.height * 0.15);
  }

  show() {
    this.isVisible = true; // 메뉴판을 보이게 설정
  }

  hide() {
    this.isVisible = false; // 메뉴판을 숨기기
  }
}
