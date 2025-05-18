# 손길도우미 확장 프로그램 개발 가이드

노인용 웹 키오스크에서 돌아가는 Chrome 확장으로, ReturnZero STT/TTS API를 gRPC-Web 으로 스트리밍 호출합니다.

---

## 1. 사전 준비

- Node.js ≥ 16, pnpm ≥ 7
- Chrome(MV3) 지원 브라우저

## 2. 의존성 설치


pnpm install

## 3. 환경변수 설정
프로젝트 루트에 .env 파일을 생성   
RTZR_CLIENT_ID=your_client_id_here   
RTZR_CLIENT_SECRET=your_client_secret_here   

## 4. protoc 설치
mac / linux   
```bash
brew install protobuf          # macOS Homebrew
sudo apt-get update
sudo apt-get install protobuf-compiler  # Ubuntu/Debian
```
Windows   
https://github.com/protocolbuffers/protobuf/releases 에서
protoc-*-win64.zip 다운로드

압축 해제 후 bin/protoc.exe를 프로젝트 루트의 protoc/bin 폴더에 복사

```bash
extension-module/
├─ protoc/
│  └─ bin/
│     └─ protoc.exe
```
## 5. gRPC-Web 스텁 생성
protos/vito-stt-client.proto 파일을 기준으로, 메시지 타입과 서비스 클라이언트를 생성

Windows   
pnpm run gen:proto:win   
macOS / Linux   
pnpm run gen:proto:unix   
패키지 스크립트 예시 (package.json):
```bash
"scripts": {
  "gen:proto:win": "set \"PATH=%CD%\\protoc\\bin;%CD%\\node_modules\\.bin;%PATH%\" && protoc --plugin=protoc-gen-js=protoc-gen-js --plugin=protoc-gen-grpc-web=protoc-gen-grpc-web --proto_path=protos --js_out=import_style=commonjs:src/proto --grpc-web_out=import_style=typescript,mode=grpcwebtext:src/proto protos/vito-stt-client.proto",
  "gen:proto:unix": "export PATH=$(pwd)/protoc/bin:$(pwd)/node_modules/.bin:$PATH && protoc --plugin=protoc-gen-js=protoc-gen-js --plugin=protoc-gen-grpc-web=protoc-gen-grpc-web --proto_path=protos --js_out=import_style=commonjs:src/proto --grpc-web_out=import_style=typescript,mode=grpcwebtext:src/proto protos/vito-stt-client.proto"
}
```
실행 후 src/proto/에 다음 파일들이 생성됩니다:   

vito-stt-client_pb.d.ts   
Vito-stt-clientServiceClientPb.ts   
