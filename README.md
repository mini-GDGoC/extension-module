# 손길도우미 확장 프로그램 개발 가이드

손길 도우미 확장프로그램 레포지토리입니다.

---

## 1. 사전 준비

- Node.js ≥ 16, pnpm ≥ 7
- Chrome(MV3) 지원 브라우저

## 2. 의존성 설치

```
pnpm install
```

# 확장 프로그램 실행 가이드

### 0. EXTENSION-MODULE 폴더에 .env 를 생성해서 VITE_API_BASE_URL=https://capstone.newdongjun.com 를 입력합니다.

<img width="800" height="392" alt="image" src="https://github.com/user-attachments/assets/6ca8c409-29ec-4c05-8c55-dfb1616db4a7" />


### 1. 크롬을 실행해서 확장프로그램 화면으로 이동합니다.
<img width="1095" height="465" alt="image" src="https://github.com/user-attachments/assets/9ec684ff-c4a2-4151-aea0-49a9b8d528f6" />

### 2. 개발자 모드 토글 ON, “압축해제된 확장 프로그램 로드” 버튼을 클릭합니다.
<img width="1091" height="417" alt="image" src="https://github.com/user-attachments/assets/e93a0cd5-1386-41de-a2a1-fc1130bcebba" />

### 3. 프그램 빌드
```
pnpm run build
```
빌드를 해서 실행 파일을 만들고 이는 dist 디렉토리에 생성 됩니다.


### 4. dist 폴더경로를 선택합니다. (extension-module/dist)
   <img width="695" height="461" alt="image" src="https://github.com/user-attachments/assets/2b7c7968-3a19-4367-af3e-940dc14bd18a" />
   
### 5. 확장프로그램 등록이 완료 됩니다.
<img width="1092" height="519" alt="image" src="https://github.com/user-attachments/assets/ace7c1de-86c2-48f3-9c8b-0ccf001ee59d" />

### 6. 디지털 배움터 웹사이트에서 손길도우미 실행합니다.
https://www.xn--2z1bw8k1pjz5ccumkb.kr/trigit/2023/simulation/06/05/index.html

<img width="1082" height="1177" alt="image" src="https://github.com/user-attachments/assets/719dc6b1-0e2d-410c-bf3b-82c10a09ece5" />

※손길 도우미는 사용자가 원하는 상품을 담아서 결제하기 직전까지의 상황을 지원합니다
<img width="561" height="810" alt="image" src="https://github.com/user-attachments/assets/429cae69-f69a-4bfe-9b5e-f7983282cf04" />
ㅊ# 손길도우미 확장 프로그램 개발 가이드

손길 도우미 확장프로그램 레포지토리입니다.

---


### 참고사항
※손길 도우미는 사용자가 원하는 상품을 담아서 결제하기 직전까지의 상황을 지원합니다
<br/>
사용자의 발화 지연을 고려하여, 실제 음성 인식은 음성 녹음 버튼이 활성화된 후 약 0.5초가 지난 후 시작됩니다.

