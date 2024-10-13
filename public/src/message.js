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
    // 현재 메시지가 있으면 캔버스에 그리기
    if (this.currentMessage) {
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.currentMessage,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2 - ctx.canvas.height / 3,
      );
    }
  }

  showMessage(statusId) {
    // 메시지가 출력 중에 다른 메시지 출력이 입력되었을 때 처리
    // 아래 코드를 넣으면 메시지가 이미 설정된 경우에는 타임아웃을 다시 설정하지 않음
    // 즉, 기존 메시지를 계속 출력하도록 유지하는 것
    // if (this.currentMessage) return;

    // statusId에 따라 메시지 설정
    switch (statusId) {
      case 1:
        this.currentMessage = '게임이 시작됩니다!';
        break;
      case 2:
        this.currentMessage = '다음 스테이지로 이동합니다!';
        break;
      case 3:
        this.currentMessage = '적을 모두 물리쳤습니다!';
        break;
      case 4:
        this.currentMessage = '타워가 배치되었습니다!';
        break;
      case 5:
        this.currentMessage = '타워가 업그레이드 되었습니다!';
        break;
      case 6:
        this.currentMessage = '타워가 환불되었습니다!';
        break;
      case 7:
        this.currentMessage = '최고 랭킹이 갱신되었습니다!';
      case 8:
        this.currentMessage = '내 최고 점수가 갱신되었습니다!';
      default:
        this.currentMessage = null;
    }

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
    this.isVisible = false; // 메뉴판의 표시 여부
  }

  draw(ctx) {
    if (!this.isVisible) return; // 메뉴판이 표시되지 않을 때는 그리지 않음

    // 배경 박스 그리기
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(ctx.canvas.width / 2 - 350, ctx.canvas.height / 2 - 250, 700, 500);

    // 텍스트 설정
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('게임 종료', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);

    // 버튼 그리기
    ctx.fillStyle = 'gray';
    ctx.fillRect(ctx.canvas.width / 2 - 100, ctx.canvas.height / 2, 200, 40);
    ctx.fillStyle = 'gray';
    ctx.fillRect(ctx.canvas.width / 2 - 100, ctx.canvas.height / 2 + 60, 200, 40);

    // 버튼 텍스트
    ctx.fillStyle = 'white';
    ctx.fillText('재도전', ctx.canvas.width / 2, ctx.canvas.height / 2 + 25);
    ctx.fillText('게임 종료', ctx.canvas.width / 2, ctx.canvas.height / 2 + 85);
  }

  show() {
    this.isVisible = true; // 메뉴판을 보이게 설정
  }

  hide() {
    this.isVisible = false; // 메뉴판을 숨기기
  }
}
