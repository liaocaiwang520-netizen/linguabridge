const storageKey = "linguaBridgeState";
const themeKey = "linguaBridgeTheme";
const streakKey = "linguaBridgeStreak";

// Dark mode
let isDark = localStorage.getItem(themeKey) === "dark";
if (isDark) document.body.classList.add("dark");

// Streak state
let streak = loadStreak();
let articleParagraphIndex = 0;
let articleReadingMode = "";
let articleIsPaused = false;
let articleContinueAfter = false;
let articleReadToken = 0;

function loadStreak() {
  try {
    const saved = JSON.parse(localStorage.getItem(streakKey) || "{}");
    return { count: saved.count || 0, lastDate: saved.lastDate || "" };
  } catch {
    return { count: 0, lastDate: "" };
  }
}

function saveStreak() {
  localStorage.setItem(streakKey, JSON.stringify(streak));
}

function updateStreak() {
  const today = todayDate();
  if (streak.lastDate === today) return;
  const yesterday = addDaysStr(-1);
  if (streak.lastDate === yesterday) {
    streak.count += 1;
  } else if (streak.lastDate !== today) {
    streak.count = 1;
  }
  streak.lastDate = today;
  saveStreak();
  renderStreak();
}

function addDaysStr(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function renderStreak() {
  const badge = document.querySelector("#streakBadge");
  const count = document.querySelector("#streakCount");
  if (streak.count > 0) {
    badge.style.display = "inline-flex";
    count.textContent = streak.count;
  } else {
    badge.style.display = "none";
  }
}

// Toast notification
function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 2000);
}

let decks = [
  {
    id: "topik-basic",
    language: "ko",
    type: "TOPIK 初级",
    title: "TOPIK 初级核心词",
    description: "适合零基础到 TOPIK I 的基础名词、动词和常用表达。",
    words: [
      { term: "학교", pronunciation: "hak-gyo", meaning: "学校", example: "저는 매일 학교에 가요.", synonyms: ["교실", "캠퍼스"], antonyms: ["집"], partOfSpeech: "名词" },
      { term: "공부하다", pronunciation: "gong-bu-ha-da", meaning: "学习", example: "오늘 한국어를 공부해요.", synonyms: ["배우다", "익히다"], antonyms: ["놀다"], partOfSpeech: "动词" },
      { term: "친구", pronunciation: "chin-gu", meaning: "朋友", example: "친구와 같이 점심을 먹어요.", synonyms: ["벗", "동료"], antonyms: ["낯선 사람"], partOfSpeech: "名词" },
      { term: "시간", pronunciation: "si-gan", meaning: "时间", example: "시간이 있으면 복습해요.", synonyms: ["때", "기간"], antonyms: ["순간"], partOfSpeech: "名词" },
      { term: "책", pronunciation: "chaek", meaning: "书", example: "이 책은 정말 재미있어요.", synonyms: ["도서", "교재"], antonyms: [], partOfSpeech: "名词" },
      { term: "가족", pronunciation: "ga-jok", meaning: "家人", example: "가족과 함께 저녁을 먹어요.", synonyms: ["식구", "친척"], antonyms: ["타인"], partOfSpeech: "名词" },
      { term: "음식", pronunciation: "eum-sik", meaning: "食物", example: "한국 음식은 맛있어요.", synonyms: ["요리", "식사"], antonyms: [], partOfSpeech: "名词" },
      { term: "운동하다", pronunciation: "un-dong-ha-da", meaning: "运动", example: "매일 아침 운동해요.", synonyms: ["활동하다", "단련하다"], antonyms: ["쉬다"], partOfSpeech: "动词" },
      { term: "날씨", pronunciation: "nal-ssi", meaning: "天气", example: "오늘 날씨가 아주 좋아요.", synonyms: ["기후", "일기"], antonyms: [], partOfSpeech: "名词" },
      { term: "여행", pronunciation: "yeo-haeng", meaning: "旅行", example: "다음 달에 제주도로 여행 가요.", synonyms: ["관광", "나들이"], antonyms: ["귀가"], partOfSpeech: "名词" },
      { term: "사랑", pronunciation: "sa-rang", meaning: "爱", example: "가족을 사랑합니다.", synonyms: ["애정", "정"], antonyms: ["미움"], partOfSpeech: "名词" },
      { term: "생각하다", pronunciation: "saeng-gak-ha-da", meaning: "思考、想", example: "좋은 생각이 났어요.", synonyms: ["고민하다", "판단하다"], antonyms: [], partOfSpeech: "动词" }
    ]
  },
  {
    id: "topik-advanced",
    language: "ko",
    type: "TOPIK 中高级",
    title: "TOPIK II 进阶词",
    description: "围绕阅读、写作和社会议题整理的中高级表达。",
    words: [
      { term: "환경", pronunciation: "hwan-gyeong", meaning: "环境", example: "환경 보호는 중요한 문제입니다.", synonyms: ["주변", "여건"], antonyms: ["오염"], partOfSpeech: "名词" },
      { term: "발전하다", pronunciation: "bal-jeon-ha-da", meaning: "发展、进步", example: "기술이 빠르게 발전하고 있습니다.", synonyms: ["성장하다", "진보하다"], antonyms: ["퇴보하다"], partOfSpeech: "动词" },
      { term: "영향", pronunciation: "yeong-hyang", meaning: "影响", example: "습관은 성적에 큰 영향을 줍니다.", synonyms: ["효과", "작용"], antonyms: ["무관"], partOfSpeech: "名词" },
      { term: "해결책", pronunciation: "hae-gyeol-chaek", meaning: "解决方案", example: "현실적인 해결책이 필요합니다.", synonyms: ["대안", "방안"], antonyms: ["문제점"], partOfSpeech: "名词" },
      { term: "경쟁", pronunciation: "gyeong-jaeng", meaning: "竞争", example: "취업 시장의 경쟁이 심해요.", synonyms: ["대결", "경합"], antonyms: ["협력"], partOfSpeech: "名词" },
      { term: "다양성", pronunciation: "da-yang-seong", meaning: "多样性", example: "문화 다양성을 존중해야 합니다.", synonyms: ["다채로움", "변화"], antonyms: ["획일성"], partOfSpeech: "名词" },
      { term: "소통", pronunciation: "so-tong", meaning: "沟通", example: "원활한 소통이 중요합니다.", synonyms: ["대화", "교류"], antonyms: ["단절"], partOfSpeech: "名词" },
      { term: "기술", pronunciation: "gi-sul", meaning: "技术", example: "새로운 기술이 사회를 바꿉니다.", synonyms: ["테크닉", "공학"], antonyms: ["전통"], partOfSpeech: "名词" },
      { term: "인식", pronunciation: "in-sik", meaning: "认识、认知", example: "문제에 대한 인식이 필요해요.", synonyms: ["이해", "자각"], antonyms: ["무지"], partOfSpeech: "名词" },
      { term: "경제", pronunciation: "gyeong-je", meaning: "经济", example: "한국의 경제가 성장했습니다.", synonyms: ["재정", "산업"], antonyms: [], partOfSpeech: "名词" },
      { term: "복지", pronunciation: "bok-ji", meaning: "福利", example: "사회 복지 제도가 확대되었어요.", synonyms: ["혜택", "지원"], antonyms: ["불이익"], partOfSpeech: "名词" },
      { term: "지속하다", pronunciation: "ji-sok-ha-da", meaning: "持续", example: "꾸준히 공부를 지속해야 해요.", synonyms: ["유지하다", "계속하다"], antonyms: ["중단하다"], partOfSpeech: "动词" }
    ]
  },
  {
    id: "business-korean",
    language: "ko",
    type: "商务韩语",
    title: "会议与邮件词库",
    description: "覆盖公司沟通、会议记录、报价和商务邮件。",
    words: [
      { term: "회의", pronunciation: "hoe-ui", meaning: "会议", example: "오후 세 시에 회의가 있습니다.", synonyms: ["미팅", "논의"], antonyms: ["휴식"], partOfSpeech: "名词" },
      { term: "견적서", pronunciation: "gyeon-jeok-seo", meaning: "报价单", example: "견적서를 이메일로 보내 주세요.", synonyms: ["가격표", "제안서"], antonyms: ["영수증"], partOfSpeech: "名词" },
      { term: "담당자", pronunciation: "dam-dang-ja", meaning: "负责人", example: "담당자와 다시 확인하겠습니다.", synonyms: ["책임자", "관리자"], antonyms: ["방문객"], partOfSpeech: "名词" },
      { term: "일정", pronunciation: "il-jeong", meaning: "日程、安排", example: "다음 주 일정을 조정해야 합니다.", synonyms: ["스케줄", "계획"], antonyms: ["즉흥"], partOfSpeech: "名词" },
      { term: "계약", pronunciation: "gye-yak", meaning: "合同", example: "계약서를 검토해 주세요.", synonyms: ["협정", "약정"], antonyms: ["파기"], partOfSpeech: "名词" },
      { term: "매출", pronunciation: "mae-chul", meaning: "销售额", example: "이번 분기 매출이 증가했습니다.", synonyms: ["판매액", "수익"], antonyms: ["비용"], partOfSpeech: "名词" },
      { term: "고객", pronunciation: "go-gaek", meaning: "客户", example: "고객 만족이 가장 중요합니다.", synonyms: ["손님", "클라이언트"], antonyms: ["판매자"], partOfSpeech: "名词" },
      { term: "협력", pronunciation: "hyeop-ryeok", meaning: "合作", example: "두 회사가 협력하기로 했습니다.", synonyms: ["제휴", "협업"], antonyms: ["경쟁"], partOfSpeech: "名词" },
      { term: "보고서", pronunciation: "bo-go-seo", meaning: "报告", example: "주간 보고서를 작성하세요.", synonyms: ["리포트", "문서"], antonyms: [], partOfSpeech: "名词" },
      { term: "전략", pronunciation: "jeon-ryak", meaning: "战略", example: "새로운 마케팅 전략을 수립했어요.", synonyms: ["계획", "방침"], antonyms: ["임시"], partOfSpeech: "名词" },
      { term: "투자", pronunciation: "tu-ja", meaning: "投资", example: "해외 투자를 검토 중입니다.", synonyms: ["출자", "자금"], antonyms: ["회수"], partOfSpeech: "名词" },
      { term: "발표", pronunciation: "bal-pyo", meaning: "发表、演讲", example: "내일 회의에서 발표할 예정입니다.", synonyms: ["프레젠테이션", "공개"], antonyms: [], partOfSpeech: "名词" }
    ]
  },
  {
    id: "ielts-high-frequency",
    language: "en",
    type: "IELTS 高频",
    title: "IELTS Academic 高频词",
    description: "适合写作 Task 2、阅读和口语观点表达。",
    words: [
      { term: "sustainable", pronunciation: "/səˈsteɪnəbl/", meaning: "可持续的", example: "Cities need sustainable transport systems.", synonyms: ["durable", "renewable"], antonyms: ["wasteful", "unsustainable"], partOfSpeech: "adjective" },
      { term: "evidence", pronunciation: "/ˈevɪdəns/", meaning: "证据", example: "The essay should include clear evidence.", synonyms: ["proof", "support"], antonyms: ["claim", "assumption"], partOfSpeech: "noun" },
      { term: "significant", pronunciation: "/sɪɡˈnɪfɪkənt/", meaning: "显著的、重要的", example: "There was a significant increase in costs.", synonyms: ["important", "substantial"], antonyms: ["minor", "insignificant"], partOfSpeech: "adjective" },
      { term: "perspective", pronunciation: "/pərˈspektɪv/", meaning: "视角、观点", example: "This issue can be seen from another perspective.", synonyms: ["viewpoint", "angle"], antonyms: ["blind spot"], partOfSpeech: "noun" },
      { term: "consequently", pronunciation: "/ˈkɒnsɪkwəntli/", meaning: "因此、所以", example: "The data was incomplete; consequently, the results were unreliable.", synonyms: ["therefore", "as a result"], antonyms: ["nevertheless"], partOfSpeech: "adverb" },
      { term: "fundamental", pronunciation: "/ˌfʌndəˈmentl/", meaning: "基本的、根本的", example: "Education is a fundamental human right.", synonyms: ["essential", "basic"], antonyms: ["secondary", "minor"], partOfSpeech: "adjective" },
      { term: "comprehensive", pronunciation: "/ˌkɒmprɪˈhensɪv/", meaning: "全面的", example: "The report provides a comprehensive overview.", synonyms: ["thorough", "complete"], antonyms: ["limited", "narrow"], partOfSpeech: "adjective" },
      { term: "phenomenon", pronunciation: "/fɪˈnɒmɪnən/", meaning: "现象", example: "Global warming is a complex phenomenon.", synonyms: ["occurrence", "event"], antonyms: [], partOfSpeech: "noun" },
      { term: "ultimately", pronunciation: "/ˈʌltɪmətli/", meaning: "最终", example: "Ultimately, hard work leads to success.", synonyms: ["finally", "eventually"], antonyms: ["initially"], partOfSpeech: "adverb" },
      { term: "nevertheless", pronunciation: "/ˌnevəðəˈles/", meaning: "然而、尽管如此", example: "It was difficult; nevertheless, she succeeded.", synonyms: ["however", "nonetheless"], antonyms: ["consequently"], partOfSpeech: "adverb" },
      { term: "paradigm", pronunciation: "/ˈpærədaɪm/", meaning: "范式、典范", example: "This discovery shifted the scientific paradigm.", synonyms: ["model", "framework"], antonyms: [], partOfSpeech: "noun" },
      { term: "revolutionize", pronunciation: "/ˌrevəˈluːʃənaɪz/", meaning: "革新、彻底改变", example: "Technology has revolutionized communication.", synonyms: ["transform", "overhaul"], antonyms: ["preserve", "maintain"], partOfSpeech: "verb" }
    ]
  },
  {
    id: "pte-core",
    language: "en",
    type: "PTE 词典",
    title: "PTE 高频听说词",
    description: "面向 Repeat Sentence、Retell Lecture 和 Essay 的常见学术词。",
    words: [
      { term: "lecture", pronunciation: "/ˈlektʃər/", meaning: "讲座", example: "The lecture explains basic economic theory.", synonyms: ["talk", "presentation"], antonyms: ["conversation"], partOfSpeech: "noun" },
      { term: "summarize", pronunciation: "/ˈsʌməraɪz/", meaning: "总结", example: "Please summarize the main idea in one sentence.", synonyms: ["outline", "condense"], antonyms: ["expand", "elaborate"], partOfSpeech: "verb" },
      { term: "accurate", pronunciation: "/ˈækjərət/", meaning: "准确的", example: "Accurate pronunciation improves speaking scores.", synonyms: ["correct", "precise"], antonyms: ["wrong", "inaccurate"], partOfSpeech: "adjective" },
      { term: "resource", pronunciation: "/ˈriːsɔːrs/", meaning: "资源", example: "The library provides useful learning resources.", synonyms: ["material", "asset"], antonyms: ["shortage"], partOfSpeech: "noun" },
      { term: "demonstrate", pronunciation: "/ˈdemənstreɪt/", meaning: "展示、证明", example: "The experiment demonstrates the theory clearly.", synonyms: ["show", "illustrate"], antonyms: ["conceal"], partOfSpeech: "verb" },
      { term: "analyze", pronunciation: "/ˈænəlaɪz/", meaning: "分析", example: "Students must analyze the data carefully.", synonyms: ["examine", "evaluate"], antonyms: ["ignore"], partOfSpeech: "verb" },
      { term: "essential", pronunciation: "/ɪˈsenʃl/", meaning: "必要的、本质的", example: "Good preparation is essential for success.", synonyms: ["crucial", "vital"], antonyms: ["unnecessary", "optional"], partOfSpeech: "adjective" },
      { term: "contribution", pronunciation: "/ˌkɒntrɪˈbjuːʃn/", meaning: "贡献", example: "Her contribution to the project was invaluable.", synonyms: ["input", "effort"], antonyms: ["hindrance"], partOfSpeech: "noun" },
      { term: "evaluate", pronunciation: "/ɪˈvæljueɪt/", meaning: "评估", example: "We need to evaluate all options carefully.", synonyms: ["assess", "judge"], antonyms: ["guess"], partOfSpeech: "verb" },
      { term: "proportion", pronunciation: "/prəˈpɔːʃn/", meaning: "比例", example: "A large proportion of students passed the exam.", synonyms: ["percentage", "ratio"], antonyms: ["whole"], partOfSpeech: "noun" },
      { term: "interpret", pronunciation: "/ɪnˈtɜːprɪt/", meaning: "解释、解读", example: "How do you interpret this graph?", synonyms: ["explain", "understand"], antonyms: ["misunderstand"], partOfSpeech: "verb" },
      { term: "distinction", pronunciation: "/dɪˈstɪŋkʃn/", meaning: "区别、差别", example: "There is a clear distinction between the two theories.", synonyms: ["difference", "contrast"], antonyms: ["similarity"], partOfSpeech: "noun" }
    ]
  }
];

const extraDecks = Array.isArray(window.LINGUABRIDGE_EXTRA_DECKS) ? window.LINGUABRIDGE_EXTRA_DECKS : [];
const topikIDecks = Array.isArray(window.LINGUABRIDGE_TOPIK_I_DECKS) ? window.LINGUABRIDGE_TOPIK_I_DECKS : [];
const englishDecks = decks.filter((deck) => deck.language !== "ko");
const externalDecks = [...topikIDecks, ...extraDecks.filter((deck) => deck.language !== "ko")];
decks = [...topikIDecks, ...englishDecks, ...externalDecks.filter((deck) => !topikIDecks.some((existing) => existing.id === deck.id) && !englishDecks.some((existing) => existing.id === deck.id))];

