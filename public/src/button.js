export class Button {
  // 스타일 공통적인 부분은 자동으로 채워주었음.
  // 버튼안에 텍스트, 위치, 핸들러 이벤트 동작은 별도 입력
  //
  constructor(text, top, right = null, onClick) {
    this.button = document.createElement('button');
    this.button.textContent = text;
    this.button.style.display = 'none';
    this.button.style.position = 'absolute';
    this.button.style.backgroundColor = 'rgba(27, 54, 33, 0.8)';
    this.button.style.color = 'rgb(225,225,225)';
    this.button.style.top = top;
    this.button.style.right = right;
    this.button.style.padding = '10px 20px';
    this.button.style.fontSize = '16px';
    this.button.style.cursor = 'pointer';

    // 클릭 시, 이벤트가 동작하는 핸들러 설정
    if (onClick) {
      this.button.addEventListener('click', onClick);
    }

    // 버튼을 화면에 추가 함
    document.body.appendChild(this.button);
  }

  hide() {
    this.button.style.display = 'none';
  }

  show() {
    this.button.style.display = 'block';
  }
}
