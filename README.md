# tower-defense

[팀스파르타 Node.js 6기] 4챕터 팀 프로젝트 - 타워 디펜스

## Preview

![](title.png)

![](ingame.png)

## 파일 구조

```
📦ROOT
 ┣ 📂public
 ┃ ┣ 📂images               -   이미지 파일 묶음 폴더
 ┃ ┣ 📂sound                -   소리 파일 묶음 폴더
 ┃ ┣ 📂src                  -   client 소스코드 묶음 폴더
 ┃ ┃ ┣ 📜base.js
 ┃ ┃ ┣ 📜button.js              -   버튼 관련 객체 코드
 ┃ ┃ ┣ 📜constant.js
 ┃ ┃ ┣ 📜game.js
 ┃ ┃ ┣ 📜message.js             -   메시지 관련 객체 코드
 ┃ ┃ ┣ 📜monster.js
 ┃ ┃ ┗ 📜tower.js
 ┃ ┃ ┗ 📜audio.js               -   사운드 관련 객체 코드
 ┃ ┃ ┗ 📜trap.js                -   트랩 관련 객체 코드
 ┃ ┣ 📂styles               -   css 파일 묶음 폴더
 ┃ ┃ ┣ 📜index.css
 ┃ ┃ ┗ 📜rank.css
 ┃ ┣ 📜index.html
 ┃ ┣ 📜login.html
 ┃ ┣ 📜register.html
 ┃ ┗ 📜room.html            -   로그인 후 대기실 브라우저
 ┣ 📂src
 ┃ ┣ 📂assets               -   게임 데이터 에셋 묶음 폴더
 ┃ ┃ ┣ 📜monster.json
 ┃ ┃ ┣ 📜monster_unlock.json
 ┃ ┃ ┣ 📜tower.json
 ┃ ┃ ┣ 📜trap.json
 ┃ ┃ ┗ 📜wave.json
 ┃ ┣ 📂handlers             -   이벤트 처리 묶음 폴더
 ┃ ┃ ┣ 📜authHandler.js
 ┃ ┃ ┣ 📜broadcastHandler.js
 ┃ ┃ ┣ 📜gameHandler.js
 ┃ ┃ ┣ 📜handlerMapping.js
 ┃ ┃ ┣ 📜helper.js
 ┃ ┃ ┣ 📜mobHandler.js
 ┃ ┃ ┣ 📜rankHandler.js
 ┃ ┃ ┣ 📜registerHandler.js
 ┃ ┃ ┣ 📜stageHandler.js
 ┃ ┃ ┣ 📜towerHandler.js
 ┃ ┃ ┗ 📜trapHandler.js
 ┃ ┣ 📂init                 -   서버 초기화 세팅 묶음 폴더
 ┃ ┃ ┣ 📜assets.js
 ┃ ┃ ┗ 📜socket.js
 ┃ ┣ 📂middlewares          -   미들웨어 묶음 폴더
 ┃ ┃ ┗ 📜authMiddleware.js
 ┃ ┣ 📂models               -   게임 데이터 모델 묶음 폴더
 ┃ ┃ ┣ 📜mobCountModel.js       -   유저 별 잡은 몹 데이터
 ┃ ┃ ┣ 📜scoreModel.js          -   유저 별 스코어 데이터
 ┃ ┃ ┣ 📜stageModel.js          -   유저 별 스테이지 데이터
 ┃ ┃ ┣ 📜towerModel.js          -   유저 별 타워 데이터
 ┃ ┃ ┣ 📜trapModel.js           -   유저 별 트랩 데이터
 ┃ ┃ ┗ 📜userModel.js           -   유저 데이터
 ┃ ┣ 📂routes
 ┃ ┃ ┣ 📜authRoutes.js          -   인증 관련 라우터 묶음 코드
 ┃ ┃ ┗ 📜rankRoutes.js          -   랭크 관련 라우터 묶음 코드
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜db.js                  -   mysql DB 연동
 ┃ ┃ ┣ 📜log.js                 -   log 관련 스크립트
 ┃ ┃ ┣ 📜scoreCalculation.js    -   점수 계산 스크립트
 ┃ ┃ ┗ 📜towerCalculator.js     -   타워 관련 계산 스크립트
 ┃ ┗ 📜app.js
 ┣ 📜.env
 ┣ 📜.gitattributes
 ┣ 📜.gitignore
 ┣ 📜.prettierrc
 ┣ 📜constants.js           -   허용 클라이언트, 초기 세팅에 대한 정보 스크립트
 ┣ 📜package-lock.json
 ┗ 📜package.json
```

## 구현 기능

### 필수

- [x] 회원 가입 로그인 기능

  - [x] Access Token 발급
  - [x] Access Token 기반 유저 인증