const topikMeaningFixes = {
  "감사합니다": ["thank you", "谢谢"],
  "감사드립니다": ["thank you", "谢谢"],
  "감자탕": ["pork backbone stew", "脊骨土豆汤"],
  "강좌": ["course, lecture", "课程"],
  "개": ["dog; counter for things", "狗；个、只、件的量词"],
  "개나리": ["forsythia", "连翘花"],
  "개인": ["individual, personal", "个人"],
  "건배": ["cheers, toast", "干杯"],
  "겨울방학": ["winter vacation", "寒假"],
  "거울": ["mirror", "镜子"],
  "고맙습니다": ["thank you", "谢谢"],
  "급하다": ["urgent, in a hurry", "急、紧急"],
  "두부찌개": ["tofu stew", "豆腐汤"],
  "드시다": ["to eat, to drink (honorific)", "吃、喝的敬语"],
  "듣기": ["listening", "听力"],
  "들": ["field, plural marker", "田野、复数标记"],
  "등산복": ["hiking clothes", "登山服"],
  "등산화": ["hiking boots", "登山鞋"],
  "디브이디": ["DVD", "DVD"],
  "따라가다": ["to follow, to go along", "跟着去"],
  "따라오다": ["to follow, to come along", "跟着来"],
  "따르다": ["to follow, to pour", "跟随、倒"],
  "때문": ["because of, reason", "因为、原因"],
  "떡": ["rice cake", "年糕"],
  "떡국": ["rice cake soup", "年糕汤"],
  "떡볶이": ["spicy stir-fried rice cakes", "炒年糕"],
  "먹다": ["to eat", "吃"],
  "멕시코": ["Mexico", "墨西哥"],
  "면도": ["shaving", "刮胡子"],
  "명": ["person counter", "人名量词"],
  "모르겠습니다": ["I do not know", "我不知道"],
  "모자": ["hat, cap", "帽子"],
  "목욕하다": ["to take a bath", "洗澡"],
  "반갑습니다": ["nice to meet you", "很高兴见到你"],
  "반년": ["half a year", "半年"],
  "반달": ["half moon", "半月"],
  "발전": ["development, progress", "发展"],
  "발표": ["presentation, announcement", "发表、公布"],
  "배구": ["volleyball", "排球"],
  "부부": ["married couple", "夫妻"],
  "불다": ["to blow", "吹"],
  "수도": ["capital city, water supply", "首都、自来水"],
  "수돗물": ["tap water", "自来水"],
  "수술하다": ["to have surgery", "做手术"],
  "수업": ["class, lesson", "课程"],
  "수학": ["mathematics", "数学"],
  "쉬다": ["to rest", "休息"],
  "스타킹": ["stockings", "丝袜"],
  "스페인어": ["Spanish language", "西班牙语"],
  "쓰기": ["writing", "写作"],
  "쓰이다": ["to be used, to be written", "被使用、被写"],
  "씨": ["Mr., Ms.; seed", "先生/女士、种子"],
  "씩": ["each, apiece", "每、各"],
  "아뇨": ["no", "不"],
  "아니오": ["no", "不"],
  "아랍어": ["Arabic language", "阿拉伯语"],
  "아시아": ["Asia", "亚洲"],
  "아침밥": ["breakfast", "早饭"],
  "아침식사": ["breakfast", "早餐"],
  "아프리카": ["Africa", "非洲"],
  "아주머니": ["middle-aged woman, madam", "阿姨、中年女性"],
  "어리다": ["to be young", "年幼"],
  "어렵다": ["difficult", "难"],
  "어른": ["adult, elder", "成年人、长辈"],
  "어머": ["oh my", "哎呀"],
  "어저께": ["yesterday", "昨天"],
  "없이": ["without", "没有"],
  "엔": ["in, at; won", "在、韩元"],
  "여러가지": ["various kinds", "各种各样"],
  "여러분": ["everyone, you all", "各位、大家"],
  "역": ["station, role", "车站、角色"],
  "오랜만에": ["after a long time", "久违地"],
  "오리": ["duck", "鸭子"],
  "오징어": ["squid", "鱿鱼"],
  "열다": ["to open", "打开"],
  "올려놓다": ["to put up, to place on", "放上去"],
  "옮기다": ["to move, to transfer", "移动、转移"],
  "옷가게": ["clothing store", "服装店"],
  "외삼촌": ["maternal uncle", "舅舅"],
  "외숙모": ["maternal uncle's wife", "舅妈"],
  "외출하다": ["to go out", "外出"],
  "외할머니": ["maternal grandmother", "外婆"],
  "외할아버지": ["maternal grandfather", "外公"],
  "외국어": ["foreign language", "外语"],
  "요르단": ["Jordan", "约旦"],
  "우리": ["we, our", "我们、我们的"],
  "이상하다": ["to be strange", "奇怪"],
  "이해": ["understanding", "理解"],
  "정리하다": ["to organize, to arrange", "整理"],
  "정말": ["really, truly", "真的"],
  "정거장": ["station, bus stop", "车站"],
  "정보": ["information", "信息"],
  "제가": ["I, me (polite subject)", "我"],
  "조사하다": ["to investigate, to survey", "调查"],
  "조선": ["Joseon, Korea", "朝鲜"],
  "조선말": ["Korean language", "朝鲜语"],
  "조선어": ["Korean language", "朝鲜语"],
  "조심하다": ["to be careful", "小心"],
  "좀더": ["a little more", "再多一点"],
  "종로": ["Jongno", "钟路"],
  "종일": ["all day", "整天"],
  "주": ["week, state, province", "周、州"],
  "주머니": ["pocket", "口袋"],
  "차": ["car, tea", "车、茶"],
  "페이지": ["page", "页"]
};

function applyTopikMeaningFixes() {
  decks = decks.map((deck) => {
    if (deck.id !== "topik-basic") return deck;
    return {
      ...deck,
      words: deck.words.map((word) => {
        const fix = topikMeaningFixes[word.term];
        if (!fix) return word;
        const [meaningEn, meaningZh] = fix;
        const fixedWord = {
          ...word,
          meaning: word.meaning || meaningEn,
          meaningEn: meaningEn,
          meaningZh: word.meaningZh || meaningZh
        };
        if (["개", "급하다", "어렵다", "열다", "불다"].includes(word.term)) {
          fixedWord.meaning = meaningEn;
          fixedWord.meaningZh = meaningZh;
          fixedWord.partOfSpeech = word.term === "개" ? "noun" : word.term === "급하다" || word.term === "어렵다" ? "adjective" : "verb";
        }
        return fixedWord;
      })
    };
  });
}

applyTopikMeaningFixes();

const audioResources = [
  { title: "TOPIK I Daily Dialogue", level: "A1-A2", length: "8 min", note: "Campus, shopping, and directions.", tasks: ["Catch the topic", "Write key words", "Shadow the audio"] },
  { title: "TOPIK II Expository Listening", level: "B1-B2", length: "13 min", note: "Culture, society, and technology.", tasks: ["Mark connectors", "Summarize the view", "Retell for 60 seconds"] },
  { title: "IELTS Part 3 Discussion", level: "B2-C1", length: "10 min", note: "Opinion, examples, and counterpoints.", tasks: ["Record opinion phrases", "Collect paraphrases", "Imitate answers"] },
  { title: "PTE Repeat Sentence Drill", level: "B1-C1", length: "6 min", note: "Short-term memory and exact repetition.", tasks: ["Repeat fully", "Check missing words", "Practice stress"] }
];

const papers = [
  { title: "TOPIK I Past Paper 83", category: "Korean", status: "Listening + Reading", plan: ["Timed listening", "Sort mistakes", "Add new words to deck"] },
  { title: "TOPIK II Past Paper 90", category: "Korean", status: "Reading + Writing", plan: ["Start with main ideas", "Collect connectors", "Review frequent nouns"] },
  { title: "IELTS Academic Reading Set", category: "English", status: "3 passages", plan: ["20 minutes per passage", "Mark location words", "Collect paraphrases"] },
  { title: "PTE Speaking Mock Set", category: "English", status: "Read Aloud + Retell", plan: ["Record once", "Check fluency", "Improve stress"] }
];

const ui = {
  zh: {
    navDictionary: "单词岛",
    navStudy: "闯关",
    navArticle: "故事",
    navListening: "听一听",
    navPapers: "任务",
    navStats: "星星",
    navMyWords: "贴纸册",
    myWordsTitle: "我的贴纸单词",
    myWordsText: "看看小狮子陪你收集了哪些新单词。",
    filterDeck: "按词库筛选",
    filterStatus: "按状态筛选",
    heroEyebrow: "小狮子语言乐园",
    heroTitle: "和可爱小狮子一起学英语、韩语。",
    heroBody: "每天玩单词游戏、跟读句子、听小任务，完成后收集星星和贴纸。",
    directionLabel: "今天想学",
    startLearning: "开始闯关",
    generateStory: "生成故事",
    buildToday: "生成今日任务",
    todayCards: "今日任务",
    dueReview: "复习星球",
    papersDue: "小任务",
    levelRange: "年龄",
    chooseDeck: "选择单词岛",
    importCsv: "导入 CSV 词库",
    downloadTemplate: "下载模板",
    cacheOffline: "缓存离线学习",
    offlineReady: "已可离线学习",
    offlineOnline: "在线：可更新缓存",
    offlineOffline: "离线：正在使用本地缓存",
    offlineSaved: "离线学习内容已缓存",
    all: "全部",
    search: "搜索",
    dailyNew: "每日新词",
    immersiveStudy: "小狮子闯关",
    backDictionary: "返回单词岛",
    reviewDue: "复习星星",
    finishToday: "收下奖励",
    writtenPractice: "跟读和拼写",
    newPrompt: "换一题",
    check: "检查",
    speak: "听一听",
    storyTitle: "小狮子故事",
    storyText: "用今天学过的单词生成一段适合孩子朗读的小故事。",
    storyLanguage: "故事语言",
    scenario: "场景",
    readAloud: "朗读短文",
    pauseReading: "暂停",
    continueReading: "继续",
    enterWordsForStory: "或输入单词来生成短文",
    listeningTraining: "听力小任务",
    pastPapers: "趣味任务",
    podcastText: "把音频节目变成孩子每天能完成的听力小游戏。",
    preview: "预览",
    remembered: "记住了",
    fuzzy: "模糊",
    unknown: "不认识",
    chooseMeaning: "帮小狮子选出正确含义。",
    chooseFirst: "先选答案，再看小狮子的提示。",
    correct: "太棒了，得到一颗星。",
    wrong: "差一点。正确答案：",
    example: "例句",
    synonyms: "近义词",
    antonyms: "反义词",
    partOfSpeech: "词性",
    source: "来源",
    definition: "释义",
    simpleExamples: "简单",
    advancedExamples: "进阶",
    listenFirst: "先听音",
    showChoices: "显示选项",
    noQueue: "暂无可学单词。",
    noQueueHint: "请从单词岛生成今日任务，或导入自己的 CSV 单词卡。",
    summary: (today, review, goal) => `今日 ${today} 个任务，${review} 个复习星星。每日目标 ${goal} 个。`,
    modeLabel: "随机小挑战",
    deckImported: (deckCount, wordCount) => `已导入 ${deckCount} 个词典，${wordCount} 个词。`,
    noImport: "没有找到 term 字段，请检查模板。"
  },
  en: {
    navDictionary: "Word Island",
    navStudy: "Quest",
    navArticle: "Story",
    navListening: "Listen",
    navPapers: "Missions",
    navStats: "Stars",
    navMyWords: "Stickers",
    myWordsTitle: "Sticker words",
    myWordsText: "Track the words your little lion buddy helped you collect.",
    filterDeck: "Filter by deck",
    filterStatus: "Filter by status",
    heroEyebrow: "Little lion language club",
    heroTitle: "Learn English and Korean with a cute lion buddy.",
    heroBody: "Play word games, listen, speak, and collect stars every day.",
    directionLabel: "Learn today",
    startLearning: "Start quest",
    generateStory: "Make story",
    buildToday: "Build mission",
    todayCards: "Missions",
    dueReview: "Review stars",
    papersDue: "Tasks",
    levelRange: "Age",
    chooseDeck: "Choose island",
    importCsv: "Import CSV deck",
    downloadTemplate: "Download template",
    cacheOffline: "Cache offline",
    offlineReady: "Ready for offline study",
    offlineOnline: "Online: cache can update",
    offlineOffline: "Offline: using local cache",
    offlineSaved: "Offline study content cached",
    all: "All",
    search: "Search",
    dailyNew: "Daily new",
    immersiveStudy: "Lion quest",
    backDictionary: "Back",
    reviewDue: "Review stars",
    finishToday: "Get reward",
    writtenPractice: "Say and spell",
    newPrompt: "New prompt",
    check: "Check",
    speak: "Listen",
    storyTitle: "Lion story",
    storyText: "Generate a kid-friendly story from selected or reviewed words.",
    storyLanguage: "Story language",
    scenario: "Scenario",
    readAloud: "Read aloud",
    pauseReading: "Pause",
    continueReading: "Continue",
    enterWordsForStory: "Or type words to build a story",
    listeningTraining: "Listening games",
    pastPapers: "Fun missions",
    podcastText: "Turn audio episodes into small daily listening games.",
    preview: "Preview",
    remembered: "Remembered",
    fuzzy: "Fuzzy",
    unknown: "Don't know",
    chooseMeaning: "Help the lion choose the right meaning.",
    chooseFirst: "Choose first, then read the lion tip below.",
    correct: "Great! You earned a star.",
    wrong: "Almost. Correct answer:",
    example: "Example",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
    partOfSpeech: "Part of speech",
    source: "Source",
    definition: "Definition",
    simpleExamples: "Simple",
    advancedExamples: "Advanced",
    listenFirst: "Listen first",
    showChoices: "Show choices",
    noQueue: "No words are due.",
    noQueueHint: "Build today's mission from Word Island, or import your own CSV cards.",
    summary: (today, review, goal) => `${today} missions today, ${review} review stars. Goal ${goal}.`,
    modeLabel: "Random mini quest",
    deckImported: (deckCount, wordCount) => `Imported ${deckCount} decks, ${wordCount} words.`,
    noImport: "No term field found. Check the template."
  },
  ko: {
    navDictionary: "단어섬",
    navStudy: "퀘스트",
    navArticle: "이야기",
    navListening: "듣기놀이",
    navPapers: "미션",
    navStats: "별",
    navMyWords: "스티커",
    myWordsTitle: "스티커 단어",
    myWordsText: "작은 사자 친구와 모은 단어를 확인합니다.",
    filterDeck: "단어장별 필터",
    filterStatus: "상태별 필터",
    heroEyebrow: "작은 사자 언어 놀이터",
    heroTitle: "귀여운 사자 친구와 영어, 한국어를 배워요.",
    heroBody: "단어 게임, 듣기, 따라 말하기를 하고 매일 별과 스티커를 모아요.",
    directionLabel: "오늘 배울 것",
    startLearning: "퀘스트 시작",
    generateStory: "이야기 만들기",
    buildToday: "오늘 미션 만들기",
    todayCards: "오늘 미션",
    dueReview: "복습 별",
    papersDue: "미션",
    levelRange: "나이",
    chooseDeck: "단어섬 선택",
    importCsv: "CSV 단어장 가져오기",
    downloadTemplate: "템플릿 받기",
    cacheOffline: "오프라인 저장",
    offlineReady: "오프라인 학습 준비됨",
    offlineOnline: "온라인: 캐시 업데이트 가능",
    offlineOffline: "오프라인: 로컬 캐시 사용 중",
    offlineSaved: "오프라인 학습 콘텐츠를 저장했습니다",
    all: "전체",
    search: "검색",
    dailyNew: "하루 단어",
    immersiveStudy: "사자 퀘스트",
    backDictionary: "돌아가기",
    reviewDue: "복습 별",
    finishToday: "보상 받기",
    writtenPractice: "말하고 쓰기",
    newPrompt: "새 문제",
    check: "확인",
    speak: "듣기",
    storyTitle: "사자 이야기",
    storyText: "선택한 단어로 아이가 읽기 좋은 짧은 이야기를 만듭니다.",
    storyLanguage: "글 언어",
    scenario: "상황",
    readAloud: "글 읽기",
    pauseReading: "멈춤",
    continueReading: "계속",
    enterWordsForStory: "또는 단어를 입력해 글 만들기",
    listeningTraining: "듣기 놀이",
    pastPapers: "재미 미션",
    podcastText: "오디오를 매일 할 수 있는 작은 듣기 놀이로 바꿉니다.",
    preview: "미리보기",
    remembered: "기억해요",
    fuzzy: "헷갈려요",
    unknown: "몰라요",
    chooseMeaning: "사자가 맞는 뜻을 고를 수 있게 도와주세요.",
    chooseFirst: "먼저 고르고 사자의 힌트를 확인하세요.",
    correct: "좋아요! 별을 하나 얻었어요.",
    wrong: "거의 맞았어요. 정답:",
    example: "예문",
    synonyms: "유의어",
    antonyms: "반의어",
    partOfSpeech: "품사",
    source: "출처",
    definition: "뜻",
    simpleExamples: "쉬운 예문",
    advancedExamples: "심화 예문",
    listenFirst: "먼저 듣기",
    showChoices: "선택지 보기",
    noQueue: "오늘 학습할 단어가 없습니다.",
    noQueueHint: "단어섬에서 오늘 미션을 만들거나 CSV 단어 카드를 가져오세요.",
    summary: (today, review, goal) => `오늘 미션 ${today}개, 복습 별 ${review}개. 목표 ${goal}개.`,
    modeLabel: "랜덤 미니 퀘스트",
    deckImported: (deckCount, wordCount) => `${deckCount}개 단어장, ${wordCount}개 단어를 가져왔습니다.`,
    noImport: "term 필드를 찾지 못했습니다. 템플릿을 확인하세요."
  }
};

