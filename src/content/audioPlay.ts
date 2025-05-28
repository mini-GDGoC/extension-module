const audioUrl = chrome.runtime.getURL("assets/mp3/output.mp3");
// 위처럼 오미도 파일로 오디오 url 만듦 이거는 테스트 용으로 로컬에서 이렇게 한거고


function playAudioBlob(): void {
    // const audioUrl = URL.createObjectURL(audio_data);
    const audio = new Audio(audioUrl);
    console.log(audioUrl);
    audio.play()

    audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
    };
}

export default playAudioBlob;