- [x] 서버로부터 데이터 동기화

  - [x] 공통 데이터 (초기 세팅)
  - [x] 유저 데이터 (몬스터 레벨, 게임 점수, 기존 최고 점수)

- [x] 이벤트 종류 정의 및 코드 구현
  - [x] 커넥션 성공 이벤트 (성공 시, 유저 등록 및 게임 시작)
  - [x] 커넥션 실패 이벤트 (실패 시, 재로그인 요청)
  - [x] 상태 동기화 이벤트 (타워 관련 동작, 몬스터 처리, 게임 시작 및 종료 시 이벤트 발생)

### 도전

- [x] 타워 환불 기능

- [x] 특정 타워 업그레이드 기능

- [x] 보물 고블린 몬스터 출현 기능

### 선택

- 스테이지 기능 추가 => 해당 웨이브에서 등장할 수 있는 모든 몬스터가 제거되면 다음 웨이브 진행 구현
- 랭킹 리스트 추가 => 모든 유저의 랭크를 조회하여 랭크 리스트를 출력 및 내 랭크 조회 기능 및 UI 구현
- 게임 재도전 기능 추가 => 소켓 연결을 끊지 않고 재도전 할 수 있는 기능 구현
- 게임 로그 추가 => 모든 유저의 행동 패턴 추적을 위한 로그 구현
- 타워 선택 추가 => 타워를 선택하여 업그레이드 및 환불할 수 있도록 기능 및 UI 구현
- 타워 종류 추가 => 타워의 종류를 추가하여 다양한 타워를 설치할 수 있는 기능 구현
- 트랩 설치물 추가 => 몬스터가 다니는 경로에 트랩을 설치할 수 있는 기능 구현
- 현황 메시지 추가 => 특정 이벤트 혹은 동작에 따른 이벤트 메시지 출력 기능 구현
- 게임 사운드 추가 => 특정 이벤트 혹은 동작에 따른 사운드 출력 기능 구현
- 그 외 폰트 및 UI/UX 작업 ...

## 트러블슈팅

### 발단

기존 스켈레톤 코드에서는 게임이 종료되었을 때 재시작하려면 웹소켓을 재연결해야 하는 방식이었습니다.

### 목표

게임이 종료되면 재도전을 할 수 있는 버튼이 생성되어 다시 시작할 수 있도록 만드는 것이 목표였습니다.

### 작업

위 목표를 만들면서 아래와 같은 작업 사항이 필요했습니다.

- 유저의 전체 게임 데이터 초기화 작업
- 게임 진행을 멈추는 작업(루프 종료X)
- 게임 루프를 다시 돌리는 작업

### 위기

위 작업을 진행하면서 아래와 같은 어려움을 겪었습니다.

- 초기 타워가 배치 되지 않거나 위치 및 개수 문제 발생
- 스테이지 재시작 문제 발생
- 몬스터가 스폰되지 않는 문제 발생
- 재도전마다 몬스터의 속도가 빨라지는 문제 발생

### 원인

- 서버 및 클라이언트에서 초기화 작업을 제대로 하지 않음
- 기존 requestAnimationFrame을 취소하지 않아서 프레임이 중첩
- 불필요한 타워 좌표 생성 및 핸들링 이슈

### 해결

- 서버는 기존에는 재연결하기 때문에 초기화가 필요없었는데 clear~~() 함수를 통해 게임 종료 핸들러에서 유저의 데이터를 초기화 시켜주는 작업을 추가했습니다.
- 재도전이 이루어지면 cancelAnimationFrame(animationId) 를 통해 기존 애니메이션을 삭제했습니다.
- 초기 타워 배치 핸들러에는 배치 개수만큼 잘 되었는지 확인하는 용도로 하고, 배치에 관련된 로직은 모두 타워 배치 핸들러에서 다루도록 통일했습니다.

### 소감

canvas 와 requestAnimationFrame 으로 제작된 웹 게임에서 프레임에 대한 개념과 애니메이션을 다루는 방법에 대해 이해할 수 있었습니다.

소켓이 연결된 상태에서 초기화 작업을 해야하는 경우 필요한 작업과 그러한 로직을 처리하는 구간을 조금 더 명확하게 이해하고 구현해볼 수 있었습니다.

핸들러 이벤트에 대한 역할과 책임을 확실하게 구분할 수 있도록 처리하는 점을 익히고 배울 수 있는 기회였습니다.

## API 및 패킷 명세서

- API 명세서:

  https://www.notion.so/120a35e3ae9380a59e71da1bb5d9c2f6?v=120a35e3ae9381fe9955000cf52370fa

- 패킷 명세서:

  https://www.notion.so/120a35e3ae9380a0b97df494e5f49abb?v=120a35e3ae9381b2a7eb000c192c45da