const termInfo = {
  "학교": { en: "school", ko: "학교", posEn: "noun", posKo: "명사" },
  "공부하다": { en: "to study", ko: "공부하다", posEn: "verb", posKo: "동사" },
  "친구": { en: "friend", ko: "친구", posEn: "noun", posKo: "명사" },
  "시간": { en: "time", ko: "시간", posEn: "noun", posKo: "명사" },
  "책": { en: "book", ko: "책", posEn: "noun", posKo: "명사" },
  "가족": { en: "family", ko: "가족", posEn: "noun", posKo: "명사" },
  "음식": { en: "food", ko: "음식", posEn: "noun", posKo: "명사" },
  "운동하다": { en: "to exercise", ko: "운동하다", posEn: "verb", posKo: "동사" },
  "날씨": { en: "weather", ko: "날씨", posEn: "noun", posKo: "명사" },
  "여행": { en: "travel", ko: "여행", posEn: "noun", posKo: "명사" },
  "사랑": { en: "love", ko: "사랑", posEn: "noun", posKo: "명사" },
  "생각하다": { en: "to think", ko: "생각하다", posEn: "verb", posKo: "동사" },
  "환경": { en: "environment", ko: "환경", posEn: "noun", posKo: "명사" },
  "발전하다": { en: "to develop", ko: "발전하다", posEn: "verb", posKo: "동사" },
  "영향": { en: "influence", ko: "영향", posEn: "noun", posKo: "명사" },
  "해결책": { en: "solution", ko: "해결책", posEn: "noun", posKo: "명사" },
  "경쟁": { en: "competition", ko: "경쟁", posEn: "noun", posKo: "명사" },
  "다양성": { en: "diversity", ko: "다양성", posEn: "noun", posKo: "명사" },
  "소통": { en: "communication", ko: "소통", posEn: "noun", posKo: "명사" },
  "기술": { en: "technology", ko: "기술", posEn: "noun", posKo: "명사" },
  "인식": { en: "awareness", ko: "인식", posEn: "noun", posKo: "명사" },
  "경제": { en: "economy", ko: "경제", posEn: "noun", posKo: "명사" },
  "복지": { en: "welfare", ko: "복지", posEn: "noun", posKo: "명사" },
  "지속하다": { en: "to continue", ko: "지속하다", posEn: "verb", posKo: "동사" },
  "회의": { en: "meeting", ko: "회의", posEn: "noun", posKo: "명사" },
  "견적서": { en: "quotation", ko: "견적서", posEn: "noun", posKo: "명사" },
  "담당자": { en: "person in charge", ko: "담당자", posEn: "noun", posKo: "명사" },
  "일정": { en: "schedule", ko: "일정", posEn: "noun", posKo: "명사" },
  "계약": { en: "contract", ko: "계약", posEn: "noun", posKo: "명사" },
  "매출": { en: "sales", ko: "매출", posEn: "noun", posKo: "명사" },
  "고객": { en: "customer", ko: "고객", posEn: "noun", posKo: "명사" },
  "협력": { en: "cooperation", ko: "협력", posEn: "noun", posKo: "명사" },
  "보고서": { en: "report", ko: "보고서", posEn: "noun", posKo: "명사" },
  "전략": { en: "strategy", ko: "전략", posEn: "noun", posKo: "명사" },
  "투자": { en: "investment", ko: "투자", posEn: "noun", posKo: "명사" },
  "발표": { en: "presentation", ko: "발표", posEn: "noun", posKo: "명사" },
  sustainable: { en: "sustainable", ko: "지속 가능한", posEn: "adjective", posKo: "형용사" },
  evidence: { en: "evidence", ko: "증거", posEn: "noun", posKo: "명사" },
  significant: { en: "significant", ko: "중요한", posEn: "adjective", posKo: "형용사" },
  perspective: { en: "perspective", ko: "관점", posEn: "noun", posKo: "명사" },
  consequently: { en: "consequently", ko: "따라서", posEn: "adverb", posKo: "부사" },
  fundamental: { en: "fundamental", ko: "근본적인", posEn: "adjective", posKo: "형용사" },
  comprehensive: { en: "comprehensive", ko: "포괄적인", posEn: "adjective", posKo: "형용사" },
  phenomenon: { en: "phenomenon", ko: "현상", posEn: "noun", posKo: "명사" },
  ultimately: { en: "ultimately", ko: "결국", posEn: "adverb", posKo: "부사" },
  nevertheless: { en: "nevertheless", ko: "그럼에도 불구하고", posEn: "adverb", posKo: "부사" },
  paradigm: { en: "paradigm", ko: "패러다임", posEn: "noun", posKo: "명사" },
  revolutionize: { en: "revolutionize", ko: "혁명적으로 바꾸다", posEn: "verb", posKo: "동사" },
  lecture: { en: "lecture", ko: "강의", posEn: "noun", posKo: "명사" },
  summarize: { en: "summarize", ko: "요약하다", posEn: "verb", posKo: "동사" },
  accurate: { en: "accurate", ko: "정확한", posEn: "adjective", posKo: "형용사" },
  resource: { en: "resource", ko: "자료", posEn: "noun", posKo: "명사" },
  demonstrate: { en: "demonstrate", ko: "보여주다", posEn: "verb", posKo: "동사" },
  analyze: { en: "analyze", ko: "분석하다", posEn: "verb", posKo: "동사" },
  essential: { en: "essential", ko: "필수적인", posEn: "adjective", posKo: "형용사" },
  contribution: { en: "contribution", ko: "기여", posEn: "noun", posKo: "명사" },
  evaluate: { en: "evaluate", ko: "평가하다", posEn: "verb", posKo: "동사" },
  proportion: { en: "proportion", ko: "비율", posEn: "noun", posKo: "명사" },
  interpret: { en: "interpret", ko: "해석하다", posEn: "verb", posKo: "동사" },
  distinction: { en: "distinction", ko: "차이", posEn: "noun", posKo: "명사" }
};

const reviewIntervals = [3, 7, 14, 30];

let activeLanguage = "all";
let activeDeckId = decks[0].id;
let studyMode = "today";
let studyIndex = 0;
let quizWord = null;
let currentPracticeMode = "meaning-to-term";
let activeInfoTab = "example";
let audioOnlyMode = false;
let practiceIndex = 0;
let availableVoices = [];
let todaySessionTotal = 0;
let todaySessionDone = 0;
let reviewSessionTotal = 0;
let reviewSessionDone = 0;

const topikRelations = {
  "가게": { synonyms: ["상점", "매장"], antonyms: [] },
  "가격": { synonyms: ["값", "금액"], antonyms: [] },
  "가깝다": { synonyms: ["근접하다", "멀지 않다"], antonyms: ["멀다"] },
  "가끔": { synonyms: ["때때로", "종종"], antonyms: ["항상", "늘"] },
  "가다": { synonyms: ["이동하다", "향하다"], antonyms: ["오다"] },
  "가르치다": { synonyms: ["교육하다", "알려 주다"], antonyms: ["배우다"] },
  "가볍다": { synonyms: ["무겁지 않다"], antonyms: ["무겁다"] },
  "가수": { synonyms: ["노래하는 사람"], antonyms: [] },
  "가족": { synonyms: ["식구", "가정"], antonyms: ["남"] },
  "가지다": { synonyms: ["소유하다", "갖다"], antonyms: ["잃다"] },
  "간단하다": { synonyms: ["쉽다", "단순하다"], antonyms: ["복잡하다", "어렵다"] },
  "감사하다": { synonyms: ["고마워하다"], antonyms: [] },
  "갑자기": { synonyms: ["문득", "느닷없이"], antonyms: ["천천히"] },
  "같다": { synonyms: ["동일하다", "비슷하다"], antonyms: ["다르다"] },
  "같이": { synonyms: ["함께", "더불어"], antonyms: ["혼자"] },
  "거의": { synonyms: ["대부분", "대체로"], antonyms: ["전혀"] },
  "걱정": { synonyms: ["근심", "염려"], antonyms: ["안심"] },
  "건강하다": { synonyms: ["튼튼하다"], antonyms: ["아프다", "약하다"] },
  "걷다": { synonyms: ["걸어가다"], antonyms: ["뛰다"] },
  "검은색": { synonyms: ["검정색"], antonyms: ["흰색"] },
  "계획": { synonyms: ["예정", "일정"], antonyms: [] },
  "공부": { synonyms: ["학습"], antonyms: ["놀이"] },
  "공부하다": { synonyms: ["배우다", "학습하다"], antonyms: ["놀다"] },
  "괜찮다": { synonyms: ["문제없다", "좋다"], antonyms: ["나쁘다"] },
  "교실": { synonyms: ["강의실"], antonyms: [] },
  "구경": { synonyms: ["관람", "둘러보기"], antonyms: [] },
  "기다리다": { synonyms: ["대기하다"], antonyms: [] },
  "기분": { synonyms: ["마음", "감정"], antonyms: [] },
  "길다": { synonyms: ["오래다"], antonyms: ["짧다"] },
  "깨끗하다": { synonyms: ["청결하다"], antonyms: ["더럽다"] },
  "끝나다": { synonyms: ["마치다", "종료되다"], antonyms: ["시작하다"] },
  "나쁘다": { synonyms: ["좋지 않다"], antonyms: ["좋다"] },
  "낮다": { synonyms: ["높지 않다"], antonyms: ["높다"] },
  "넓다": { synonyms: ["크다"], antonyms: ["좁다"] },
  "놀다": { synonyms: ["쉬다", "즐기다"], antonyms: ["공부하다", "일하다"] },
  "높다": { synonyms: ["크다"], antonyms: ["낮다"] },
  "느리다": { synonyms: ["더디다"], antonyms: ["빠르다"] },
  "늦다": { synonyms: ["지각하다"], antonyms: ["이르다", "빠르다"] },
  "다르다": { synonyms: ["차이나다"], antonyms: ["같다"] },
  "다시": { synonyms: ["또", "한 번 더"], antonyms: [] },
  "닫다": { synonyms: ["폐쇄하다"], antonyms: ["열다"] },
  "덥다": { synonyms: ["뜨겁다"], antonyms: ["춥다"] },
  "도착": { synonyms: ["도달"], antonyms: ["출발"] },
  "돕다": { synonyms: ["도와주다"], antonyms: ["방해하다"] },
  "되다": { synonyms: ["이루어지다"], antonyms: [] },
  "듣다": { synonyms: ["청취하다"], antonyms: ["말하다"] },
  "따뜻하다": { synonyms: ["온화하다"], antonyms: ["춥다"] },
  "뜨겁다": { synonyms: ["덥다"], antonyms: ["차갑다"] },
  "마지막": { synonyms: ["끝", "최종"], antonyms: ["처음"] },
  "만나다": { synonyms: ["마주치다"], antonyms: ["헤어지다"] },
  "많다": { synonyms: ["풍부하다"], antonyms: ["적다"] },
  "맛있다": { synonyms: ["맛이 좋다"], antonyms: ["맛없다"] },
  "멀다": { synonyms: ["떨어져 있다"], antonyms: ["가깝다"] },
  "모르다": { synonyms: ["알지 못하다"], antonyms: ["알다"] },
  "무겁다": { synonyms: ["묵직하다"], antonyms: ["가볍다"] },
  "바꾸다": { synonyms: ["교체하다", "변경하다"], antonyms: ["유지하다"] },
  "바쁘다": { synonyms: ["분주하다"], antonyms: ["한가하다"] },
  "받다": { synonyms: ["얻다", "수령하다"], antonyms: ["주다"] },
  "배우다": { synonyms: ["익히다", "공부하다"], antonyms: ["가르치다"] },
  "보내다": { synonyms: ["부치다", "전송하다"], antonyms: ["받다"] },
  "보다": { synonyms: ["구경하다", "살펴보다"], antonyms: [] },
  "복잡하다": { synonyms: ["어수선하다"], antonyms: ["간단하다"] },
  "비싸다": { synonyms: ["가격이 높다"], antonyms: ["싸다"] },
  "빠르다": { synonyms: ["신속하다"], antonyms: ["느리다"] },
  "빨리": { synonyms: ["어서", "급히"], antonyms: ["천천히"] },
  "사다": { synonyms: ["구입하다"], antonyms: ["팔다"] },
  "사람": { synonyms: ["인간"], antonyms: [] },
  "사랑": { synonyms: ["애정", "정"], antonyms: ["미움"] },
  "살다": { synonyms: ["생활하다"], antonyms: ["죽다"] },
  "생각": { synonyms: ["의견", "사고"], antonyms: [] },
  "서다": { synonyms: ["일어서다"], antonyms: ["앉다"] },
  "선물": { synonyms: ["증정품"], antonyms: [] },
  "쉽다": { synonyms: ["간단하다"], antonyms: ["어렵다"] },
  "슬프다": { synonyms: ["서글프다"], antonyms: ["기쁘다", "즐겁다"] },
  "시작": { synonyms: ["출발", "개시"], antonyms: ["끝", "마지막"] },
  "싫다": { synonyms: ["좋지 않다"], antonyms: ["좋다"] },
  "쓰다": { synonyms: ["작성하다", "사용하다"], antonyms: ["읽다"] },
  "아름답다": { synonyms: ["예쁘다"], antonyms: ["못생기다"] },
  "아프다": { synonyms: ["몸이 좋지 않다"], antonyms: ["건강하다"] },
  "앉다": { synonyms: ["자리에 있다"], antonyms: ["서다"] },
  "알다": { synonyms: ["이해하다"], antonyms: ["모르다"] },
  "앞": { synonyms: ["전면"], antonyms: ["뒤"] },
  "어렵다": { synonyms: ["힘들다"], antonyms: ["쉽다"] },
  "열다": { synonyms: ["개방하다"], antonyms: ["닫다"] },
  "예쁘다": { synonyms: ["아름답다"], antonyms: ["못생기다"] },
  "오다": { synonyms: ["도착하다"], antonyms: ["가다"] },
  "오래": { synonyms: ["길게"], antonyms: ["잠깐"] },
  "오른쪽": { synonyms: ["우측"], antonyms: ["왼쪽"] },
  "울다": { synonyms: ["눈물을 흘리다"], antonyms: ["웃다"] },
  "웃다": { synonyms: ["미소 짓다"], antonyms: ["울다"] },
  "위": { synonyms: ["위쪽"], antonyms: ["아래"] },
  "위험": { synonyms: ["위기"], antonyms: ["안전"] },
  "이름": { synonyms: ["성명"], antonyms: [] },
  "일찍": { synonyms: ["빨리"], antonyms: ["늦게"] },
  "읽다": { synonyms: ["독서하다"], antonyms: ["쓰다"] },
  "잃다": { synonyms: ["분실하다"], antonyms: ["찾다"] },
  "잊다": { synonyms: ["기억하지 못하다"], antonyms: ["기억하다"] },
  "자다": { synonyms: ["잠을 자다"], antonyms: ["깨다"] },
  "작다": { synonyms: ["조그맣다"], antonyms: ["크다"] },
  "잘하다": { synonyms: ["능숙하다"], antonyms: ["못하다"] },
  "재미있다": { synonyms: ["흥미롭다"], antonyms: ["재미없다"] },
  "적다": { synonyms: ["많지 않다"], antonyms: ["많다"] },
  "조용하다": { synonyms: ["고요하다"], antonyms: ["시끄럽다"] },
  "좋다": { synonyms: ["괜찮다", "훌륭하다"], antonyms: ["나쁘다", "싫다"] },
  "주다": { synonyms: ["건네다"], antonyms: ["받다"] },
  "죽다": { synonyms: ["사망하다"], antonyms: ["살다"] },
  "즐겁다": { synonyms: ["기쁘다", "행복하다"], antonyms: ["슬프다"] },
  "지금": { synonyms: ["현재"], antonyms: ["나중"] },
  "찾다": { synonyms: ["발견하다", "검색하다"], antonyms: ["잃다"] },
  "처음": { synonyms: ["시작"], antonyms: ["마지막"] },
  "천천히": { synonyms: ["느리게"], antonyms: ["빨리"] },
  "춥다": { synonyms: ["차갑다"], antonyms: ["덥다", "따뜻하다"] },
  "크다": { synonyms: ["커다랗다"], antonyms: ["작다"] },
  "켜다": { synonyms: ["작동시키다"], antonyms: ["끄다"] },
  "팔다": { synonyms: ["판매하다"], antonyms: ["사다"] },
  "편하다": { synonyms: ["안락하다", "쉽다"], antonyms: ["불편하다"] },
  "필요하다": { synonyms: ["요구되다"], antonyms: ["불필요하다"] },
  "하다": { synonyms: ["실행하다"], antonyms: [] },
  "학교": { synonyms: ["교실", "캠퍼스"], antonyms: ["집"] },
  "친구": { synonyms: ["벗", "동료"], antonyms: ["낯선 사람"] },
  "시간": { synonyms: ["때", "기간"], antonyms: ["순간"] },
  "책": { synonyms: ["도서", "교재"], antonyms: [] },
  "가족": { synonyms: ["식구", "친척"], antonyms: ["타인"] },
  "음식": { synonyms: ["요리", "식사"], antonyms: [] },
  "날씨": { synonyms: ["기후", "일기"], antonyms: [] },
  "여행": { synonyms: ["관광", "나들이"], antonyms: ["귀가"] },
  "항상": { synonyms: ["늘", "언제나"], antonyms: ["가끔"] },
  "행복": { synonyms: ["기쁨"], antonyms: ["불행"] },
  "행복하다": { synonyms: ["즐겁다"], antonyms: ["슬프다", "불행하다"] },
  "혼자": { synonyms: ["홀로"], antonyms: ["함께"] },
  "힘들다": { synonyms: ["어렵다", "고되다"], antonyms: ["쉽다"] }
};

