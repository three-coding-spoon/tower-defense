export class AudioManager {
  constructor() {
    this.backgroundMusic = null; // 배경 음악 관리
    this.soundEffects = {}; // audio 객체를 효과음 객체에 넣어서 관리
  }

  // 배경 음악 설정
  setBackgroundMusic(src, volume = 0.2, loop = true) {
    this.backgroundMusic = new Audio(src);
    this.backgroundMusic.loop = loop; // 오디오 객체에 루프 설정.
    this.backgroundMusic.volume = volume;
    this.backgroundMusic.isPlaying = false;
  }

  // 배경 음악 재생
  playBackgroundMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
      this.backgroundMusic
        .play()
        .then(() => {
          this.backgroundMusic.isPlaying = true;
        })
        .catch((error) => {
          console.error('배경 음악 재생 중 오류:', error);
        });
    }
  }

  // 배경 음악 일시정지
  pauseBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.pause();
      this.backgroundMusic.isPlaying = false;
    }
  }

  // 배경 음악 초기화 (처음부터 재생)
  resetBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.currentTime = 0;
      this.playBackgroundMusic();
    }
  }

  // 효과음 추가
  addSoundEffect(name, src, volume = 0.2) {
    const sound = new Audio(src);
    sound.volume = volume;
    this.soundEffects[name] = sound;
  }

  // 효과음 재생
  playSoundEffect(name) {
    const sound = this.soundEffects[name];
    if (sound) {
      sound.currentTime = 0; // 재생 위치를 처음으로 설정
      sound.play().catch((error) => {
        console.error(`효과음 재생 중 오류 [${name}]:`, error);
      });
    }
  }

  // 효과음 볼륨 설정
  setSoundEffectVolume(name, volume) {
    const sound = this.soundEffects[name];
    if (sound) {
      sound.volume = volume;
    }
  }
}