const state = loadState();
decks = mergeImportedDecks(decks, state.importedDecks);
let dailyGoal = state.dailyGoal || 20;
let learningDirection = state.learningDirection || "ko";
let wordProgress = state.wordProgress || {};
activeDeckId = getTargetDecks()[0]?.id || decks[0]?.id || activeDeckId;
let todayWords = state.todayWords.length ? hydrateWords(state.todayWords).filter((word) => word.language === getTargetLanguage() && decks.some((deck) => deck.title === word.deckTitle)) : makeDailyWords();
if (!todayWords.length) todayWords = makeDailyWords();
let reviewWords = hydrateWords(state.reviewWords).filter((word) => word.language === getTargetLanguage() && decks.some((deck) => deck.title === word.deckTitle) && !isMastered(word) && isDue(word));
todaySessionTotal = state.todaySessionTotal || todayWords.length || dailyGoal;
todaySessionDone = Math.min(state.todaySessionDone || 0, todaySessionTotal);
reviewSessionTotal = state.reviewSessionTotal || reviewWords.length;
reviewSessionDone = Math.min(state.reviewSessionDone || 0, reviewSessionTotal);

const deckList = document.querySelector("#deckList");
const wordGrid = document.querySelector("#wordGrid");
const wordSearch = document.querySelector("#wordSearch");
const activeDeckType = document.querySelector("#activeDeckType");
const activeDeckTitle = document.querySelector("#activeDeckTitle");
const activeDeckDescription = document.querySelector("#activeDeckDescription");
const todayCount = document.querySelector("#todayCount");
const reviewCount = document.querySelector("#reviewCount");
const generatedArticle = document.querySelector("#generatedArticle");
const dailyGoalSelect = document.querySelector("#dailyGoal");
const focusCard = document.querySelector("#focusCard");
const quizPrompt = document.querySelector("#quizPrompt");
const quizAnswer = document.querySelector("#quizAnswer");
const quizFeedback = document.querySelector("#quizFeedback");
const importStatus = document.querySelector("#importStatus");
const practiceModeLabel = document.querySelector("#practiceModeLabel");
const learningDirectionSelect = document.querySelector("#learningDirection");
const offlineStatus = document.querySelector("#offlineStatus");

dailyGoalSelect.value = String(dailyGoal);
learningDirectionSelect.value = learningDirection;

function loadState() {
  const fallback = { dailyGoal: 20, importedDecks: [], todayWords: [], reviewWords: [], lastCompletedDate: "", learningDirection: "ko", wordProgress: {}, todaySessionTotal: 0, todaySessionDone: 0, reviewSessionTotal: 0, reviewSessionDone: 0 };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch {
    return fallback;
  }
}

function saveState() {
  const importedDecks = decks.filter((deck) => deck.imported);
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      dailyGoal,
      learningDirection,
      wordProgress,
      importedDecks,
      todayWords,
      reviewWords,
      todaySessionTotal,
      todaySessionDone,
      reviewSessionTotal,
      reviewSessionDone,
      lastCompletedDate: state.lastCompletedDate
    })
  );
}

function updateOfflineStatus() {
  if (!offlineStatus) return;
  offlineStatus.textContent = navigator.onLine ? t("offlineOnline") : t("offlineOffline");
  offlineStatus.classList.toggle("offline", !navigator.onLine);
}

async function cacheOfflineStudy() {
  if (!("serviceWorker" in navigator) || !("caches" in window)) {
    showToast("Offline cache is not supported in this browser.");
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
    const cache = await caches.open("lionlingo-offline-v22");
    await cache.addAll([
      "/",
      "/index.html",
      "/styles.css",
      "/vocabulary-data.js?v=learning-flow-v6",
      "/vocabulary-topik-i.js?v=learning-flow-v6",
      "/app.js?v=learning-flow-v6",
      "/manifest.webmanifest",
      "/vocabulary-template.csv",
      "/assets/lionlingo-hero-scene.png",
      "/assets/lionlingo-mascot-hero.png",
      "/assets/lionlingo-kids-ui.png"
    ]);
    updateOfflineStatus();
    showToast(t("offlineSaved"));
  } catch {
    showToast("Offline cache failed. Refresh and try again.");
  }
}

function mergeImportedDecks(baseDecks, importedDecks = []) {
  const knownIds = new Set(baseDecks.map((deck) => deck.id));
  return [...baseDecks, ...importedDecks.filter((deck) => deck.language !== "ko" && !knownIds.has(deck.id))];
}

function getAllWords() {
  return decks.flatMap((deck) => deck.words.map((word) => ({ ...word, deckTitle: deck.title, deckType: deck.type, language: deck.language })));
}

function getTargetDecks() {
  return decks.filter((deck) => deck.language === getTargetLanguage());
}

function getTargetLanguage() {
  return learningDirection === "en" || learningDirection === "zh-en" ? "en" : "ko";
}

function getUiLang() {
  if (learningDirection.startsWith("zh")) return "zh";
  return learningDirection === "en" ? "ko" : "en";
}

function t(key, ...args) {
  const value = ui[getUiLang()][key] || ui.en[key] || key;
  return typeof value === "function" ? value(...args) : value;
}

function wordKey(word) {
  return `${word.deckTitle || word.deckType || "deck"}::${word.term}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isDue(word) {
  const progress = wordProgress[wordKey(word)];
  if (!progress || !progress.nextDue) return true;
  if (progress.mastered) return false;
  return progress.nextDue <= todayDate();
}

function isMastered(word) {
  return Boolean(wordProgress[wordKey(word)]?.mastered);
}

function meaningFor(word) {
  const info = termInfo[word.term] || {};
  if (learningDirection.startsWith("zh")) return word.meaning || info.zh || word.meaningEn || info.en || word.meaningKo || info.ko || word.term;
  if (getTargetLanguage() === "ko") return word.meaningEn || info.en || word.meaning || word.term;
  return word.meaningKo || info.ko || word.meaning || word.term;
}

function quizMeaningFor(word) {
  if (word.language === "ko") return word.meaningEn || word.meaning || termInfo[word.term]?.en || "";
  return word.meaning || word.meaningEn || termInfo[word.term]?.en || "";
}

function cleanQuizMeaning(meaning) {
  return String(meaning || "").replace(/\s+/g, " ").trim();
}

function isUsableQuizMeaning(meaning, term = "") {
  const value = cleanQuizMeaning(meaning);
  return Boolean(
    value &&
      value !== term &&
      !/^n\/?a$/i.test(value) &&
      value !== "?" &&
      !/[가-힣]/.test(value) &&
      !value.startsWith("Korean hint:") &&
      !value.startsWith("POS:")
  );
}

function isPublicTopikWord(word) {
  return word.deckTitle === "TOPIK I Public Vocabulary A Level" || word.deckType === "TOPIK I public list";
}

function hasReliableMeaning(word) {
  return isUsableQuizMeaning(quizMeaningFor(word), word.term);
}

function displayMeaningFor(word) {
  const meaning = meaningFor(word);
  if (!isPublicTopikWord(word)) return meaning;
  return meaning
    .replaceAll("Korean hint:", "韩语提示：")
    .replaceAll("POS:", "词性：")
    .replaceAll("Hanja:", "汉字：")
    .replaceAll(" · ", " · ");
}

function posFor(word) {
  const info = termInfo[word.term] || {};
  if (learningDirection.startsWith("zh")) return word.partOfSpeech || info.posEn || info.posKo || "";
  return getTargetLanguage() === "ko" ? info.posEn || word.partOfSpeech || "" : info.posKo || word.partOfSpeech || "";
}

function localizeDeck(deck) {
  if (deck.language === "ko") {
    return {
      type: deck.type.includes("TOPIK") ? deck.type.replace("初级", "Basic").replace("中高级", "Intermediate") : "Korean Words",
      title: deck.title.replace("初级核心词", "Basic Core").replace("进阶词", "Intermediate").replace("会议与邮件词库", "Meetings and Email"),
      description: "Korean vocabulary deck for structured review."
    };
  }
  return {
    type: deck.type.includes("IELTS") ? "IELTS" : "PTE",
    title: deck.title.replace("高频词", "High Frequency").replace("高频听说词", "Speaking and Listening"),
    description: "English vocabulary deck for structured review."
  };
}

function hydrateWords(words) {
  const allWords = getAllWords();
  return words
    .map((saved) => allWords.find((word) => word.term === saved.term && word.deckTitle === saved.deckTitle) || saved)
    .filter(Boolean);
}

function makeDailyWords() {
  const deck = getActiveDeck().language === getTargetLanguage() ? getActiveDeck() : getTargetDecks()[0] || getActiveDeck();
  activeDeckId = deck.id;
  return deck.words.map((word) => enrichWord(word, deck)).filter((word) => !isMastered(word) && isDue(word)).slice(0, dailyGoal);
}

function enrichWord(word, deck) {
  const relation = topikRelations[word.term] || {};
  return {
    synonyms: [],
    antonyms: [],
    partOfSpeech: "",
    ...word,
    synonyms: uniqueList([...normalizeList(word.synonyms), ...(relation.synonyms || [])]),
    antonyms: uniqueList([...normalizeList(word.antonyms), ...(relation.antonyms || [])]),
    deckTitle: deck.title,
    deckType: deck.type,
    language: deck.language
  };
}

function getActiveDeck() {
  return decks.find((deck) => deck.id === activeDeckId) || decks[0];
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(/[;；|、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueList(items) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

function synonymsFor(word) {
  return uniqueList([...normalizeList(word.synonyms), ...(topikRelations[word.term]?.synonyms || [])]);
}

function antonymsFor(word) {
  return uniqueList([...normalizeList(word.antonyms), ...(topikRelations[word.term]?.antonyms || [])]);
}

function hasRelations(word) {
  return synonymsFor(word).length > 0 || antonymsFor(word).length > 0;
}

function previewWords(words, keyword) {
  if (keyword) return words.slice(0, 6);
  const relationWords = words.filter(hasRelations);
  const primary = shuffle(relationWords).slice(0, 6);
  if (primary.length >= 6) return primary;
  const filler = shuffle(words.filter((word) => !primary.some((item) => item.term === word.term))).slice(0, 6 - primary.length);
  return [...primary, ...filler];
}

function renderDecks() {
  const visibleDecks = decks.filter((deck) => deck.language === getTargetLanguage() && (activeLanguage === "all" || deck.language === activeLanguage));
  deckList.innerHTML = visibleDecks
    .map((deck) => {
      const languageLabel = deck.language === "ko" ? "Korean" : "English";
      const deckText = localizeDeck(deck);
      return `
        <button class="deck-card ${deck.id === activeDeckId ? "active" : ""}" type="button" data-deck="${deck.id}">
          <span class="deck-title">${deckText.title}<span class="tag">${languageLabel}</span></span>
          <span class="deck-meta">${deckText.type} · ${deck.words.length}</span>
        </button>
      `;
    })
    .join("");
}

function renderWords() {
  const deck = getActiveDeck();
  const deckText = localizeDeck(deck);
  const keyword = wordSearch.value.trim().toLowerCase();
  activeDeckType.textContent = deckText.type;
  activeDeckTitle.textContent = deckText.title;
  activeDeckDescription.textContent = deckText.description;

  const words = deck.words.filter((word) => {
    const haystack = `${word.term} ${word.pronunciation} ${meaningFor(word)} ${word.example} ${synonymsFor(word).join(" ")} ${antonymsFor(word).join(" ")}`.toLowerCase();
    return haystack.includes(keyword);
  });

  wordGrid.innerHTML = words.length
    ? previewWords(words, keyword)
        .map((word) => {
          const synonyms = synonymsFor(word);
          const antonyms = antonymsFor(word);
          const relationRows = [
            `<span>${t("synonyms")}: ${synonyms.length ? synonyms.join(", ") : "작성 예정"}</span>`,
            `<span>${t("antonyms")}: ${antonyms.length ? antonyms.join(", ") : "작성 예정"}</span>`
          ].join("");
          return `
            <article class="word-card">
              <div class="word-title">
                <span class="word-main">${word.term}</span>
                <button class="secondary-button compact" type="button" data-study-word="${escapeHtml(word.term)}">${t("startLearning")}</button>
              </div>
              <div class="word-meta">${posFor(word) || "-"} · ${word.pronunciation || "-"}</div>
              <p class="word-meaning">${displayMeaningFor(word)}</p>
              ${word.example ? `<p class="word-example">${word.example}</p>` : ""}
              <div class="word-relations">${relationRows}</div>
            </article>
          `;
        })
        .join("")
    : `<p class="word-example">No matching words.</p>`;
}

function renderResources() {
  document.querySelector("#audioList").innerHTML = audioResources
    .map(
      (item, index) => `
      <article class="resource-item">
        <div class="resource-title">${item.title}<span class="tag">${item.length}</span></div>
        <p>${item.note}</p>
        <div class="resource-actions">
          <span class="tag">${item.level}</span>
          <button class="secondary-button compact" type="button" data-audio="${index}">Open</button>
          <button class="secondary-button compact" type="button" data-add-audio="${index}">Add</button>
        </div>
      </article>
    `
    )
    .join("");

  document.querySelector("#paperList").innerHTML = papers
    .map(
      (paper, index) => `
      <article class="resource-item">
        <div class="resource-title">${paper.title}<span class="tag">${paper.category}</span></div>
        <p>${paper.status}</p>
        <div class="resource-actions">
          <button class="secondary-button compact" type="button" data-paper="${index}">Open</button>
          <button class="secondary-button compact" type="button" data-review-paper="${index}">Review</button>
        </div>
      </article>
    `
    )
    .join("");
}

function updateCounts() {
  if (todayCount) todayCount.textContent = `${todaySessionDone}/${todaySessionTotal || dailyGoal}`;
  if (reviewCount) reviewCount.textContent = reviewWords.length;
  document.querySelector("#studySummary").textContent = `${todaySessionDone}/${todaySessionTotal || dailyGoal} learned today · ${Math.max((todaySessionTotal || dailyGoal) - todaySessionDone, 0)} left`;
  updateProgressBar();
}

function updateProgressBar() {
  const queue = getStudyQueue();
  const total = studyMode === "review" ? reviewSessionTotal || queue.length : todaySessionTotal || dailyGoal;
  const done = studyMode === "review" ? reviewSessionDone : todaySessionDone;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const fill = document.querySelector("#progressFill");
  const label = document.querySelector("#progressLabel");
  const left = document.querySelector("#progressLeft");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = `${done}/${total}`;
  if (left) left.textContent = `${Math.max(total - done, 0)} left`;
}

function addTodayWord(term) {
  const deck = getActiveDeck();
  const word = deck.words.find((item) => item.term === term);
  if (word && !todayWords.some((item) => item.term === term && item.deckTitle === deck.title)) {
    todayWords = [...todayWords, enrichWord(word, deck)];
    updateCounts();
    renderStudyCard();
    saveState();
  }
}

function studySingleWord(term) {
  const deck = getActiveDeck();
  const word = deck.words.find((item) => item.term === term);
  if (!word) return;
  todayWords = [enrichWord(word, deck)];
  todaySessionTotal = 1;
  todaySessionDone = 0;
  studyMode = "today";
  studyIndex = 0;
  activeInfoTab = "example";
  audioOnlyMode = false;
  updateCounts();
  saveState();
  location.hash = "learn";
  enterLearning();
}

function generateTodayWords() {
  const deck = getActiveDeck().language === getTargetLanguage() ? getActiveDeck() : getTargetDecks()[0];
  if (!deck) return;
  activeDeckId = deck.id;
  todayWords = deck.words.map((word) => enrichWord(word, deck)).filter((word) => !isMastered(word) && isDue(word)).slice(0, dailyGoal);
  todaySessionTotal = todayWords.length;
  todaySessionDone = 0;
  studyMode = "today";
  studyIndex = 0;
  updateCounts();
  renderStudyCard();
  newQuizPrompt();
  saveState();
  location.hash = "learn";
  enterLearning();
}

function getStudyQueue() {
  return studyMode === "review" ? reviewWords : todayWords;
}

function renderStudyCard() {
  const queue = getStudyQueue();
  if (!queue.length) {
    const sessionTotal = studyMode === "review" ? reviewSessionTotal : todaySessionTotal;
    const sessionDone = studyMode === "review" ? reviewSessionDone : todaySessionDone;
    const completedSession = sessionTotal > 0 && sessionDone >= sessionTotal;
    focusCard.classList.remove("audio-only");
    if (completedSession) {
      focusCard.innerHTML = `
        <div class="completion-card">
          <img src="assets/lionlingo-mascot-hero.png" alt="LionLingo lion mascot" />
          <p class="eyebrow">${studyMode === "review" ? "Review complete" : "Today's mission complete"}</p>
          <h2>Great job!</h2>
          <p>You learned ${sessionDone}/${sessionTotal} words today. Keep this rhythm.</p>
        </div>
      `;
      return;
    }
    focusCard.innerHTML = `
      <p class="eyebrow">No Words</p>
      <h2>${t("noQueue")}</h2>
      <p>${t("noQueueHint")}</p>
    `;
    return;
  }

  const word = queue[studyIndex % queue.length];
  const synonymList = synonymsFor(word);
  const antonymList = antonymsFor(word);
  const synonyms = synonymList.join(", ") || "작성 예정";
  const antonyms = antonymList.join(", ") || "작성 예정";
  const options = makeMeaningOptions(word, queue);
  const correctMeaning = cleanQuizMeaning(quizMeaningFor(word));
  const canQuizMeaning = hasReliableMeaning(word);
  const sessionTotal = studyMode === "review" ? reviewSessionTotal || queue.length : todaySessionTotal || dailyGoal;
  const sessionDone = studyMode === "review" ? reviewSessionDone : todaySessionDone;
  const displayIndex = Math.min(sessionDone + 1, sessionTotal || queue.length || 1);
  const remaining = Math.max((sessionTotal || queue.length) - sessionDone, 0);
  focusCard.classList.toggle("audio-only", audioOnlyMode);
  focusCard.innerHTML = `
    <div class="focus-layout">
      <div class="word-stage">
        <p class="eyebrow">${studyMode === "review" ? t("reviewDue") : "Words"} · ${displayIndex}/${sessionTotal}</p>
        <button class="term-button" type="button" data-show-definition>
          <span>${word.term}</span>
        </button>
        <p class="focus-pronunciation">${word.pronunciation || "-"}</p>
        <p class="focus-progress-note">${remaining} left today</p>
        <div class="word-definition" id="wordDefinition">
          <strong>${t("definition")}</strong>
          <span>${displayMeaningFor(word)}</span>
        </div>
        <div class="audio-actions">
          <button class="audio-button" type="button" data-speak-word>${t("speak")}</button>
          <button class="audio-button" type="button" data-audio-mode>${audioOnlyMode ? t("showChoices") : t("listenFirst")}</button>
        </div>
      </div>
      <div class="study-reveal">
        ${
          canQuizMeaning
            ? `<p class="quiz-instruction">${t("chooseMeaning")}</p>
              <div class="choice-grid" data-correct="${escapeHtml(correctMeaning)}">
                ${options
                  .map(
                    (option) => `
                    <button class="choice-button" type="button" data-choice="${escapeHtml(option)}">
                      ${option}
                    </button>
                  `
                  )
                  .join("")}
              </div>
              <p class="choice-feedback" id="choiceFeedback">${t("chooseFirst")}</p>`
            : `<p class="quiz-instruction">这个公开词表没有中文释义，先听发音、看韩语提示，再标记熟悉程度。</p>
              <div class="focus-info public-vocab-note">${displayMeaningFor(word)}</div>
              <p class="choice-feedback" id="choiceFeedback"></p>`
        }
        <div class="memory-actions">
          <button class="memory-button remembered" type="button" data-memory="remembered">${t("remembered")}</button>
          <button class="memory-button fuzzy" type="button" data-memory="fuzzy">${t("fuzzy")}</button>
          <button class="memory-button unknown" type="button" data-memory="unknown">${t("unknown")}</button>
        </div>
        <div class="info-tabs" role="tablist" aria-label="Word notes">
          <button class="info-tab active" type="button" data-info-tab="example">${t("example")}</button>
          <button class="info-tab" type="button" data-info-tab="synonyms">${t("synonyms")}</button>
          <button class="info-tab" type="button" data-info-tab="antonyms">${t("antonyms")}</button>
        </div>
        <div class="focus-info" id="focusInfo">
          ${renderInfoTab(word, synonyms, antonyms)}
        </div>
        <div class="mini-meta">
          <span>${t("partOfSpeech")}: ${posFor(word) || "-"}</span>
          <span>${t("source")}: ${localizeDeck({ title: word.deckTitle || "", type: word.deckType || "", language: word.language || learningDirection }).title || "Deck"}</span>
        </div>
      </div>
    </div>
  `;
  quizWord = word;
  if (audioOnlyMode) {
    setTimeout(() => speakWord(word), 120);
  }
}

function makeMeaningOptions(word, queue) {
  if (!hasReliableMeaning(word)) return [];
  const correct = cleanQuizMeaning(quizMeaningFor(word));
  const meanings = getAllWords()
    .concat(queue)
    .filter((item) => item.language === getTargetLanguage())
    .map((item) => cleanQuizMeaning(quizMeaningFor(item)))
    .filter((meaning) => meaning !== correct && isUsableQuizMeaning(meaning));
  const uniqueMeanings = [...new Set(meanings)];
  const distractors = shuffle(uniqueMeanings).slice(0, 3);
  const fallbackDistractors = ["person", "place", "time", "thing", "action", "feeling", "food", "school", "family", "work"];
  while (distractors.length < 3) {
    const next = fallbackDistractors.find((item) => item !== correct && !distractors.includes(item));
    distractors.push(next || `meaning ${distractors.length + 1}`);
  }
  return shuffle([correct, ...distractors]);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInfoTab(word, synonyms, antonyms) {
  const examples = examplesFor(word);
  const exampleLang = word.language === "ko" ? "ko-KR" : "en-US";
  const content = {
    example: `
      <div class="example-groups">
        <div>
          <strong>${t("simpleExamples")}</strong>
          <ol>${examples.simple.map((item) => renderSpeakableExample(item, exampleLang)).join("")}</ol>
        </div>
        <div>
          <strong>${t("advancedExamples")}</strong>
          <ol>${examples.advanced.map((item) => renderSpeakableExample(item, exampleLang)).join("")}</ol>
        </div>
      </div>
    `,
    synonyms,
    antonyms
  };
  if (!content[activeInfoTab]) return content.example;
  return activeInfoTab === "example" ? content.example : `<p>${content[activeInfoTab]}</p>`;
}

function renderSpeakableExample(text, lang) {
  return `<li><button class="example-sentence" type="button" data-example-lang="${lang}" data-example-text="${escapeHtml(text)}">${text}</button></li>`;
}

function examplesFor(word) {
  const meaning = meaningFor(word);
  const pos = (posFor(word) || "").toLowerCase();
  const index = stableIndex(word.term, 6);
  if (getTargetLanguage() === "ko") {
    const koreanExamples = {
      학교: {
        simple: ["내일 학교에 일찍 가야 해요.", "우리 학교 도서관은 주말에도 열려 있어요."],
        advanced: ["학교가 끝난 뒤에도 도서관에 남아서 과제를 마무리했습니다.", "새로 옮긴 학교에서는 수업 방식이 달라서 처음엔 적응하는 데 시간이 걸렸어요."]
      },
      공부하다: {
        simple: ["저는 저녁마다 한국어를 공부해요.", "시험이 있어서 주말에도 공부해야 해요."],
        advanced: ["혼자 공부하다 보면 모르는 부분을 그냥 넘기기 쉬워서, 저는 질문 목록을 따로 적어 둡니다.", "단어만 외우기보다 문장 속에서 공부해야 실제 대화에서 더 자연스럽게 말할 수 있어요."]
      },
      친구: {
        simple: ["오늘 친구랑 같이 점심을 먹었어요.", "힘들 때마다 친구가 많이 도와줘요."],
        advanced: ["오랜만에 만난 친구와 이야기를 나누다 보니 걱정했던 마음이 조금 가벼워졌습니다.", "친구라고 해서 항상 의견이 같은 것은 아니지만, 솔직하게 말할 수 있다는 점이 소중해요."]
      },
      시간: {
        simple: ["지금 시간이 별로 없어요.", "시간 있으면 커피 한잔할래요?"],
        advanced: ["준비할 시간이 충분하지 않았지만, 중요한 내용부터 정리해서 발표를 마칠 수 있었습니다.", "시간을 어떻게 쓰느냐에 따라 같은 하루도 훨씬 알차게 느껴질 수 있어요."]
      },
      책: {
        simple: ["이 책은 내용이 정말 재미있어요.", "저는 자기 전에 책을 조금 읽어요."],
        advanced: ["어려운 책이라도 모르는 단어를 정리하면서 읽으면 끝까지 이해할 수 있습니다.", "그 책은 줄거리는 단순하지만 인물의 감정 묘사가 섬세해서 오래 기억에 남았어요."]
      },
      가족: {
        simple: ["주말에는 가족과 저녁을 먹어요.", "우리 가족은 여행을 좋아해요."],
        advanced: ["멀리 떨어져 살아도 가족과 자주 연락하면 마음이 훨씬 든든해집니다.", "중요한 결정을 앞두고 가족의 조언을 들으니 생각을 정리하는 데 도움이 됐어요."]
      },
      음식: {
        simple: ["이 음식은 조금 매워요.", "한국 음식 중에서 비빔밥을 좋아해요."],
        advanced: ["처음 먹어 보는 음식이었지만 향이 강하지 않아서 부담 없이 즐길 수 있었습니다.", "음식은 단순히 맛뿐만 아니라 그 나라의 문화와 생활방식도 함께 보여 줍니다."]
      },
      운동하다: {
        simple: ["저는 아침마다 운동해요.", "건강을 위해서 조금씩 운동하려고 해요."],
        advanced: ["바쁠수록 일부러 시간을 내서 운동해야 몸도 마음도 덜 지치는 것 같아요.", "처음에는 귀찮았지만 꾸준히 운동하다 보니 집중력도 좋아졌습니다."]
      },
      날씨: {
        simple: ["오늘 날씨가 정말 좋아요.", "비가 와서 날씨가 좀 쌀쌀해요."],
        advanced: ["날씨가 갑자기 추워져서 얇은 옷을 입고 나온 사람들이 모두 서둘러 집으로 돌아갔습니다.", "여행을 계획할 때는 교통편만큼이나 날씨를 미리 확인하는 것이 중요해요."]
      },
      여행: {
        simple: ["다음 달에 부산으로 여행 가요.", "저는 혼자 여행하는 것을 좋아해요."],
        advanced: ["이번 여행에서는 유명한 관광지보다 현지 사람들이 자주 가는 동네를 천천히 걸어 보고 싶어요.", "여행을 다녀오면 사진보다 그때 느꼈던 분위기와 대화가 더 오래 기억에 남습니다."]
      },
      사랑: {
        simple: ["저는 가족을 사랑해요.", "사랑은 말보다 행동이 중요해요."],
        advanced: ["사랑한다는 말은 쉽지만, 상대를 꾸준히 배려하는 일은 생각보다 많은 노력이 필요합니다.", "그 영화는 사랑을 낭만적으로만 그리지 않고 책임과 선택의 문제로도 보여 줬어요."]
      },
      생각하다: {
        simple: ["저는 그렇게 생각하지 않아요.", "잠깐만 생각해 보고 말할게요."],
        advanced: ["문제를 다르게 생각하다 보니 처음에는 보이지 않던 해결 방법이 떠올랐습니다.", "상대방의 입장에서 생각하면 같은 상황도 훨씬 부드럽게 받아들일 수 있어요."]
      },
      환경: {
        simple: ["환경을 보호해야 해요.", "이 동네는 생활 환경이 좋아요."],
        advanced: ["환경 문제는 개인의 노력만으로 해결하기 어렵기 때문에 제도적인 변화도 함께 필요합니다.", "기업이 성장하더라도 환경에 미치는 영향을 무시해서는 안 됩니다."]
      },
      발전하다: {
        simple: ["한국어 실력이 많이 발전했어요.", "기술이 빠르게 발전하고 있어요."],
        advanced: ["온라인 교육이 발전하면서 지방에 사는 학생들도 다양한 수업을 들을 수 있게 되었습니다.", "사회가 발전할수록 편리함뿐 아니라 그에 따른 책임도 함께 커집니다."]
      },
      영향: {
        simple: ["잠을 못 자면 공부에 영향이 있어요.", "그 영화는 저에게 큰 영향을 줬어요."],
        advanced: ["어릴 때의 독서 경험은 이후의 사고방식에 깊은 영향을 미칠 수 있습니다.", "정책의 효과를 판단하려면 경제뿐 아니라 지역 사회에 미치는 영향도 살펴봐야 합니다."]
      },
      해결책: {
        simple: ["좋은 해결책을 찾아야 해요.", "이 문제에는 쉬운 해결책이 없어요."],
        advanced: ["단기적인 해결책은 될 수 있지만, 근본적인 문제를 없애기에는 아직 부족합니다.", "여러 의견을 비교한 뒤에야 현실적인 해결책을 마련할 수 있었습니다."]
      },
      회의: {
        simple: ["오후 세 시에 회의가 있어요.", "회의가 생각보다 일찍 끝났어요."],
        advanced: ["회의에서는 결론만 정하는 것이 아니라 각자의 역할과 마감일도 분명히 해야 합니다.", "불필요하게 긴 회의보다 핵심 안건을 짧게 정리한 회의가 훨씬 효율적입니다."]
      }
    };
    if (koreanExamples[word.term]) return koreanExamples[word.term];
    const subjectParticle = hasFinalConsonant(word.term) ? "이" : "가";
    const objectParticle = hasFinalConsonant(word.term) ? "을" : "를";
    const simpleTemplates = pos.includes("동사") || word.term.endsWith("하다")
      ? [`요즘 시간이 날 때마다 ${word.term.replace(/다$/, "려고")} 노력해요.`, `친구와 함께 ${word.term.replace(/다$/, "면")} 훨씬 덜 지루해요.`]
      : [`요즘 ${word.term}${subjectParticle} 자주 필요해요.`, `저는 ${word.term}${objectParticle} 조금 더 자세히 알고 싶어요.`];
    const advancedTemplates = pos.includes("동사") || word.term.endsWith("하다")
      ? [`처음에는 쉽지 않았지만 꾸준히 ${word.term.replace(/다$/, "다 보니")} 조금씩 익숙해졌습니다.`, `상황을 정확히 이해한 뒤에 ${word.term.replace(/다$/, "는")} 것이 실수를 줄이는 데 도움이 됩니다.`]
      : [`${word.term}${subjectParticle} 단순한 단어처럼 보여도 실제 문장에서는 문맥에 따라 느낌이 달라질 수 있습니다.`, `글을 쓸 때 ${word.term}${objectParticle} 적절히 사용하면 설명이 더 구체적이고 자연스러워집니다.`];
    return {
      simple: pickRotating(simpleTemplates, index, 2),
      advanced: pickRotating(advancedTemplates, index + 2, 2)
    };
  }
  const nounTemplates = [
    `The discussion became clearer once everyone understood what "${word.term}" referred to.`,
    `She wrote "${word.term}" in the margin because it captured the main idea of the paragraph.`,
    `In the lecture, "${word.term}" was introduced before the speaker moved on to examples.`
  ];
  const verbTemplates = [
    `The team tried to "${word.term}" the problem before making a final decision.`,
    `Students often need to "${word.term}" information from several sources, not just memorize it.`,
    `He paused to "${word.term}" the chart so his answer would sound more precise.`
  ];
  const modifierTemplates = [
    `Her explanation sounded more natural when she used "${word.term}" in the right context.`,
    `A "${word.term}" example can make an abstract point much easier to follow.`,
    `The essay felt stronger because the writer chose "${word.term}" language instead of vague wording.`
  ];
  const simplePool = pos.includes("verb") ? verbTemplates : pos.includes("adjective") || pos.includes("adverb") ? modifierTemplates : nounTemplates;
  const advancedPool = [
    `Although "${word.term}" usually means "${meaning}", its exact force depends on the sentence around it.`,
    `When giving an academic answer, using "${word.term}" helps connect a specific observation with a broader argument.`,
    `Rather than repeating simple words, the speaker used "${word.term}" to make the explanation sound more fluent and mature.`,
    `If "${word.term}" appears in a reading passage, checking the surrounding verbs and connectors can reveal the writer's attitude.`,
    `The phrase with "${word.term}" worked well because it added detail without making the sentence unnecessarily long.`,
    `By comparing "${word.term}" with a near synonym, the learner noticed a subtle but useful difference in tone.`
  ];
  return {
    simple: pickRotating(simplePool, index, 2),
    advanced: pickRotating(advancedPool, index + 1, 2)
  };
}

function stableIndex(text, size) {
  const source = String(text || "");
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 9973;
  }
  return size ? hash % size : 0;
}

function pickRotating(items, start, count) {
  return Array.from({ length: Math.min(count, items.length) }, (_, offset) => items[(start + offset) % items.length]);
}

function hasFinalConsonant(text) {
  const char = text.trim().slice(-1);
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function chooseMeaning(button) {
  const grid = button.closest(".choice-grid");
  const correct = grid.dataset.correct;
  const buttons = [...grid.querySelectorAll(".choice-button")];
  buttons.forEach((item) => {
    item.disabled = true;
    if (item.dataset.choice === correct) item.classList.add("correct");
  });
  if (button.dataset.choice === correct) {
    button.classList.add("correct");
    document.querySelector("#choiceFeedback").textContent = t("correct");
    document.querySelector("#choiceFeedback").className = "choice-feedback ok";
    return;
  }
  button.classList.add("wrong");
  document.querySelector("#choiceFeedback").textContent = `${t("wrong")} ${correct}`;
  document.querySelector("#choiceFeedback").className = "choice-feedback needs-work";
}

function revealCurrentAnswer(message = "") {
  const queue = getStudyQueue();
  const word = queue[studyIndex % queue.length];
  if (!word) return;
  document.querySelector("#wordDefinition")?.classList.add("visible");
  const correct = cleanQuizMeaning(quizMeaningFor(word)) || displayMeaningFor(word);
  document.querySelectorAll(".choice-button").forEach((button) => {
    button.disabled = true;
    if (button.dataset.choice === correct) button.classList.add("correct");
  });
  const feedback = document.querySelector("#choiceFeedback");
  if (feedback) {
    feedback.textContent = `${message} Correct answer: ${correct}`.trim();
    feedback.className = "choice-feedback needs-work";
  }
}

function switchInfoTab(tabName) {
  const queue = getStudyQueue();
  const word = queue[studyIndex % queue.length];
  if (!word) return;
  activeInfoTab = tabName;
  document.querySelectorAll(".info-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.infoTab === tabName));
  document.querySelector("#focusInfo").innerHTML = renderInfoTab(
    word,
    synonymsFor(word).join(", ") || "작성 예정",
    antonymsFor(word).join(", ") || "작성 예정"
  );
}

function moveStudy(offset) {
  const queue = getStudyQueue();
  if (!queue.length) return;
  studyIndex = (studyIndex + offset + queue.length) % queue.length;
  activeInfoTab = "example";
  renderStudyCard();
  newQuizPrompt();
  updateProgressBar();
}

function handleMemory(action) {
  const queue = getStudyQueue();
  const word = queue[studyIndex % queue.length];
  if (!word) return;
  const key = wordKey(word);
  const current = wordProgress[key] || { rememberHits: 0, intervalIndex: 0, nextDue: todayDate(), mastered: false, sessionHits: 0 };
  const nextHits = action === "remembered" ? (current.sessionHits || 0) + 1 : 0;
  const passedNow = nextHits >= 3;

  if (action === "unknown") {
    wordProgress[key] = { ...current, sessionHits: 0, rememberHits: 0, nextDue: todayDate(), mastered: false };
  }

  if (action === "fuzzy") {
    wordProgress[key] = { ...current, sessionHits: 0, rememberHits: 0, nextDue: addDays(1), mastered: false };
  }

  if (action === "remembered") {
    const rememberHits = (current.rememberHits || 0) + 1;
    const intervalIndex = Math.min(current.intervalIndex || 0, reviewIntervals.length - 1);
    const mastered = passedNow && intervalIndex === reviewIntervals.length - 1 && rememberHits >= 3;
    wordProgress[key] = {
      rememberHits,
      sessionHits: passedNow ? 0 : nextHits,
      intervalIndex: mastered ? intervalIndex : Math.min(intervalIndex + 1, reviewIntervals.length - 1),
      nextDue: mastered ? "" : addDays(reviewIntervals[intervalIndex]),
      mastered
    };
  }

  if (action === "fuzzy" || action === "unknown") {
    revealCurrentAnswer(action === "fuzzy" ? "Almost." : "Review this.");
    saveState();
    showToast(action === "fuzzy" ? "↺ Fuzzy: check the answer" : "↺ Check the answer");
    window.setTimeout(() => {
      moveCurrentToBack();
      saveState();
    }, 1400);
    return;
  }

  if (passedNow) {
    if (studyMode === "review") {
      reviewSessionDone = Math.min(reviewSessionDone + 1, reviewSessionTotal || queue.length || 1);
    } else {
      todaySessionDone = Math.min(todaySessionDone + 1, todaySessionTotal || dailyGoal);
    }
    removeCurrentAndAdvance();
  } else {
    moveCurrentToBack();
  }
  saveState();
  const labels = {
    remembered: passedNow ? "✓ Learned" : `✓ Remembered ${nextHits}/3`,
    fuzzy: "↺ Fuzzy: see it again",
    unknown: "↺ Try again"
  };
  showToast(labels[action] || "");
}

function removeCurrentAndAdvance() {
  const source = studyMode === "review" ? reviewWords : todayWords;
  source.splice(studyIndex, 1);
  if (studyIndex >= source.length) studyIndex = 0;
  updateCounts();
  renderStudyCard();
  newQuizPrompt();
  scrollStudyCardIntoView();
}

function moveCurrentToBack() {
  const source = studyMode === "review" ? reviewWords : todayWords;
  const [word] = source.splice(studyIndex, 1);
  if (word) source.push(word);
  if (studyIndex >= source.length) studyIndex = 0;
  updateCounts();
  renderStudyCard();
  newQuizPrompt();
  scrollStudyCardIntoView();
}

function scrollStudyCardIntoView() {
  if (!window.matchMedia?.("(max-width: 560px)").matches) return;
  requestAnimationFrame(() => {
    focusCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function newQuizPrompt() {
  const queue = getStudyQueue();
  if (!queue.length) {
    quizPrompt.textContent = t("noQueue");
    quizWord = null;
    return;
  }
  quizWord = queue[practiceIndex % queue.length];
  practiceIndex += 1;
  const modes = ["meaning-to-term", "term-to-meaning", "dictation", "example-gap"];
  currentPracticeMode = modes[Math.floor(Math.random() * modes.length)];
  const gapExample = quizWord.example ? quizWord.example.replace(quizWord.term, "____") : "-";
  const labels = {
    "meaning-to-term": t("modeLabel"),
    "term-to-meaning": t("modeLabel"),
    dictation: t("modeLabel"),
    "example-gap": t("modeLabel")
  };
  const prompts = {
    "meaning-to-term": `${meaningFor(quizWord)} -> ${getTargetLanguage() === "ko" ? "Korean" : "English"}`,
    "term-to-meaning": `${quizWord.term} -> ${getUiLang() === "zh" ? "Chinese" : getTargetLanguage() === "ko" ? "English" : "Korean"}`,
    dictation: `${quizWord.pronunciation || meaningFor(quizWord)} -> ${getTargetLanguage() === "ko" ? "Korean" : "English"}`,
    "example-gap": gapExample
  };
  practiceModeLabel.textContent = labels[currentPracticeMode];
  quizPrompt.textContent = prompts[currentPracticeMode];
  quizAnswer.value = "";
  quizFeedback.textContent = "";
}

function checkAnswer() {
  if (!quizWord) return;
  const answer = quizAnswer.value.trim().toLowerCase();
  const expected = currentPracticeMode === "term-to-meaning" ? quizMeaningFor(quizWord) : quizWord.term;
  const accepted = currentPracticeMode === "term-to-meaning" ? quizMeaningFor(quizWord).toLowerCase().includes(answer) && answer.length > 0 : answer === quizWord.term.toLowerCase();
  quizFeedback.textContent = accepted ? t("correct") : `${t("wrong")} ${expected}`;
  quizFeedback.className = `feedback ${accepted ? "ok" : "needs-work"}`;
}

function speakCurrent() {
  if (!quizWord || !("speechSynthesis" in window)) return;
  speakWord(quizWord);
}

function speakWord(word) {
  if (!word || !("speechSynthesis" in window)) return;
  speakText(word.term, word.language === "ko" ? "ko-KR" : "en-US", word.language === "ko" ? 0.82 : 0.86);
}

function speakExampleText(text, lang) {
  if (!text || !("speechSynthesis" in window)) return;
  speakText(text, lang, lang === "ko-KR" ? 0.8 : 0.84);
}

function speakText(text, lang, rate = 0.92, preferredVoiceName = "") {
  refreshVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = lang === "ko-KR" ? 0.96 : 0.98;
  const voice = getPreferredVoice(lang, preferredVoiceName);
  if (voice) utterance.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function getPreferredVoice(lang, preferredVoiceName = "") {
  const voices = availableVoices.length ? availableVoices : refreshVoices();
  const languageVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
  if (!languageVoices.length) return null;
  const exactLanguageVoices = languageVoices.filter((voice) => voice.lang?.toLowerCase() === lang.toLowerCase());
  if (lang === "ko-KR") {
    if (preferredVoiceName) {
      const selected = languageVoices.find((voice) => voice.name === preferredVoiceName);
      if (selected) return selected;
    }
    const preferredNames = [
      "Microsoft SunHi Online",
      "Microsoft Heami Online",
      "Microsoft InJoon Online",
      "Google 한국의",
      "Google 한국어",
      "Microsoft SunHi",
      "Microsoft Heami",
      "Microsoft InJoon",
      "Yuna",
      "Narae",
      "Seoyeon"
    ];
    return (
      preferredNames.map((name) => exactLanguageVoices.find((voice) => voice.name.includes(name))).find(Boolean) ||
      exactLanguageVoices.find((voice) => !/desktop|legacy/i.test(voice.name)) ||
      exactLanguageVoices[0] ||
      languageVoices[0]
    );
  }
  if (preferredVoiceName) {
    const selected = languageVoices.find((voice) => voice.name === preferredVoiceName);
    if (selected) return selected;
  }
  const preferredNames = [
    "Microsoft Jenny Online",
    "Microsoft Aria Online",
    "Microsoft Guy Online",
    "Google US English",
    "Google UK English Female",
    "Samantha",
    "Karen",
    "Moira",
    "Microsoft Jenny",
    "Microsoft Aria",
    "Microsoft Zira"
  ];
  return (
    preferredNames.map((name) => exactLanguageVoices.find((voice) => voice.name.includes(name))).find(Boolean) ||
    exactLanguageVoices.find((voice) => !/desktop|legacy|david/i.test(voice.name)) ||
    exactLanguageVoices[0] ||
    languageVoices[0]
  );
}

function refreshVoices() {
  if (!("speechSynthesis" in window)) return [];
  availableVoices = speechSynthesis.getVoices?.() || [];
  return availableVoices;
}

function completeToday() {
  const newWords = todayWords.slice(0, dailyGoal);
  const existingKeys = new Set(reviewWords.map((w) => wordKey(w)));
  const uniqueNew = newWords.filter((w) => !existingKeys.has(wordKey(w)));
  reviewWords = [...reviewWords, ...uniqueNew];
  state.lastCompletedDate = todayDate();
  updateStreak();
  updateCounts();
  saveState();
  showToast("✅ " + uniqueNew.length + " words added to review!");
  showDetail("Study", "Done", [`${uniqueNew.length} words added to review queue (total: ${reviewWords.length}).`, "Use Review due next time to continue spaced review."]);
  renderStreak();
}

function generateArticle() {
  const language = document.querySelector("#articleLanguage").value;
  const scenario = document.querySelector("#articleScenario").value;
  const customInput = document.querySelector("#customStoryWords").value.trim();

  let selected = todayWords.length ? todayWords.slice(0, 8) : reviewWords.slice(0, 8);
  if (customInput) {
    const customTerms = customInput.split(/[,，、\s]+/).filter(Boolean);
    const allWords = getAllWords();
    selected = customTerms.map((t) => allWords.find((w) => w.term === t) || { term: t, meaning: t, language: language === "ko" ? "ko" : "en" });
  }
  if (!selected.length) {
    generatedArticle.innerHTML = "<p>Build a study list first, review due words, or type words in the box above.</p>";
    return;
  }
  const terms = selected.map((word) => `<strong>${word.term}</strong>`);

  const stories = {
    campus: {
      ko: `캠퍼스 도서관에서 한 학생이 ${terms[0] || "단어"}를 외우고 있습니다. "${terms[1] || "이 단어"}의 뜻은 ${selected[1] ? meaningFor(selected[1]) : "뜻"}이에요." 옆자리 친구가 말합니다. "그 ${terms[2] || "단어"}는 시험에 자주 나오니까 꼭 기억하세요."

잠시 후 두 사람은 ${terms[3] || "단어"}를 주제로 대화를 나눕니다. "저는 ${terms[4] || "이 표현"}을 이렇게 사용해 봤어요." 친구가 예문을 들어주자 학생은 크게 고개를 끄덕입니다.

수업이 끝난 후 학생은 ${terms[5] || "복습"} 노트를 펼칩니다. 오늘 배운 ${terms[6] || "표현"}을 세 문장으로 정리하고, 각 단어 옆에 ${terms[7] || "예문"}을 하나씩 적어 넣습니다. 집으로 돌아가는 길에도 귀에 이어폰을 꽂고 ${selected[0]?.term || "단어"} 발음을 반복해서 듣습니다.`,
      en: `The campus library is quiet this afternoon. A student sits by the window, reviewing <strong>${selected[0]?.term || "vocabulary"}</strong> cards. "Let me check the meaning of <strong>${selected[1]?.term || "this word"}</strong>," they mutter, flipping through notes. "${selected[1] ? meaningFor(selected[1]) : "the definition"} — that makes sense now."

A friend slides into the chair across the table. "Studying <strong>${selected[2]?.term || "words"}</strong> again?" The student nods. "I want to use <strong>${selected[3]?.term || "it"}</strong> naturally in conversation. It means ${selected[3] ? meaningFor(selected[3]) : "something important"}."

They spend the next hour quizzing each other. "Give me a sentence with <strong>${selected[4]?.term || "this"}</strong>," the friend challenges. The student thinks for a moment, then delivers a perfect example. "${selected[4]?.term || "The word"} is becoming more familiar now."

Walking home, the student listens to audio recordings of <strong>${selected[5]?.term || "the vocabulary"}</strong>. The spaced repetition method is working — <strong>${selected[6]?.term || "each term"}</strong> feels more natural. By the time they reach their apartment, they've written three new sentences using <strong>${selected[7]?.term || "the review words"}</strong>.`
    },
    business: {
      ko: `오전 9시, 회의실에 팀원들이 모입니다. 오늘 안건은 ${terms[0] || "프로젝트"}의 ${terms[1] || "진행 상황"} 점검입니다.

팀장이 먼저 입을 엽니다. "지난주 ${terms[2] || "보고서"}를 검토한 결과, ${terms[3] || "전략"}을 일부 수정해야 합니다. 특히 ${terms[4] || "고객"} 피드백을 반영한 새로운 ${terms[5] || "방안"}을 마련했습니다."

한 직원이 질문합니다. "${terms[6] || "그 부분"}에 대한 ${terms[7] || "데이터"}는 충분히 확보되었나요?" 팀장은 고개를 끄덕이며 "네, ${selected[0]?.term || "자료"}는 모두 준비되었습니다. 이번 ${selected[1]?.term || "프로젝트"}가 성공하려면 ${selected[2]?.term || "협력"}이 필수입니다."

회의가 끝나고 각자 ${selected[3]?.term || "업무"}를 정리합니다. 오늘 논의된 ${selected[4]?.term || "내용"}을 바탕으로 다음 주까지 ${selected[5]?.term || "결과"}를 도출하기로 했습니다.`,
      en: `The conference room fills up at 9 AM sharp. Today's agenda: reviewing the quarterly <strong>${selected[0]?.term || "performance"}</strong> and setting new targets.

"Let's look at the <strong>${selected[1]?.term || "data"}</strong> first," the team lead begins. "The <strong>${selected[2]?.term || "evidence"}</strong> clearly shows that our <strong>${selected[3]?.term || "strategy"}</strong> needs adjustment. We should consider a more <strong>${selected[4]?.term || "comprehensive"}</strong> approach."

A senior analyst raises a point. "If we <strong>${selected[5]?.term || "analyze"}</strong> the customer feedback more carefully, we might find a <strong>${selected[6]?.term || "significant"}</strong> pattern. This could fundamentally change our <strong>${selected[7]?.term || "perspective"}</strong>."

The discussion continues for another hour. By the end, everyone agrees on the new direction. The team lead summarizes: "We need <strong>${selected[0]?.term || "sustainable"}</strong> growth, not quick wins. Let's <strong>${selected[1]?.term || "evaluate"}</strong> our options and reconvene next week with <strong>${selected[2]?.term || "concrete"}</strong> proposals."`
    },
    travel: {
      ko: `여행 첫날, ${terms[0] || "공항"}에 도착한 여행자는 ${terms[1] || "표지판"}을 따라 출구로 향합니다. "${terms[2] || "안내"}를 따라가면 되겠네요."

택시를 타고 ${terms[3] || "숙소"}로 이동하며 창밖을 바라봅니다. ${terms[4] || "거리"}에는 ${terms[5] || "현지인"}들이 ${terms[6] || "여유롭게"} 걷고 있습니다. 여행자는 메모장을 꺼내 ${terms[7] || "오늘의 표현"}을 적습니다.

숙소에 도착한 후 근처 ${selected[0]?.term || "식당"}에서 ${selected[1]?.term || "음식"}을 주문합니다. 낯선 ${selected[2]?.term || "언어"}로 대화하는 것이 조금 긴장되지만, ${selected[3]?.term || "용기"}를 내어 말을 걸어봅니다.

저녁이 되자 ${selected[4]?.term || "하늘"}이 붉게 물듭니다. 여행자는 ${selected[5]?.term || "카메라"}를 들어 이 ${selected[6]?.term || "순간"}을 담습니다. 오늘 하루는 ${selected[7]?.term || "소중한"} 추억이 되었습니다.`,
      en: `The traveler steps off the plane and takes a deep breath. The <strong>${selected[0]?.term || "journey"}</strong> has just begun. Following the signs toward baggage claim, they mentally review useful phrases: "<strong>${selected[1]?.term || "excuse me"}</strong>, where can I find a taxi?"

The city is vibrant and full of <strong>${selected[2]?.term || "energy"}</strong>. Street vendors call out, and the aroma of local <strong>${selected[3]?.term || "food"}</strong> fills the air. The traveler pulls out a notebook and writes down <strong>${selected[4]?.term || "new words"}</strong> they overhear.

At a small cafe, they practice ordering in the local language. "<strong>${selected[5]?.term || "I would like"}</strong> a coffee, please." The barista smiles encouragingly. This <strong>${selected[6]?.term || "interaction"}</strong> — however brief — builds confidence. Real conversations are the best <strong>${selected[7]?.term || "resource"}</strong> for language learning.

By evening, the traveler sits by the river, journaling about the day. "I used <strong>${selected[0]?.term || "the vocabulary"}</strong> in real situations," they write. "That's <strong>${selected[1]?.term || "significant"}</strong> progress." Tomorrow brings more adventures and more words to learn.`
    },
    exam: {
      ko: `시험이 일주일 앞으로 다가왔습니다. 책상 위에는 ${terms[0] || "단어장"}과 ${terms[1] || "문제집"}이 쌓여 있습니다.

학습자는 먼저 ${terms[2] || "오늘의 단어"}를 복습합니다. "${terms[3] || "이 단어"}는 ${selected[3] ? meaningFor(selected[3]) : "중요한 뜻"}이고, ${terms[4] || "저 단어"}는 ${selected[4] ? meaningFor(selected[4]) : "핵심 의미"}입니다." 플래시카드를 넘기며 ${terms[5] || "암기"}를 반복합니다.

이어서 ${terms[6] || "듣기"} 연습을 시작합니다. ${terms[7] || "지문"}을 들으며 ${selected[5]?.term || "핵심어"}를 받아쓰고, ${selected[6]?.term || "내용"}을 요약합니다. "${selected[7]?.term || "이 표현"}은 꼭 기억해야 해요."

마지막으로 작문 연습을 합니다. 오늘 배운 ${selected[0]?.term || "단어"}를 활용해 ${selected[1]?.term || "주제"}에 대한 글을 씁니다. ${selected[2]?.term || "문장"}마다 ${selected[3]?.term || "어휘"}를 자연스럽게 녹여냅니다. 시계를 보니 벌써 세 시간이 흘렀습니다.`,
      en: `The exam is one week away. The desk is covered with <strong>${selected[0]?.term || "vocabulary"}</strong> lists, practice papers, and highlighters.

The learner starts with <strong>${selected[1]?.term || "spaced review"}</strong>. Today's focus: <strong>${selected[2]?.term || "comprehensive"}</strong> understanding of key terms. "<strong>${selected[3]?.term || "This word"}</strong> means ${selected[3] ? meaningFor(selected[3]) : "an important concept"}. I'll write three sentences using it."

Next comes listening practice. The audio plays: "... the <strong>${selected[4]?.term || "phenomenon"}</strong> has been observed across multiple studies ..." The learner pauses, rewinds, and writes down every <strong>${selected[5]?.term || "detail"}</strong>. Repetition builds accuracy — each replay strengthens memory.

Time for writing. The prompt: "Discuss the <strong>${selected[6]?.term || "significance"}</strong> of education in modern society." The learner outlines the essay structure, weaving in <strong>${selected[7]?.term || "the vocabulary"}</strong> naturally. "<strong>${selected[0]?.term || "Ultimately"}</strong>, education is the foundation of progress."

Three hours pass. The learner reviews the day's work with satisfaction. <strong>${selected[1]?.term || "Nevertheless"}</strong>, there's more to do tomorrow. But tonight, the <strong>${selected[2]?.term || "evidence"}</strong> of progress is clear.`
    },
    daily: {
      ko: `아침이 밝았습니다. ${terms[0] || "하루"}를 시작하며 ${terms[1] || "커피"} 한 잔을 내립니다. 창밖 ${terms[2] || "날씨"}가 참 좋습니다.

오늘의 ${terms[3] || "계획"}을 세웁니다. "${terms[4] || "운동"}을 하고, ${terms[5] || "책"}을 읽고, ${terms[6] || "친구"}를 만나기로 했어요." ${terms[7] || "일정"}을 수첩에 적습니다.

오후에는 ${selected[0]?.term || "공원"}에서 ${selected[1]?.term || "산책"}을 합니다. ${selected[2]?.term || "바람"}이 상쾌하고 ${selected[3]?.term || "하늘"}이 맑습니다. ${selected[4]?.term || "생각"}을 정리하기에 더없이 좋은 ${selected[5]?.term || "시간"}입니다.

저녁에는 ${selected[6]?.term || "가족"}과 함께 ${selected[7]?.term || "식사"}를 합니다. 오늘 있었던 일을 ${selected[0]?.term || "이야기"}하며 웃음꽃이 핍니다. 평범하지만 ${selected[1]?.term || "소중한"} 하루였습니다.`,
      en: `Morning light streams through the window. A new day begins with a cup of coffee and a quick review of <strong>${selected[0]?.term || "today's goals"}</strong>. The <strong>${selected[1]?.term || "weather"}</strong> looks perfect for a productive day.

After breakfast, it's time for <strong>${selected[2]?.term || "exercise"}</strong>. A thirty-minute run clears the mind. Back home, the learner settles into a comfortable chair with a <strong>${selected[3]?.term || "book"}</strong>. Reading in the target language is challenging but rewarding — every <strong>${selected[4]?.term || "new word"}</strong> is a small victory.

At noon, a <strong>${selected[5]?.term || "friend"}</strong> calls. They chat about <strong>${selected[6]?.term || "life"}</strong>, work, and weekend plans. The conversation naturally includes some of the vocabulary studied this week. "<strong>${selected[7]?.term || "Practice"}</strong> makes perfect," the friend jokes.

In the evening, the learner writes in a journal. "Today I used <strong>${selected[0]?.term || "the words"}</strong> in real conversation. That feels like <strong>${selected[1]?.term || "progress"}</strong>." Small daily habits, repeated consistently, lead to <strong>${selected[2]?.term || "significant"}</strong> improvement over time.`
    },
    tech: {
      ko: `2025년, ${terms[0] || "기술"}의 발전이 우리의 ${terms[1] || "일상"}을 빠르게 바꾸고 있습니다. ${terms[2] || "인공지능"}은 이제 ${terms[3] || "교육"}과 ${terms[4] || "의료"} 분야에서 핵심 ${terms[5] || "도구"}로 자리 잡았습니다.

한 ${terms[6] || "스타트업"}에서 ${terms[7] || "개발자"}들이 새로운 ${selected[0]?.term || "서비스"}를 ${selected[1]?.term || "개발"}하고 있습니다. "${selected[2]?.term || "이 기술"}은 ${selected[3]?.term || "사용자"} 경험을 완전히 ${selected[4]?.term || "변화"}시킬 거예요."

${selected[5]?.term || "데이터"} 분석 결과, ${selected[6]?.term || "시장"}의 ${selected[7]?.term || "반응"}은 긍정적입니다. 팀은 ${selected[0]?.term || "다음 단계"}를 준비하며 ${selected[1]?.term || "미래"}를 그리고 있습니다.`,
      en: `The year is 2025, and <strong>${selected[0]?.term || "technology"}</strong> continues to <strong>${selected[1]?.term || "revolutionize"}</strong> every aspect of daily life. From education to healthcare, <strong>${selected[2]?.term || "innovation"}</strong> is reshaping how people work and learn.

In a small startup office, a team of engineers is building a new language learning platform. "The <strong>${selected[3]?.term || "fundamental"}</strong> challenge," explains the lead developer, "is creating a truly <strong>${selected[4]?.term || "comprehensive"}</strong> experience that adapts to each learner."

They <strong>${selected[5]?.term || "analyze"}</strong> user data carefully. "<strong>${selected[6]?.term || "Evidence"}</strong> suggests that personalized <strong>${selected[7]?.term || "content"}</strong> improves retention by 40%." The prototype is almost ready — just a few more tests and the platform will launch.

"This technology could <strong>${selected[0]?.term || "demonstrate"}</strong> a new <strong>${selected[1]?.term || "paradigm"}</strong> for language acquisition," the CEO says. "If we succeed, the <strong>${selected[2]?.term || "contribution"}</strong> to education will be <strong>${selected[3]?.term || "significant"}</strong>."`
    },
    culture: {
      ko: `${terms[0] || "문화"}는 ${terms[1] || "사람들"}의 ${terms[2] || "생각"}과 ${terms[3] || "행동"}을 형성합니다. ${terms[4] || "전통"}과 ${terms[5] || "현대"}가 만나는 지점에서 ${terms[6] || "다양성"}은 더욱 ${terms[7] || "풍부해"}집니다.

어느 ${selected[0]?.term || "축제"}에서 ${selected[1]?.term || "사람들"}이 ${selected[2]?.term || "음악"}에 맞춰 ${selected[3]?.term || "춤"}을 춥니다. "${selected[4]?.term || "이 순간"}이 바로 ${selected[5]?.term || "문화"}의 ${selected[6]?.term || "힘"}이에요."

${selected[7]?.term || "서로 다른"} 배경을 가진 사람들이 ${selected[0]?.term || "함께"} 어울리며 ${selected[1]?.term || "이해"}와 ${selected[2]?.term || "존중"}을 나눕니다. ${selected[3]?.term || "문화"}는 ${selected[4]?.term || "벽"}이 아니라 ${selected[5]?.term || "다리"}입니다.`,
      en: `<strong>${selected[0]?.term || "Culture"}</strong> shapes how people think, communicate, and connect. Every <strong>${selected[1]?.term || "tradition"}</strong> carries centuries of history, while modern <strong>${selected[2]?.term || "diversity"}</strong> enriches our shared experience.

At a local festival, people from different backgrounds gather to celebrate. The <strong>${selected[3]?.term || "atmosphere"}</strong> is warm and welcoming. "This is the <strong>${selected[4]?.term || "essence"}</strong> of cultural exchange," says an organizer. "We learn from each other's <strong>${selected[5]?.term || "perspective"}</strong>."

A visitor tries traditional <strong>${selected[6]?.term || "food"}</strong> for the first time. "The flavors are <strong>${selected[7]?.term || "distinct"}</strong>," they remark. "It's a <strong>${selected[0]?.term || "comprehensive"}</strong> experience — not just eating, but understanding the <strong>${selected[1]?.term || "story"}</strong> behind each dish."

By the end of the day, new friendships have formed across language barriers. <strong>${selected[2]?.term || "Ultimately"}</strong>, culture is not a wall — it is a bridge. And every <strong>${selected[3]?.term || "conversation"}</strong>, however simple, builds that bridge a little stronger.`
    }
  };

  const story = buildNaturalStory(language, scenario, selected) || stories[scenario]?.[language] || stories["daily"]?.[language] || stories["daily"]?.en || "Generate a story from your words.";
  generatedArticle.innerHTML = `
    <div class="story-content">${renderStorySentences(story)}</div>
  `;
  resetArticleReading();
}

function renderStorySentences(story) {
  let sentenceIndex = 0;
  return story
    .split("\n\n")
    .map((paragraph) => {
      const sentenceHtml = splitIntoSentences(paragraph.trim())
        .map((sentence) => {
          const currentIndex = sentenceIndex;
          sentenceIndex += 1;
          return `<span class="story-sentence" data-story-sentence="${currentIndex}" title="Click to read">${sentence}</span>`;
        })
        .join(" ");
      return `<p>${sentenceHtml}</p>`;
    })
    .join("");
}

function splitIntoSentences(text) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) return [];
  return cleanText.match(/[^.!?。！？]+[.!?。！？]+["”’']?|[^.!?。！？]+$/g)?.map((item) => item.trim()).filter(Boolean) || [cleanText];
}

function buildNaturalStory(language, scenario, selected) {
  const words = selected.slice(0, 8);
  const term = (index, fallback) => `<strong>${escapeHtml(words[index]?.term || fallback)}</strong>`;
  const raw = (index, fallback) => escapeHtml(words[index]?.term || fallback);
  const meaning = (index, fallback) => escapeHtml(words[index] ? meaningFor(words[index]) : fallback);
  const scenarioLabel = {
    campus: language === "ko" ? "캠퍼스" : "campus",
    business: language === "ko" ? "회의실" : "business meeting",
    travel: language === "ko" ? "여행지" : "trip",
    exam: language === "ko" ? "시험 준비" : "exam preparation",
    daily: language === "ko" ? "하루 일과" : "daily life",
    tech: language === "ko" ? "기술 발표" : "technology workshop",
    culture: language === "ko" ? "문화 행사" : "cultural event"
  }[scenario] || (language === "ko" ? "일상" : "daily life");

  if (language === "ko") {
    const firstParticle = hasFinalConsonant(raw(0, "단어")) ? "을" : "를";
    return `${scenarioLabel}에서 학습자는 ${term(0, "새 표현")}${firstParticle} 단순히 외우기보다 실제 상황 속에서 써 보려고 합니다. 처음에는 ${term(1, "뜻")}이 헷갈렸지만, 예문을 읽고 나니 '${meaning(1, "의미")}'라는 핵심이 조금씩 잡힙니다.

잠시 후 그는 친구에게 "${raw(2, "이 표현")}을 이런 상황에서 써도 자연스러울까요?"라고 묻습니다. 친구는 바로 대답하지 않고, 앞뒤 문맥을 살핀 뒤 ${term(3, "다른 표현")}과 비교해 설명해 줍니다. 덕분에 학습자는 단어 하나를 외우는 데서 멈추지 않고, 문장 전체의 흐름을 의식하게 됩니다.

마지막으로 그는 짧은 글을 쓰며 ${term(4, "핵심 단어")}, ${term(5, "연결 표현")}, ${term(6, "새 단어")}를 한 문단 안에 자연스럽게 넣어 봅니다. 완벽한 문장은 아니었지만, ${term(7, "복습")}을 거치면서 표현이 더 부드러워졌고 말할 때도 훨씬 자신감이 생겼습니다.`;
  }

  return `During a ${scenarioLabel}, the learner decides not to memorize ${term(0, "the word")} in isolation. Instead, they connect it with a real situation, noticing that it means "${meaning(0, "something useful")}" but can sound slightly different depending on context.

When a classmate asks about ${term(1, "another term")}, the learner gives an example, then revises it so the sentence sounds less mechanical. Although ${term(2, "the next word")} seemed simple at first, it becomes more useful once it is linked with ${term(3, "a related idea")} and a clear reason.

By the end of the practice session, the learner has written a short paragraph using ${term(4, "one expression")}, ${term(5, "a second expression")}, and ${term(6, "a third expression")} without forcing them into every line. That small adjustment makes the writing more natural, and ${term(7, "the final word")} feels like part of their active vocabulary rather than just an item on a list.`;
}

function speakArticle() {
  const sentences = getArticleSentences();
  if (!sentences.length || !("speechSynthesis" in window)) return;
  articleReadingMode = "all";
  articleParagraphIndex = 0;
  articleContinueAfter = true;
  speakArticleSentence(0, true);
}

function getArticleSentences() {
  return [...document.querySelectorAll(".story-sentence")].map((element) => ({
    element,
    text: element.textContent.trim()
  })).filter((item) => item.text);
}

function speakArticleSentence(index, continueAfter = false) {
  const sentences = getArticleSentences();
  const item = sentences[index];
  if (!item || !("speechSynthesis" in window)) return;
  articleReadToken += 1;
  const readToken = articleReadToken;
  articleParagraphIndex = index;
  articleContinueAfter = continueAfter;
  articleIsPaused = false;
  updatePauseButton();
  highlightArticleSentence(index);
  const lang = document.querySelector("#articleLanguage").value;
  const utterance = new SpeechSynthesisUtterance(item.text);
  utterance.lang = lang === "ko" ? "ko-KR" : "en-US";
  utterance.rate = lang === "ko" ? 0.8 : 0.84;
  utterance.pitch = lang === "ko" ? 0.96 : 0.98;
  refreshVoices();
  const voice = getPreferredVoice(utterance.lang);
  if (voice) utterance.voice = voice;
  utterance.onend = () => {
    if (readToken !== articleReadToken) return;
    item.element.classList.remove("reading");
    if (articleIsPaused) return;
    if (continueAfter && articleReadingMode === "all" && articleParagraphIndex + 1 < sentences.length) {
      speakArticleSentence(articleParagraphIndex + 1, true);
      return;
    }
    articleReadingMode = "";
    articleContinueAfter = false;
    articleIsPaused = false;
    updatePauseButton();
  };
  utterance.onerror = () => {
    if (readToken !== articleReadToken) return;
    articleIsPaused = false;
    articleReadingMode = "";
    articleContinueAfter = false;
    updatePauseButton();
  };
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function toggleArticlePause() {
  if (!("speechSynthesis" in window)) return;
  if (articleIsPaused) {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    } else {
      speakArticleSentence(articleParagraphIndex, articleContinueAfter);
      return;
    }
    articleIsPaused = false;
  } else if (speechSynthesis.speaking) {
    speechSynthesis.pause();
    articleIsPaused = true;
  } else {
    speakArticleSentence(articleParagraphIndex, articleContinueAfter || articleReadingMode === "all");
    return;
  }
  updatePauseButton();
}

function resetArticleReading() {
  articleReadToken += 1;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  articleParagraphIndex = 0;
  articleReadingMode = "";
  articleIsPaused = false;
  articleContinueAfter = false;
  highlightArticleSentence(-1);
  updatePauseButton();
}

function highlightArticleSentence(index) {
  document.querySelectorAll(".story-sentence").forEach((sentence) => {
    sentence.classList.toggle("reading", Number(sentence.dataset.storySentence) === index);
  });
}

function updatePauseButton() {
  const pauseButton = document.querySelector("#pauseArticleBtn");
  if (!pauseButton) return;
  pauseButton.textContent = articleIsPaused ? t("continueReading") : t("pauseReading");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (cell || row.length) {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
      }
      if (char === "\r" && next === "\n") index += 1;
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

function importCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(String(reader.result || ""));
    const headers = rows.shift().map((header) => header.trim());
    const grouped = new Map();
    rows.forEach((row) => {
      const item = Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
      if (!item.term) return;
      const deckTitle = item.deck || item.deckTitle || "自定义词库";
      const language = item.language || (/^[a-zA-Z\s-]+$/.test(item.term) ? "en" : "ko");
      const key = `${deckTitle}-${language}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: `imported-${slugify(deckTitle)}-${language}-${Date.now()}`,
          language,
          type: item.type || "自定义",
          title: deckTitle,
          description: item.description || "从 CSV 导入的自定义词库。",
          imported: true,
          words: []
        });
      }
      grouped.get(key).words.push({
        term: item.term,
        pronunciation: item.pronunciation || "",
        meaning: item.meaning || "",
        example: item.example || "",
        synonyms: normalizeList(item.synonyms),
        antonyms: normalizeList(item.antonyms),
        partOfSpeech: item.partOfSpeech || item.pos || ""
      });
    });

    const imported = [...grouped.values()];
    decks = [...decks.filter((deck) => !deck.imported || !imported.some((next) => next.title === deck.title)), ...imported];
    activeDeckId = imported[0]?.id || activeDeckId;
    importStatus.textContent = imported.length ? t("deckImported", imported.length, imported.reduce((sum, deck) => sum + deck.words.length, 0)) : t("noImport");
    renderDecks();
    renderWords();
    saveState();
  };
  reader.readAsText(file, "UTF-8");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
}

function downloadTemplate() {
  const csv = "deck,language,type,term,pronunciation,meaning,example,synonyms,antonyms,partOfSpeech\nTOPIK 初级核心词,ko,TOPIK 初级,학교,hak-gyo,学校,저는 매일 학교에 가요.,교실；캠퍼스,집,名词\nIELTS 高频词,en,IELTS,sustainable,/səˈsteɪnəbl/,可持续的,Cities need sustainable transport systems.,durable；renewable,wasteful；unsustainable,adjective\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "lionlingo-vocabulary-template.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function showDetail(type, title, lines) {
  document.body.classList.remove("learning");
  document.querySelector("#detailType").textContent = type;
  document.querySelector("#detailTitle").textContent = title;
  document.querySelector("#detailBody").textContent = lines[0] || "";
  document.querySelector("#detailContent").innerHTML = `
    <div class="detail-list">
      ${lines.map((line) => `<p>${line}</p>`).join("")}
    </div>
  `;
  document.querySelector("#detailDrawer").scrollIntoView({ behavior: "smooth" });
}

function applyUiText() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (ui[getUiLang()][key]) node.textContent = t(key);
  });
  wordSearch.placeholder = getUiLang() === "ko" ? "단어, 뜻, 예문 검색" : "Search words, meaning, or examples";
  quizAnswer.placeholder = getUiLang() === "ko" ? "답 입력" : "Type your answer";
  document.documentElement.lang = getUiLang() === "ko" ? "ko" : "en";
}

function applyLearningDirection(nextDirection) {
  learningDirection = nextDirection;
  activeLanguage = "all";
  const firstDeck = getTargetDecks()[0];
  if (firstDeck) activeDeckId = firstDeck.id;
  todayWords = makeDailyWords();
  reviewWords = getAllWords().filter((word) => word.language === getTargetLanguage() && isDue(word) && !isMastered(word)).slice(0, dailyGoal);
  todaySessionTotal = todayWords.length || dailyGoal;
  todaySessionDone = 0;
  reviewSessionTotal = reviewWords.length;
  reviewSessionDone = 0;
  applyUiText();
  renderDecks();
  renderWords();
  renderStudyCard();
  newQuizPrompt();
  updateCounts();
  saveState();
}

function enterLearning() {
  document.body.classList.add("learning");
  if (!todayWords.length) {
    todayWords = makeDailyWords();
    todaySessionTotal = todayWords.length || dailyGoal;
    todaySessionDone = 0;
  }
  studyMode = "today";
  studyIndex = 0;
  updateCounts();
  renderStudyCard();
  newQuizPrompt();
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function enterHome(targetHash = "") {
  document.body.classList.remove("learning");
  if (targetHash) {
    requestAnimationFrame(() => {
      document.querySelector(targetHash)?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function syncRoute() {
  if (location.hash === "#learn" || location.hash === "#study-room") {
    enterLearning();
    return;
  }
  if (location.hash === "#stats") {
    renderStats();
    return;
  }
  if (location.hash === "#mywords") {
    renderMyWords();
    return;
  }
  enterHome(location.hash);
}

// Keyboard shortcuts (only in learning mode)
document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("learning")) return;
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.tagName === "SELECT") return;

  const queue = getStudyQueue();
  if (!queue.length) return;

  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      moveStudy(1);
      break;
    case "ArrowLeft":
      event.preventDefault();
      moveStudy(-1);
      break;
    case "1":
      event.preventDefault();
      handleMemory("remembered");
      break;
    case "2":
      event.preventDefault();
      handleMemory("fuzzy");
      break;
    case "3":
      event.preventDefault();
      handleMemory("unknown");
      break;
    case " ":
      event.preventDefault();
      document.querySelector("#wordDefinition")?.classList.toggle("visible");
      break;
    case "Enter":
      event.preventDefault();
      checkAnswer();
      break;
    case "r":
    case "R":
      event.preventDefault();
      newQuizPrompt();
      break;
    case "s":
    case "S":
      event.preventDefault();
      speakCurrent();
      break;
    default:
      break;
  }
});

// Stats panel
function renderStats() {
  enterHome("#stats");
  const mastered = Object.values(wordProgress).filter((p) => p.mastered).length;
  const totalStudied = Object.keys(wordProgress).length;
  const accuracy = totalStudied > 0 ? Math.round((mastered / totalStudied) * 100) : 0;
  const totalWords = getAllWords().length;

  document.querySelector("#detailType").textContent = "Statistics";
  document.querySelector("#detailTitle").textContent = "Learning stats";
  document.querySelector("#detailBody").textContent = `You've studied ${totalStudied} words and mastered ${mastered}.`;
  document.querySelector("#detailContent").innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${totalWords}</span>
        <span class="stat-label">Total words</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${totalStudied}</span>
        <span class="stat-label">Words studied</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${mastered}</span>
        <span class="stat-label">Mastered</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${accuracy}%</span>
        <span class="stat-label">Mastery rate</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">🔥 ${streak.count}</span>
        <span class="stat-label">Day streak</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${dailyGoal}</span>
        <span class="stat-label">Daily goal</span>
      </div>
    </div>
  `;
  document.querySelector("#detailDrawer").scrollIntoView({ behavior: "smooth" });
}

// Learned words panel
function renderMyWords() {
  enterHome("#mywords");
  const allWords = getAllWords();
  const deckFilter = document.querySelector("#mywordsDeckFilter").value;
  const statusFilter = document.querySelector("#mywordsStatusFilter").value;

  const deckOptions = decks.map((d) => `<option value="${d.id}">${d.title}</option>`).join("");
  document.querySelector("#mywordsDeckFilter").innerHTML = '<option value="all">All</option>' + deckOptions;

  const statusLabels = { mastered: { text: "Mastered", cls: "mastered" }, remembered: { text: "Remembered", cls: "remembered" }, fuzzy: { text: "Fuzzy", cls: "fuzzy" }, unknown: { text: "Don't know", cls: "unknown" }, new: { text: "New", cls: "new" } };

  function getStatus(word) {
    const prog = wordProgress[wordKey(word)];
    if (!prog || prog.rememberHits === undefined) return "new";
    if (prog.mastered) return "mastered";
    if (prog.rememberHits >= 2) return "remembered";
    if (prog.rememberHits === 1 || (prog.nextDue && prog.nextDue > todayDate())) return "fuzzy";
    return "unknown";
  }

  let words = allWords.map((w) => ({ ...w, status: getStatus(w) }));

  if (deckFilter !== "all") {
    words = words.filter((w) => {
      const deck = decks.find((d) => d.id === deckFilter);
      return deck && w.deckTitle === deck.title;
    });
  }
  if (statusFilter !== "all") {
    words = words.filter((w) => w.status === statusFilter);
  }

  const studied = words.filter((w) => w.status !== "new");
  const mastered = studied.filter((w) => w.status === "mastered");

  document.querySelector("#mywordsGrid").innerHTML = words.length
    ? `<p style="color:var(--muted);font-size:13px;margin-bottom:12px">${studied.length} studied · ${mastered.length} mastered · ${words.length - studied.length} new</p>` +
      words
        .map((w) => {
          const st = statusLabels[w.status];
          return `
          <article class="myword-card">
            <div class="myword-status ${st.cls}">${st.text}</div>
            <div class="myword-term">${w.term}</div>
            <div class="myword-meaning">${meaningFor(w)} · ${posFor(w) || "-"}</div>
            <div style="font-size:12px;color:var(--muted)">${w.deckTitle || "Deck"}</div>
          </article>
        `;
        })
        .join("")
    : "<p>No words found.</p>";

  document.querySelector("#mywords").scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeLanguage = tab.dataset.language;
    document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === tab));
    const firstVisible = decks.find((deck) => activeLanguage === "all" || deck.language === activeLanguage);
    activeDeckId = firstVisible.id;
    wordSearch.value = "";
    renderDecks();
    renderWords();
  });
});

deckList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-deck]");
  if (!button) return;
  activeDeckId = button.dataset.deck;
  wordSearch.value = "";
  renderDecks();
  renderWords();
});

wordGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-study-word]");
  if (button) {
    const term = button.dataset.studyWord;
    studySingleWord(term);
  }
});

focusCard.addEventListener("click", (event) => {
  if (event.target.closest("[data-show-definition]")) {
    document.querySelector("#wordDefinition")?.classList.toggle("visible");
    return;
  }
  if (event.target.closest("[data-speak-word]")) {
    const queue = getStudyQueue();
    const word = queue[studyIndex % queue.length];
    if (word) speakWord(word);
    return;
  }
  const exampleButton = event.target.closest("[data-example-text]");
  if (exampleButton) {
    speakExampleText(exampleButton.dataset.exampleText, exampleButton.dataset.exampleLang);
    exampleButton.classList.add("reading");
    setTimeout(() => exampleButton.classList.remove("reading"), 900);
    return;
  }
  if (event.target.closest("[data-audio-mode]")) {
    audioOnlyMode = !audioOnlyMode;
    renderStudyCard();
    return;
  }
  const memory = event.target.closest("[data-memory]");
  if (memory) {
    handleMemory(memory.dataset.memory);
    return;
  }
  const choice = event.target.closest(".choice-button");
  if (choice) {
    chooseMeaning(choice);
    return;
  }
  const tab = event.target.closest(".info-tab");
  if (tab) switchInfoTab(tab.dataset.infoTab);
});

document.querySelector("#audioList").addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-audio]");
  const addButton = event.target.closest("[data-add-audio]");
  const index = Number(openButton?.dataset.audio ?? addButton?.dataset.addAudio);
  if (Number.isNaN(index)) return;
  const item = audioResources[index];
  showDetail("Listening", item.title, [item.note, `Length: ${item.length}. Level: ${item.level}`, ...item.tasks]);
});

document.querySelector("#paperList").addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-paper]");
  const reviewButton = event.target.closest("[data-review-paper]");
  const index = Number(openButton?.dataset.paper ?? reviewButton?.dataset.reviewPaper);
  if (Number.isNaN(index)) return;
  const paper = papers[index];
  showDetail("Past Paper", paper.title, [`Content: ${paper.status}`, `Category: ${paper.category}`, ...paper.plan]);
});

wordSearch.addEventListener("input", renderWords);
dailyGoalSelect.addEventListener("change", () => {
  dailyGoal = Number(dailyGoalSelect.value);
  todayWords = makeDailyWords();
  todaySessionTotal = todayWords.length || dailyGoal;
  todaySessionDone = 0;
  studyIndex = 0;
  updateCounts();
  renderStudyCard();
  saveState();
});
document.querySelector("#studyTodayBtn").addEventListener("click", generateTodayWords);
document.querySelector("#heroStartBtn").addEventListener("click", () => {
  if (!todayWords.length) {
    todayWords = makeDailyWords();
    todaySessionTotal = todayWords.length || dailyGoal;
    todaySessionDone = 0;
  }
  location.hash = "learn";
  enterLearning();
});
document.querySelector("#startStudyBtn").addEventListener("click", () => {
  studyMode = "today";
  studyIndex = 0;
  activeInfoTab = "example";
  renderStudyCard();
  newQuizPrompt();
});
document.querySelector("#startReviewBtn").addEventListener("click", () => {
  studyMode = "review";
  studyIndex = 0;
  reviewSessionTotal = reviewWords.length;
  reviewSessionDone = 0;
  activeInfoTab = "example";
  renderStudyCard();
  newQuizPrompt();
});
document.querySelector("#completeStudyBtn").addEventListener("click", completeToday);
document.querySelector("#newPromptBtn").addEventListener("click", newQuizPrompt);
document.querySelector("#checkAnswerBtn").addEventListener("click", checkAnswer);
document.querySelector("#speakPromptBtn").addEventListener("click", speakCurrent);
document.querySelector("#generateArticleBtn").addEventListener("click", generateArticle);
document.querySelector("#speakArticleBtn").addEventListener("click", speakArticle);
document.querySelector("#pauseArticleBtn").addEventListener("click", toggleArticlePause);
document.querySelector("#articleLanguage").addEventListener("change", () => {
  generateArticle();
});
generatedArticle.addEventListener("click", (event) => {
  const sentence = event.target.closest(".story-sentence");
  if (!sentence) return;
  articleReadingMode = "sentence";
  speakArticleSentence(Number(sentence.dataset.storySentence), false);
});
document.querySelector("#customStoryWords").addEventListener("input", generateArticle);
document.querySelector("#downloadTemplateBtn").addEventListener("click", downloadTemplate);
document.querySelector("#cacheOfflineBtn").addEventListener("click", cacheOfflineStudy);
learningDirectionSelect.addEventListener("change", () => applyLearningDirection(learningDirectionSelect.value));
document.querySelector("#csvImport").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importCsv(file);
});
document.querySelector("#podcastForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const url = document.querySelector("#podcastUrl").value.trim();
  document.querySelector("#podcastPreview").innerHTML = url
    ? `<strong>Feed 已记录：</strong>${url}<br />下一步可用后端定时抓取 RSS，自动生成听力任务、逐字稿和生词表。`
    : "<strong>推荐接入：</strong>TTMIK lessons、BBC 6 Minute English、IELTS speaking tips、PTE academic podcasts。";
});

if (getActiveDeck().language !== learningDirection && getTargetDecks()[0]) {
  activeDeckId = getTargetDecks()[0].id;
}
if ("speechSynthesis" in window) {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}
applyUiText();
renderDecks();
renderWords();
renderResources();
renderStudyCard();
newQuizPrompt();
generateArticle();
updateCounts();
renderStreak();
syncRoute();
window.addEventListener("hashchange", syncRoute);
let lastScrollY = window.scrollY;
let scrollTicking = false;

function updateMobileHeader() {
  const currentScrollY = Math.max(0, window.scrollY);
  const isMobile = window.matchMedia("(max-width: 880px)").matches;
  const scrollingDown = currentScrollY > lastScrollY + 6;
  const scrollingUp = currentScrollY < lastScrollY - 6;

  if (!isMobile || currentScrollY < 48) {
    document.body.classList.remove("mobile-header-hidden");
  } else if (scrollingDown) {
    document.body.classList.add("mobile-header-hidden");
  } else if (scrollingUp) {
    document.body.classList.remove("mobile-header-hidden");
  }

  lastScrollY = currentScrollY;
  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateMobileHeader);
}, { passive: true });

window.addEventListener("resize", updateMobileHeader);
document.querySelector(".app-header").addEventListener("click", () => {
  document.body.classList.remove("mobile-header-hidden");
});

// Theme toggle
document.querySelector("#themeToggle").addEventListener("click", () => {
  isDark = !isDark;
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem(themeKey, isDark ? "dark" : "light");
  document.querySelector("#themeToggle").textContent = isDark ? "☀️" : "🌙";
});
if (isDark) document.querySelector("#themeToggle").textContent = "☀️";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(() => updateOfflineStatus()).catch(() => {});
  });
}
window.addEventListener("online", updateOfflineStatus);
window.addEventListener("offline", updateOfflineStatus);
updateOfflineStatus();

// Stats link handler
document.querySelector(".main-nav a[href=\"#stats\"]")?.addEventListener("click", (e) => {
  e.preventDefault();
  location.hash = "stats";
  renderStats();
});

// My Words link handler
document.querySelector(".main-nav a[href=\"#mywords\"]")?.addEventListener("click", (e) => {
  e.preventDefault();
  location.hash = "mywords";
  renderMyWords();
});

// My Words filter handlers
document.querySelector("#mywordsDeckFilter")?.addEventListener("change", renderMyWords);
document.querySelector("#mywordsStatusFilter")?.addEventListener("change", renderMyWords);
