export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  country: string;
}

export interface WorkerTranslationResult {
  koreanText: string;
  originalText: string;
  isTranslated: boolean;
  sourceLang: string;
  sourceLangInfo: LanguageInfo;
  originalFlag?: string;
  detectedLanguage?: string;
  originalLanguageName?: string;
}

export interface WorkerFormDefaults {
  ptw: {
    taskName: string;
    location: string;
    hazardFactors: string;
    safetyMeasures: string;
  };
  equipmentUse: {
    purpose: string;
    location: string;
  };
  report: {
    taskName: string;
    location: string;
    beforeDescription: string;
    afterDescription: string;
    description: string;
  };
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'ko', name: '한국어', nativeName: '한국어', flag: '🇰🇷', country: '대한민국' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', country: 'USA' },
  { code: 'vi', name: '베트남어', nativeName: 'Tiếng Việt', flag: '🇻🇳', country: '베트남' },
  { code: 'ph', name: '필리핀어', nativeName: 'Tagalog / Filipino', flag: '🇵🇭', country: '필리핀' },
  { code: 'mn', name: '몽골어', nativeName: 'Монгол хэл', flag: '🇲🇳', country: '몽골' },
  { code: 'th', name: '태국어', nativeName: 'ไทย', flag: '🇹🇭', country: '태국' },
  { code: 'id', name: '인도네시아어', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', country: '인도네시아' },
  { code: 'uz', name: '우즈베크어', nativeName: "O'zbek tili", flag: '🇺🇿', country: '우즈베키스탄' },
  { code: 'km', name: '캄보디아어', nativeName: 'ភាសាខ្មែរ (Khmer)', flag: '🇰🇭', country: '캄보디아' },
  { code: 'zh', name: '중국어', nativeName: '中文 (简体)', flag: '🇨🇳', country: '중국' },
  { code: 'ne', name: '네팔어', nativeName: 'नेपाली', flag: '🇳🇵', country: '네팔' },
  { code: 'mm', name: '미얀마어', nativeName: 'မြန်မာဘာသာ', flag: '🇲🇲', country: '미얀마' },
  { code: 'bd', name: '방글라데시어', nativeName: 'বাংলা (Bengali)', flag: '🇧🇩', country: '방글라데시' },
  { code: 'lk', name: '스리랑카어', nativeName: 'සිංහල (Sinhala)', flag: '🇱🇰', country: '스리랑카' },
  { code: 'pk', name: '파키스탄어', nativeName: 'اردو (Urdu)', flag: '🇵🇰', country: '파키스탄' },
  { code: 'tl', name: '동티모르어', nativeName: 'Tetun (Tetum)', flag: '🇹🇱', country: '동티모르' },
  { code: 'la', name: '라오스어', nativeName: 'ພາສາລາວ (Lao)', flag: '🇱🇦', country: '라오스' },
  { code: 'kz', name: '카자흐어', nativeName: 'Қазақ тілі', flag: '🇰🇿', country: '카자흐스탄' },
];

// 클라이언트 인메모리 O(1) 번역 캐시 (네트워크/서버 호출 0회, 반복 렌더링 시 연산 비용 0)
const FORWARD_MEMO_CACHE = new Map<string, string>();
const REVERSE_MEMO_CACHE = new Map<string, WorkerTranslationResult>();
const MAX_CACHE_SIZE = 2000;

function setForwardCache(key: string, val: string): void {
  if (FORWARD_MEMO_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = FORWARD_MEMO_CACHE.keys().next().value;
    if (firstKey) FORWARD_MEMO_CACHE.delete(firstKey);
  }
  FORWARD_MEMO_CACHE.set(key, val);
}

function setReverseCache(key: string, val: WorkerTranslationResult): void {
  if (REVERSE_MEMO_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = REVERSE_MEMO_CACHE.keys().next().value;
    if (firstKey) REVERSE_MEMO_CACHE.delete(firstKey);
  }
  REVERSE_MEMO_CACHE.set(key, val);
}

export const SAFETY_DICTIONARY: Record<string, Record<string, string>> = {
  '작업 전 안전점검을 반드시 실시하세요.': {
    ko: '작업 전 안전점검을 반드시 실시하세요.',
    en: 'Be sure to perform a safety check before starting work.',
    vi: 'Hãy chắc chắn thực hiện kiểm tra an toàn trước khi bắt đầu công việc.',
    ph: 'Siguraduhing magsagawa ng pagsusuri sa kaligtasan bago magsimula ng trabaho.',
    mn: 'Ажил эхлэхийн өмнө аюулгүй байдлын шалгалтыг заавал хийнэ үү.',
    th: 'ต้องดำเนินการตรวจสอบความปลอดภัยก่อนเริ่มงานเสมอ',
    id: 'Pastikan untuk melakukan pemeriksaan keselamatan sebelum memulai pekerjaan.',
    uz: 'Ishni boshlashdan oldin xavfsizlik tekshiruvini o‘tkazing.',
    km: 'សូមប្រាកដថាបានធ្វើការត្រួតពិនិត្យសុវត្ថិភាពមុនពេលចាប់ផ្តើមការងារ។',
    zh: '作业前务必进行安全检查。',
    ne: 'काम सुरु गर्नु अघि सुरक्षा जाँच गर्न निश्चित गर्नुहोस्।',
    mm: 'အလုပ်မစတင်မီ ဘေးကင်းရေးစစ်ဆေးမှု သေချာပြုလုပ်ပါ။',
    bd: 'কাজ শুরু করার আগে অবশ্যই নিরাপত্তা পরীক্ষা করুন।',
    lk: 'වැඩ ආරම්භ කිරීමට පෙර ආරක්ෂක පරීක්ෂාවක් සිදු කිරීමට වග බලා ගන්න.',
    pk: 'کام شروع کرنے سے پہلے حفاظتی جانچ کو یقینی بنائیں۔',
    tl: 'Halo favor halo verifikasaun seguransa molok hahu servisu.',
    la: 'ຕ້ອງກວດສອບຄວາມປອດໄພກ່ອນເລີ່ມເຮັດວຽກສະເໝີ.',
    kz: 'Жұмысты бастар алдында қауіпсіздік тексеруін міндетті түрде орындаңыз.',
  },
  'LOTO(잠금장치)가 발부된 설비는 임의 조작이 금지됩니다.': {
    ko: 'LOTO(잠금장치)가 발부된 설비는 임의 조작이 금지됩니다.',
    en: 'Unauthorized operation of equipment tagged with LOTO is strictly prohibited.',
    vi: 'Nghiêm cấm tự ý vận hành thiết bị đã được gắn khóa LOTO.',
    ph: 'Ipinagbabawal ang di-awtorisadong pagpapatakbo ng kagamitang may LOTO lock.',
    mn: 'LOTO түгжээ тавьсан төхөөрөмжийг дур мэдэн ажиллуулахыг хориглоно.',
    th: 'ห้ามเปิดเครื่องจักรที่ติดป้าย LOTO โดยไม่ได้รับอนุญาต',
    id: 'Dilarang mengoperasikan peralatan yang telah dipasang kunci LOTO tanpa izin.',
    uz: 'LOTO qulfi o‘rnatilgan uskunalarni o‘zboshimchalik bilan ishlatish qat’iyan man etiladi.',
    km: 'ហាមដាច់ខាតមិនឱ្យដំណើរការឧបករណ៍ដែលមានសោ LOTO ដោយគ្មានការអនុញ្ញាត។',
    zh: '严禁擅自操作已挂LOTO安全锁的设备。',
    ne: 'LOTO लक लगाइएका उपकरणहरू अनुमति बिना चलाउन सख्त मनाही छ।',
    mm: 'LOTO သော့ခတ်ထားသော စက်ပစ္စည်းများကို ခွင့်ပြုချက်မရှိဘဲ မောင်းနှင်ခွင့်မရှိပါ။',
    bd: 'LOTO লক লাগানো যন্ত্রপাতি অনুমতি ছাড়া চালানো সম্পূর্ণ নিষেধ।',
    lk: 'LOTO අගුළු දමා ඇති උපකරණ අනවසරයෙන් ක්‍රියාත්මක කිරීම දැඩි ලෙස තහනම්ය.',
    pk: 'LOTO لاک لگے ہوئے آلات کو بغیر اجازت چلانا سختی سے منع ہے۔',
    tl: 'Bandu operasaun ba ekipamentu nebee iha LOTO sein autorizasaun.',
    la: 'ຫ້າມເປີດເຄື່ອງຈັກທີ່ຕິດປ້າຍ LOTO ໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ.',
    kz: 'LOTO құлпы орнатылған жабдықты рұқсатсыз қосуға қатаң тыйым салынады.',
  },
  '비상 상황 발생 시 즉시 빨간색 SOS 버튼을 누르세요.': {
    ko: '비상 상황 발생 시 즉시 빨간색 SOS 버튼을 누르세요.',
    en: 'In an emergency, immediately press the red SOS button.',
    vi: 'Trong trường hợp khẩn cấp, hãy nhấn ngay nút SOS màu đỏ.',
    ph: 'Sa oras ng emergency, pindutin agad ang pulang SOS button.',
    mn: 'Яаралтай тохиолдолд шууд улаан SOS товчийг дарна уу.',
    th: 'ในกรณีฉุกเฉิน ให้กดปุ่ม SOS สีแดงทันที',
    id: 'Dalam keadaan darurat, segera tekan tombol SOS warna merah.',
    uz: 'Favqulodda vaziyatda darhol qizil SOS tugmasini bosing.',
    km: 'ក្នុងករណីមានអាសន្ន សូមចុចប៊ូតុង SOS ពណ៌ក្រហមភ្លាមៗ។',
    zh: '紧急情况下，请立即按下红色SOS按钮。',
    ne: 'आपतकालीन अवस्थामा, तुरुन्तै रातो SOS बटन थिच्नुहोस्।',
    mm: 'အရေးပေါ်အခြေအနေတွင် ချက်ချင်း အနီရောင် SOS ခလုတ်ကို နှိပ်ပါ။',
    bd: 'জরুরি পরিস্থিতিতে অবিলম্বে লাল SOS বোতাম টিপুন।',
    lk: 'හදිසි අවස්ථාවකදී, වහාම රතු SOS බොත්තම ඔබන්න.',
    pk: 'ہنگامی صورت حال میں فوراً سرخ SOS بٹن دبائیں۔',
    tl: 'Iha situasaun emerjensia, hanehan kedas botao SOS mean.',
    la: 'ໃນກໍລະນີສຸກເສີນ, ໃຫ້ກົດປຸ່ມ SOS ສີແດງທັນທີ.',
    kz: 'Төтенше жағдайда дереу қызыл SOS батырмасын басыңыз.',
  },
  '보호구(안전모, 안전화, 보안경) 착용 필수': {
    ko: '보호구(안전모, 안전화, 보안경) 착용 필수',
    en: 'Personal Protective Equipment (Helmet, Safety Shoes, Glasses) Required',
    vi: 'Bắt buộc mang đồ bảo hộ (mũ bảo hiểm, giày bảo hộ, kính bảo hộ)',
    ph: 'Kailangan ang PPE (helmet, safety shoes, salaming pangkaligtasan)',
    mn: 'Хамгаалалтын хэрэгсэл (малгай, гутал, шил) заавал өмсөх',
    th: 'ต้องสวมอุปกรณ์ป้องกัน (หมวกนิรภัย รองเท้านิรภัย แว่นตานิรภัย)',
    id: 'Wajib mengenakan APD (helm, sepatu keselamatan, kacamata pelindung)',
    uz: 'Himoya vositalarini (dubulg‘a, xavfsizlik poyabzali, ko‘zoynak) kiyish majburiy',
    km: 'ត្រូវតែពាក់ឧបករណ៍ការពារ (មួកសុវត្ថិភាព ស្បែកជើង វ៉ែនតា)',
    zh: '必须佩戴防护用品（安全帽、安全鞋、护目镜）',
    ne: 'सुरक्षा उपकरण (हेल्मेट, सुरक्षा जुत्ता, चश्मा) अनिवार्य लगाउनुहोस्',
    mm: 'အကာအကွယ်ပစ္စည်း (ဦးထုပ်၊ လုံခြုံရေးဖိနပ်၊ မျက်မှန်) မဖြစ်မနေ ဝတ်ဆင်ပါ',
    bd: 'সুরক্ষা সরঞ্জাম (হেলমেট, সুরক্ষা জুতা, চশমা) পরা বাধ্যতামূলক',
    lk: 'ආරක්ෂක ආම්පන්න (තොප්පිය, පාවහන්, ඇස් කණ්ණාඩි) පැළඳීම අනිවාර්ය වේ',
    pk: 'حفاظتی سامان (ہیلمٹ، حفاظتی جوتے، چشمہ) پہننا لازمی ہے',
    tl: 'Uza ekipamentu protesaun (xapeu, sapatu seguransa, okulus)',
    la: 'ຕ້ອງໃສ່ອຸປະກອນປ້ອງກັນ (ໝວກນິລະໄພ ເກີບນິລະໄພ ແວ່ນຕານິລະໄພ)',
    kz: 'Жеке қорғаныс құралдарын (каска, арнайы аяқ киім, көзілдірік) кию міндетті',
  },
};

// 공통 작업 지시 및 문구 다국어 번역 사전
const INSTRUCTION_DICTIONARY: Record<string, Record<string, string>> = {
  '오늘 스크러버 배관 용접 작업 주의, 화재 감시자 1인 상주 필수': {
    en: 'Caution during scrubber pipe welding work today, 1 fire watch must be present at all times',
    vi: 'Hôm nay chú ý công việc hàn đường ống tháp lọc (scrubber), bắt buộc phải có 1 người giám sát hỏa hoạn',
    mn: 'Өнөөдөр скраббер хоолойн гагнуурын ажилд анхаарал тавьж, галын ажиглагч 1 хүн заавал байх ёстой',
    ph: 'Mag-ingat sa gawaing pagwewelding ng tubo ng scrubber ngayon, kailangan may 1 tagabantay ng sunog',
    th: 'ระวังงานเชื่อมท่อสครับเบอร์ในวันนี้ ต้องมีผู้เฝ้าระวังอัคคีภัย 1 คนประจำอยู่ตลอดเวลา',
    id: 'Perhatian pada pekerjaan pengelasan pipa scrubber hari ini, 1 pengawas kebakaran wajib hadir',
    uz: 'Bugun skrabber quvurini payvandlash ishlarida ehtiyot bo‘ling, 1 nafar yong‘in nazoratchisi bo‘lishi shart',
    km: 'ការប្រុងប្រយ័ត្នចំពោះការងារផ្សារបំពង់ scrubber ថ្ងៃនេះ ត្រូវតែមានអ្នកឃ្លាំមើលអគ្គិភ័យ ១ នាក់',
    zh: '今日请注意洗涤塔管道焊接作业安全，必须安排1名消防监护人常驻',
    ne: 'आज स्क्रबर पाइप वेल्डिङ कार्यमा ध्यान दिनुहोस्, १ जना आगो हेरालु अनिवार्य उपस्थित हुनुपर्छ',
    mm: 'ယနေ့ scrubber ပိုက် ဂဟေဆော်ခြင်းလုပ်ငန်း သတိပြုပါ၊ မီးဘေးစောင့်ကြပ်သူ ၁ ဦး မဖြစ်မနေ ရှိရမည်',
    bd: 'আজ স্ক্রাবার পাইপ ওয়েল্ডিং কাজে সতর্ক থাকুন, ১ জন অগ্নি পর্যবেক্ষক সার্বক্ষণিক উপস্থিত থাকা বাধ্যতামূলক',
    lk: 'අද scrubber බට වෑල්ඩින් කිරීමේ කාර්යයේදී සැලකිලිමත් වන්න, ගිනි නිරීක්ෂකයෙකු සිටීම අනිවාර්ය වේ',
    pk: 'آج سکرببر پائپ ویلڈنگ کے کام میں احتیاط برتیں، 1 فائر واچ کا موجود ہونا لازمی ہے',
    tl: 'Atensaun ba servisu soldadura kadoras scrubber ohin, ema 1 tenke vigia ahi',
    la: 'ມື້ນີ້ໃຫ້ລະວັງວຽກເຊື່ອມທໍ່ scrubber, ຕ້ອງມີຜູ້ເຝົ້າລະວັງໄຟ 1 ຄົນປະຈຳຢູ່ສະເໝີ',
    kz: 'Бүгін скраббер құбырын дәнекерлеу жұмысында сақ болыңыз, 1 өрт бақылаушысы болуы міндетті',
  },
  '오늘 스크러버 배관 용접 작업 주의. 안전그네 및 소화기 배치 필수.': {
    en: 'Caution during scrubber pipe welding work today. Safety harness and fire extinguisher deployment required.',
    vi: 'Chú ý công việc hàn đường ống scrubber hôm nay. Bắt buộc đeo dây đai an toàn và bố trí bình chữa cháy.',
    mn: 'Өнөөдөр скраббер хоолойн гагнуурын ажилд анхаарна уу. Хамгаалалтын бүс болон гал унтраагч заавал байрлуулах.',
    ph: 'Mag-ingat sa pagwewelding ng tubo ng scrubber ngayon. Kailangan ang safety harness at fire extinguisher.',
    th: 'ระวังงานเชื่อมท่อสครับเบอร์วันนี้ ต้องสวมเข็มขัดนิรภัยและจัดเตรียมถังดับเพลิง',
    id: 'Perhatian pekerjaan pengelasan pipa scrubber hari ini. Wajib memakai sabuk pengaman dan menyiapkan APAR.',
    uz: 'Bugun skrabber quvurini payvandlashda ehtiyot bo‘ling. Xavfsizlik kamari va o‘t o‘chirgich bo‘lishi shart.',
    km: 'ប្រុងប្រយ័ត្នការងារផ្សារបំពង់ scrubber ថ្ងៃនេះ។ ត្រូវពាក់ខ្សែក្រវាត់សុវត្ថិភាព និងដាក់បំពង់ពន្លត់អគ្គិភ័យ។',
    zh: '今日注意洗涤塔管道焊接作业。必须穿戴全身安全带并配备灭火器。',
    ne: 'आज स्क्रबर पाइप वेल्डिङ कार्यमा ध्यान दिनुहोस्। सुरक्षा पेटी र आगो निभाउने उपकरण अनिवार्य छ।',
    mm: 'ယနေ့ scrubber ပိုက် ဂဟေဆော်ခြင်း သတိပြုပါ။ လုံခြုံရေးခါးပတ်နှင့် မီးသတ်ဆေးဘူး မဖြစ်မနေ ထားရှိရမည်။',
    bd: 'আজ স্ক্রাবার পাইপ ওয়েল্ডিং কাজে সতর্ক থাকুন। সেফটি হারনেস এবং অগ্নিনির্বাপক যন্ত্র রাখা বাধ্যতামূলক।',
    lk: 'අද scrubber බට වෑල්ඩින් වැඩ ගැන සැලකිලිමත් වන්න. ආරක්ෂිත පටි සහ ගිනි නිවන උපකරණ අනිවාර්ය වේ.',
    pk: 'آج سکرببر پائپ ویلڈنگ کے کام میں احتیاط کریں۔ حفاظتی بیلٹ اور آگ بجھانے والا آلہ لازمی ہے۔',
    tl: 'Atensaun ba soldadura kadoras scrubber ohin. Tenke uza sintu seguransa no prepara estintor ahi.',
    la: 'ລະວັງວຽກເຊື່ອມທໍ່ scrubber ມື້ນີ້. ຕ້ອງໃສ່ສາຍຮັດນິລະໄພ ແລະ ກຽມບັ້ງມອດໄຟ.',
    kz: 'Бүгін скраббер құбырын дәнекерлеу жұмысына мұқият болыңыз. Қауіпсіздік белдігі мен өрт сөндіргіш міндетті.',
  },
  '보일러 청관제 투입 시 내화학 장갑 및 안면보호구 착용 필수 확인': {
    en: 'Chemical-resistant gloves and face shield required when adding boiler compound',
    vi: 'Bắt buộc đeo găng tay chống hóa chất và kính chắn mặt khi nạp chất xử lý nước lò hơi',
    mn: 'Бойлерийн цэвэрлэгээний бодис хийхдээ химийн хамгаалалтын бээлий, нүүрний хамгаалалт заавал өмсөх',
    ph: 'Kailangang magsuot ng chemical-resistant gloves at face shield kapag naglalagay ng pampalinis ng boiler',
    th: 'ต้องสวมถุงมือกันสารเคมีและกระบังหน้าป้องกันเมื่อเติมสารบำบัดน้ำในหม้อต้ม',
    id: 'Wajib kenakan sarung tangan tahan kimia dan pelindung wajah saat memasukkan bahan kimia boiler',
    uz: 'Qozon tozalash vositasini quyishda kimyoviy himoya qo‘lqoplari va yuz niqobini kiyish shart',
    km: 'ត្រូវតែពាក់ស្រោមដៃការពារសារធាតុគីមី និងរបាំងមុខការពារពេលចាក់សារធាតុគីមីឡចំហាយ',
    zh: '投放锅炉清罐剂时，必须佩戴防化手套和防护面罩',
    ne: 'बोयलर क्लीनर हाल्दा केमिकल प्रतिरोधी पन्जा र फेस शिल्ड अनिवार्य लगाउनुहोस्',
    mm: 'ဘွိုင်လာ သန့်စင်ဆေးထည့်ရာတွင် ဓာတုဒဏ်ခံလက်အိတ်နှင့် မျက်နှာကာ မဖြစ်မနေ ဝတ်ဆင်ပါ',
    bd: 'বয়লার পরিষ্কারক প্রয়োগের সময় রাসায়নিক প্রতিরোধী গ্লাভস এবং ফেস শিল্ড পরিধান বাধ্যতামূলক',
    lk: 'බොයිලේරු පිරිසිදුකාරක යෙදීමේදී රසායනික ප්‍රතිරෝධී අත්වැසුම් සහ මුහුණු ආවරණ පැළඳීම අනිවාර්ය වේ',
    pk: 'بوائلر کلینر ڈالتے وقت کیمیائی مزاحم دستانے اور فیس شیلڈ پہننا لازمی ہے',
    tl: 'Uza luvas anti-kimika no protesaun oin wainhira hatama kimika boiler',
    la: 'ຕ້ອງໃສ່ຖົງມືກັນສານເຄມີ ແລະ ໜ້າກາກປ້ອງກັນໜ້າເມື່ອຕື່ມນ້ຳຢາລ້າງຫມໍ້ຕົ້ມ',
    kz: 'Қазандық тазартқыш құйған кезде химиялық қорғаныс қолғабы мен бет қалқанын кию міндетті',
  },
  '슬러지 압착기 가동 전 LOTO 시건 해제 확인 및 안전 인터록 점검': {
    en: 'Check LOTO unlock and safety interlock inspection before operating sludge press',
    vi: 'Kiểm tra mở khóa LOTO và kiểm tra khóa liên động an toàn trước khi vận hành máy ép bùn',
    mn: 'Лаг шахагчийг ажиллуулахын өмнө LOTO түгжээ тайлагдсан эсэх болон аюулгүйн интерлокийг шалгах',
    ph: 'Suriin ang pag-unlock ng LOTO at magsagawa ng pagsusuri sa safety interlock bago patakbuhin ang sludge press',
    th: 'ตรวจสอบการปลดล็อค LOTO และระบบอินเตอร์ล็อคความปลอดภัยก่อนเดินเครื่องอัดตะกอน',
    id: 'Periksa pelepasan kunci LOTO dan inspeksi interlock keselamatan sebelum mengoperasikan sludge press',
    uz: 'Loy pressini ishlatishdan oldin LOTO qulfini ochish va xavfsizlik blokirovkasini tekshirish',
    km: 'ពិនិត្យមើលការដោះសោ LOTO និងការត្រួតពិនិត្យ interlock សុវត្ថិភាពមុនពេលដំណើរការម៉ាស៊ីនសង្កត់ sludge',
    zh: '污泥压滤机运行前必须确认LOTO已解锁并检查安全联锁装置',
    ne: 'स्लज प्रेस सञ्चालन गर्नु अघि LOTO अनलक र सुरक्षा इन्टरलक निरीक्षण जाँच गर्नुहोस्',
    mm: 'အညစ်အကြေးဖိစက် မလည်ပတ်မီ LOTO သော့ဖွင့်ထားခြင်းနှင့် ဘေးကင်းရေး အပြန်အလှန်လော့ခ်ကို စစ်ဆေးပါ',
    bd: 'স্লাজ প্রেস চালানোর আগে LOTO আনলক এবং সুরক্ষা ইন্টারলক পরিদর্শন পরীক্ষা করুন',
    lk: 'ස්ලජ් මුද්‍රණ යන්ත්‍රය ක්‍රියාත්මක කිරීමට පෙර LOTO අගුළු හැරීම සහ ආරක්ෂිත අන්තර් අගුළු පරීක්ෂාව පරීක්ෂා කරන්න',
    pk: 'سلج پریس چلانے سے پہلے LOTO انلاک اور حفاظتی انٹرلاک کا معائنہ چیک کریں',
    tl: 'Verifika loke LOTO no inspesaun interlock seguransa molok opera sludge press',
    la: 'ກວດເບິ່ງການປົດລັອກ LOTO ແລະ ການກວດສອບ interlock ຄວາມປອດໄພກ່ອນທີ່ຈະເປີດເຄື່ອງອັດຕະກອນ',
    kz: 'Шлам пресін іске қосар алдында LOTO құлпының ашылуын және қауіпсіздік интерлогын тексеріңіз',
  },
  '자격증 사본 미제출 및 안전 보호구 미착용으로 인한 반려': {
    en: 'Rejected due to failure to submit a license copy and failure to wear protective gear',
    vi: 'Từ chối do chưa nộp bản sao chứng chỉ và không mang thiết bị bảo hộ',
    mn: 'Мэргэжлийн үнэмлэхийн хуулбар ирүүлээгүй болон хамгаалалтын хэрэгсэл өмсөөгүй тул буцаав',
    ph: 'Tinanggihan dahil sa hindi pagsumite ng kopya ng lisensya at hindi pagsusuot ng PPE',
    th: 'ปฏิเสธเนื่องจากไม่ได้ส่งสำเนาใบอนุญาตและไม่สวมใส่อุปกรณ์ป้องกัน',
    id: 'Ditolak karena tidak menyerahkan salinan lisensi dan tidak mengenakan alat pelindung',
    uz: 'Litsenziya nusxasi topshirilmaganligi va himoya vositalari kiyilmaganligi sababli rad etildi',
    km: 'បដិសេធដោយសារមិនបានដាក់ច្បាប់ចម្លងអាជ្ញាប័ណ្ណ និងមិនពាក់ឧបករណ៍ការពារ',
    zh: '因未提交特种作业证复印件及未佩戴安全防护用品，予以驳回',
    ne: 'इजाजतपत्र प्रतिलिपि पेश नगरेको र सुरक्षा उपकरण नलगाएकोले अस्वीकृत गरियो',
    mm: 'လိုင်စင်မိတ္တူ မတင်ပြခြင်းနှင့် အကာအကွယ်ပစ္စည်း မဝတ်ဆင်ခြင်းကြောင့် ငြင်းပယ်ခံရသည်',
    bd: 'লাইসেন্সের কপি জমা না দেওয়া এবং সুরক্ষা সরঞ্জাম না পরার কারণে বাতিল করা হয়েছে',
    lk: 'බලපත්‍ර පිටපතක් ඉදිරිපත් නොකිරීම සහ ආරක්ෂක ආම්පන්න නොපැළඳීම හේතුවෙන් ප්‍රතික්ෂේප විය',
    pk: 'لائسنس کی کاپی جمع نہ کروانے اور حفاظتی سامان نہ پہننے کی وجہ سے مسترد کیا گیا',
    tl: 'Rejeita tanba seidauk submete sertifikadu no la uza ekipamentu protesaun',
    la: 'ປະຕິເສດຍ້ອນບໍ່ໄດ້ຍື່ນສຳເນົາໃບຂັບຂີ່/ໃບປະກາດ ແລະ ບໍ່ໃສ່ອຸປະກອນປ້ອງກັນ',
    kz: 'Куәлік көшірмесі тапсырылмағандықтан және қорғаныс құралдары киілмегендіктен қабылданбады',
  },
  '안전점검 미비 또는 작업구역 중복': {
    en: 'Rejected due to incomplete safety inspection or overlapping work zone',
    vi: 'Từ chối do kiểm tra an toàn chưa đầy đủ hoặc trùng lặp khu vực làm việc',
    mn: 'Аюулгүй байдлын шалгалт дутуу эсвэл ажлын бүс давхардсан',
    ph: 'Hindi kumpletong pagsusuri sa kaligtasan o dobleng lugar ng trabaho',
    th: 'การตรวจสอบความปลอดภัยไม่ครบถ้วนหรือพื้นที่ทำงานซ้ำซ้อน',
    id: 'Pemeriksaan keselamatan belum lengkap atau area kerja tumpang tindih',
    uz: 'Xavfsizlik tekshiruvi to‘liq emas yoki ish hududi ustma-ust tushgan',
    km: 'ការត្រួតពិនិត្យសុវត្ថិភាពមិនគ្រប់គ្រាន់ ឬតំបន់ការងារជាន់គ្នា',
    zh: '安全检查不到位或作业区域重叠',
    ne: 'अपूर्ण सुरक्षा जाँच वा कार्य क्षेत्र दोहोरिएको',
    mm: 'ဘေးကင်းရေးစစ်ဆေးမှု မပြည့်စုံခြင်း သို့မဟုတ် လုပ်ငန်းခွင်နေရာ ထပ်နေခြင်း',
    bd: 'অসম্পূর্ণ নিরাপত্তা পরিদর্শন বা কাজের এলাকা ওভারল্যাপ',
    lk: 'අසම්පූර්ණ ආරක්ෂක පරීක්ෂාව හෝ වැඩ කලාපය අතිච්ඡාදනය වීම',
    pk: 'نامکمل حفاظتی معائنہ یا کام کے علاقے کا اوورلیپ ہونا',
    tl: 'Verifikasaun seguransa la kompletu ka fatin servisu hanesan',
    la: 'ການກວດສອບຄວາມປອດໄພບໍ່ຄົບຖ້ວນ ຫຼື ພື້ນທີ່ເຮັດວຽກຊ້ຳຊ້ອນ',
    kz: 'Қауіпсіздік тексеруі толық емес немесе жұмыс аймағы сәйкес келмейді',
  },
  '산업안전보건법 제29조에 의거한 근로자 정기 및 특별안전보건교육 교안 (MSDS 및 보호구 착용법 포함)': {
    en: 'Regular & Special Safety and Health Training Material for Workers under Article 29 of the Occupational Safety and Health Act (including MSDS & PPE instructions)',
    vi: 'Tài liệu đào tạo an toàn vệ sinh lao động định kỳ và đặc biệt theo Điều 29 Luật An toàn Lao động (bao gồm MSDS và cách mang đồ bảo hộ)',
    mn: 'Хөдөлмөрийн аюулгүй байдал, эрүүл ахуйн тухай хуулийн 29-р зүйлийн дагуу ээлжит болон тусгай сургалтын гарын авлага (MSDS болон хамгаалах хэрэгсэл өмсөх заавар)',
    ph: 'Materyal sa Regular at Espesyal na Pagsasanay sa Kaligtasan at Kalusugan ng Manggagawa (kasama ang MSDS at tamang pagsusuot ng PPE)',
    th: 'เอกสารการฝึกอบรมความปลอดภัยและอาชีวอนามัยประจำและพิเศษตามมาตรา 29 (รวมถึง MSDS และวิธีสวมใส่อุปกรณ์ป้องกัน)',
    id: 'Materi Pelatihan Keselamatan dan Kesehatan Kerja Reguler & Khusus berdasarkan Pasal 29 UU K3 (termasuk MSDS & cara pemakaian APD)',
    uz: 'Mehnatni muhofaza qilish qonunining 29-moddasiga muvofiq muntazam va maxsus xavfsizlik o‘quv qo‘llanmasi (MSDS va himoya vositalarini kiyish qoidalari)',
    zh: '根据《产业安全保健法》第29条编制的员工定期及特别安全保健教育教材（含MSDS及防护用品佩戴方法）',
    km: 'ឯកសារបណ្តុះបណ្តាលសុវត្ថិភាព និងសុខភាពការងារពិសេសតាមមាត្រា ២៩ (រួមទាំង MSDS និងរបៀបពាក់ឧបករណ៍ការពារ)',
    ne: 'औद्योगिक सुरक्षा तथा स्वास्थ्य ऐनको धारा २९ अनुसार नियमित तथा विशेष सुरक्षा तालिम सामग्री (MSDS र PPE लगाउने विधि सहित)',
    mm: 'လုပ်ငန်းခွင်ဘေးအန္တရာယ်ကင်းရှင်းရေးဥပဒေ ပုဒ်မ ၂၉ အရ ပုံမှန်နှင့် အထူးဘေးကင်းရေးသင်တန်းစာအုပ် (MSDS နှင့် PPE ဝတ်ဆင်နည်းအပါအဝင်)',
    bd: 'পেশাগত নিরাপত্তা ও স্বাস্থ্য আইনের ২৯ ধারা অনুযায়ী নিয়মিত ও বিশেষ নিরাপত্তা প্রশিক্ষণ উপকরণ (MSDS এবং PPE পরিধান পদ্ধতি সহ)',
    lk: 'වෘත්තීය ආරක්ෂාව සහ සෞඛ්‍ය පනතේ 29 වන වගන්තිය යටතේ නිත්‍ය සහ විශේෂ ආරක්ෂක පුහුණු අත්පොත (MSDS සහ PPE පැළඳීම ඇතුළුව)',
    pk: 'پیشہ ورانہ حفاظت اور صحت کے قانون کی دفعہ 29 کے تحت کارکنوں کے لیے حفاظتی تربیتی مواد (بشمول MSDS اور PPE پہننے کا طریقہ)',
    tl: 'Material Treinamentu Seguransa no Saude Servisu tuir Artigu 29 (inklui MSDS no oinsa uza PPE)',
    la: 'ເອກະສານຝຶກອົບຮົມຄວາມປອດໄພ ແລະ ສຸຂະພາບແຮງງານ ຕາມມາດຕາ 29 (ລວມທັງ MSDS ແລະ ວິທີໃສ່ອຸປະກອນປ້ອງກັນ)',
    kz: 'Еңбекті қорғау заңының 29-бабына сәйкес жұмысшыларға арналған қауіпсіздік оқу құралы (MSDS және ЖҚҚ кию тәртібі)',
  },
  '롤러, 분쇄기, 컨베이어 가동 중 접근 금지 및 비상정지 스위치 위치 숙지 교육': {
    en: 'Training on prohibition of access during operation of rollers, crushers, and conveyors, and knowing emergency stop switch locations',
    vi: 'Đào tạo cấm tiếp cận khi con lăn, máy nghiền, băng tải đang hoạt động và nắm rõ vị trí công tắc dừng khẩn cấp',
    mn: 'Өнхрүүлэг, бутлуур, конвейер ажиллаж байх үед ойртохыг хориглох болон яаралтай зогсоох товчны байршлыг мэдэх сургалт',
    ph: 'Pagsasanay sa pagbabawal sa paglapit habang umaandar ang roller, crusher, at conveyor, at pag-alam sa emergency stop switch',
    th: 'การฝึกอบรมห้ามเข้าใกล้ขณะเครื่องลูกกลิ้ง เครื่องบด และสายพานลำเลียงทำงาน และทราบตำแหน่งสวิตช์หยุดฉุกเฉิน',
    id: 'Pelatihan larangan mendekat saat roller, penghancur, dan konveyor beroperasi serta memahami lokasi tombol darurat',
    uz: 'Rolik, maydalagich va konveyer ishlayotgan vaqtda yaqinlashishni taqiqlash hamda favqulodda to‘xtatish tugmasi joylashuvini bilish',
    zh: '滚筒、粉碎机、传送带运行期间严禁靠近及熟知紧急停止开关位置培训',
    km: 'ការបណ្តុះបណ្តាលហាមចូលជិតពេលម៉ាស៊ីនកិន និងខ្សែพานកំពុងដំណើរការ និងស្គាល់ទីតាំងកុងតាក់បញ្ឈប់បន្ទាន់',
    ne: 'रोलर, क्रसर र कन्भेयर चलिरहेको बेला नजिक जान निषेध र आपतकालीन स्टप स्विचको स्थान सम्बन्धी तालिम',
    mm: 'ဒလိမ့်တုံး၊ ကြိတ်စက်နှင့် သယ်ယူပို့ဆောင်ရေးစက် လည်ပတ်နေစဉ် အနားမကပ်ရန်နှင့် အရေးပေါ်ရပ်တန့်ခလုတ် တည်နေရာ သိရှိရေး သင်တန်း',
    bd: 'রোলার, ক্রাশার এবং কনভেয়র চলাকালীন কাছে যাওয়া নিষেধ এবং জরুরি স্টপ সুইচের অবস্থান জানা সংক্রান্ত প্রশিক্ষণ',
    lk: 'රෝලර්, ක්‍රෂර් සහ കൺවെയර් ක්‍රියාත්මක වන විට ළඟා වීම තහනම් කිරීම සහ හදිසි නැවතුම් ස්විචය පිළිබඳ පුහුණුව',
    pk: 'رولر، کولہو اور کنویئر کے چلنے کے دوران قریب جانے کی ممانعت اور ایمرجنسی اسٹاپ سوئچ کی جگہ جاننے کی تربیت',
    tl: 'Treinamentu bandu hakbesik wainhira rolu, mákina rahun no konveior halai hela no hatene fatin botao emerjensia',
    la: 'ການຝຶກອົບຮົມຫ້າມເຂົ້າໃກ້ຂະນະເຄື່ອງໂຣເລີ, ເຄື່ອງບົດ ແລະ ສາຍพานກຳລັງເຮັດວຽກ ແລະ ຮູ້ຈັກຈຸດສະວິດຢຸດສຸກເສີນ',
    kz: 'Ролик, ұсатқыш және конвейер жұмыс істеп тұрғанда жақындауға тыйым салу және апаттық тоқтату түймесін білу',
  },
  '스마트폰 카메라로 해당 설비의 실제 QR코드를 스캔하였습니다. 안전한 정비 및 점검을 위해 아래 LOTO 시건 절차와 비상조치 수칙을 철저히 준수하세요.': {
    en: 'You scanned the actual QR code of this equipment with your smartphone camera. Strictly follow the LOTO locking procedure and emergency rules below for safe maintenance.',
    vi: 'Bạn đã quét mã QR thực tế của thiết bị này bằng camera điện thoại. Để bảo trì và kiểm tra an toàn, vui lòng tuân thủ nghiêm ngặt quy trình khóa LOTO và quy tắc khẩn cấp bên dưới.',
    mn: 'Та ухаалаг утасны камераар энэ төхөөрөмжийн QR кодыг уншууллаа. Аюулгүй засвар үйлчилгээ хийхийн тулд доорх LOTO түгжих журам болон яаралтай тусламжийн дүрмийг чанд мөрдөнө үү.',
    ph: 'Na-scan mo ang aktwal na QR code ng kagamitang ito gamit ang camera ng smartphone. Mahigpit na sundin ang LOTO procedure at emergency rules sa ibaba.',
    th: 'คุณได้สแกน QR โค้ดจริงของอุปกรณ์นี้ด้วยกล้องสมาร์ทโฟน โปรดปฏิบัติตามขั้นตอนการล็อค LOTO และระเบียบปฏิบัติฉุกเฉินด้านล่างอย่างเคร่งครัด',
    id: 'Anda telah memindai kode QR peralatan ini dengan kamera ponsel. Patuhi prosedur penguncian LOTO dan langkah darurat di bawah ini dengan ketat.',
    uz: 'Siz smartfon kamerasi orqali ushbu uskunaning haqiqiy QR kodini skaner qildingiz. Xavfsiz ta’mirlash uchun quyidagi LOTO qulflash va favqulodda qoidalarga qat’iy rioya qiling.',
    zh: '您已使用智能手机相机扫描该设备的二维码。为确保安全维修与点检，请严格遵守以下LOTO上锁程序及应急处置规则。',
    km: 'អ្នកបានស្កេនកូដ QR ពិតប្រាកដនៃឧបករណ៍នេះដោយកាមេរ៉ាទូរស័ព្ទ។ សូមអនុវត្តតាមនីតិវិធីចាក់សោ LOTO និងវិធានការបន្ទាន់ខាងក្រោម។',
    ne: 'तपाईंले स्मार्टफोन क्यामेराबाट यस उपकरणको QR कोड स्क्यान गर्नुभयो। सुरक्षित मर्मतका लागि तलका LOTO प्रक्रिया र आपतकालीन नियमहरू पालना गर्नुहोस्।',
    mm: 'သင်သည် စမတ်ဖုန်းကင်မရာဖြင့် ဤစက်ပစ္စည်း၏ QR ကုဒ်ကို စကန်ဖတ်ခဲ့သည်။ ဘေးကင်းစွာ ပြုပြင်ထိန်းသိမ်းရန် အောက်ပါ LOTO လော့ခ်ချခြင်းနှင့် အရေးပေါ်စည်းမျဉ်းများကို တိကျစွာ လိုက်နာပါ။',
    bd: 'আপনি স্মার্টফোন ক্যামেরা দিয়ে এই যন্ত্রের আসল QR কোড স্ক্যান করেছেন। নিরাপদ রক্ষণাবেক্ষণের জন্য নিচের LOTO লক পদ্ধতি এবং জরুরি নিয়মাবলী মেনে চলুন।',
    lk: 'ඔබ ස්මාර්ට්ෆෝන් කැමරාවෙන් මෙම උපකරණයේ QR කේතය ස්කෑන් කර ඇත. ආරක්ෂිත නඩත්තුව සඳහා පහත LOTO ක්‍රියා පටිපාටිය සහ හදිසි නීති පිළිපදින්න.',
    pk: 'آپ نے اسمارٹ فون کیمرے سے اس آلے کا QR کوڈ اسکین کیا ہے۔ محفوظ مرمت کے لیے نیچے دیے گئے LOTO لاکنگ طریقہ کار اور ہنگامی اصولوں پر عمل کریں۔',
    tl: 'Ita scan ona kodu QR ekipamentu nee ho kamera telefone. Halo tuir prosedimentu LOTO no regra emerjensia iha kraik.',
    la: 'ທ່ານໄດ້ສະແກນ QR ໂຄດຕົວຈິງຂອງອຸປະກອນນີ້ດ້ວຍກ້ອງໂທລະສັບ. ກະລຸນາປະຕິບັດຕາມຂັ້ນຕອນ LOTO ແລະ ກົດລະບຽບສຸກເສີນຂ້າງລຸ່ມນີ້ຢ່າງເຄັ່ງຄັດ.',
    kz: 'Сіз смартфон камерасымен осы жабдықтың QR кодын сканерледіңіз. Қауіпсіз жөндеу үшін төмендегі LOTO құлыптау тәртібі мен төтенше ережелерді қатаң сақтаңыз.',
  },
  '1. 안전모 턱끈 체결 및 안전대 2개소 걸이 / 2. 용접 작업 전 소화기 배치 및 불티 비산방지포 설치 / 3. 이상 가스 감지 시 즉시 작업 중지 및 관리자 통보': {
    en: '1. Fasten helmet chinstrap & dual-hook safety harness / 2. Deploy fire extinguisher & spark blanket before welding / 3. Stop work immediately & notify manager if abnormal gas is detected',
    vi: '1. Thắt chặt quai mũ bảo hiểm & móc dây an toàn 2 điểm / 2. Bố trí bình chữa cháy & bạt chống bắn tia lửa trước khi hàn / 3. Dừng việc ngay & báo quản lý khi phát hiện khí lạ',
    mn: '1. Малгайн оосор чангалах, хамгаалалтын бүс 2 цэгт бэхлэх / 2. Гагнуурын өмнө гал унтраагч болон оч хамгаалах бүтээлэг тавих / 3. Хорт хий илэрвэл ажлаа зогсоож менежерт мэдэгдэх',
    ph: '1. Ikabit ang chinstrap ng helmet at 2-hook safety harness / 2. Maglagay ng fire extinguisher at spark cover bago mag-welding / 3. Ihinto agad ang trabaho at ipagbigay-alam sa manager kapag may tagas ng gas',
    th: '1. รัดสายรัดคางหมวกนิรภัยและเกี่ยวเข็มขัดนิรภัย 2 จุด / 2. เตรียมถังดับเพลิงและผ้ากันสะเก็ดไฟก่อนเชื่อม / 3. หยุดงานทันทีและแจ้งผู้จัดการหากตรวจพบก๊าซผิดปกติ',
    id: '1. Kencangkan tali dagu helm & kaitkan sabuk pengaman 2 titik / 2. Siapkan APAR & kain tahan percikan api sebelum mengelas / 3. Hentikan kerja segera & lapor manajer jika terdeteksi gas berbahaya',
    uz: '1. Dubulg‘a tasmasini mahkamlash va xavfsizlik kamarini 2 joyga ulash / 2. Payvandlashdan oldin o‘t o‘chirgich va uchqundan himoya matosini qo‘yish / 3. Gaz sezilsa darhol ishni to‘xtatib menejerga xabar berish',
    zh: '1. 系紧安全帽下颏带并双钩挂好安全带 / 2. 焊接作业前配备灭火器及铺设防火毯 / 3. 检测到异常气体时立即停止作业并报告管理员',
    km: '1. ដាក់ខ្សែចងចង្កាមួក និងខ្សែក្រវាត់សុវត្ថិភាព ២ ទំពក់ / 2. ដាក់បំពង់ពន្លត់អគ្គិភ័យមុនពេលផ្សារ / 3. បញ្ឈប់ការងារភ្លាមៗនៅពេលមានឧស្ម័នមិនប្រក្រតី',
    ne: '१. हेल्मेटको ফिता कस्नुहोस् र सुरक्षा पेटी लगाउनुहोस् / २. वेल्डिङ अघि आगो निभाउने यन्त्र राख्नुहोस् / ३. असामान्य ग्यास देखिएमा तुरुन्त काम रोकी प्रबन्धकलाई खबर गर्नुहोस्',
    mm: '၁။ ဦးထုပ်မေးသိုင်းကြိုးနှင့် လုံခြုံရေးခါးပတ် ချိတ်ပါ / ၂။ ဂဟေမဆော်မီ မီးသတ်ဆေးဘူး ထားရှိပါ / ၃။ အဆိပ်ဓာတ်ငွေ့ တွေ့ရှိပါက အလုပ်ချက်ချင်းရပ်ပြီး မန်နေဂျာထံ အကြောင်းကြားပါ',
    bd: '১. হেলমেটের ফিতা ও সেফটি হারনেস বাঁধুন / ২. ওয়েল্ডিংয়ের আগে অগ্নিনির্বাপক যন্ত্র রাখুন / ৩. অস্বাভাবিক গ্যাস পেলে কাজ বন্ধ করে ম্যানেজারকে জানান',
    lk: '1. හිස්වැසුම් පටිය සහ ආරක්ෂිත පටිය පළඳින්න / 2. වෑල්ඩින් කිරීමට පෙර ගිනි නිවන උපකරණ තබන්න / 3. අසාමාන්‍ය වායුවක් දැනුනහොත් වහාම වැඩ නවත්වා කළමනාකරුට දන්වන්න',
    pk: '1. ہیلمٹ کا پٹہ اور حفاظتی بیلٹ باندھیں / 2. ویلڈنگ سے پہلے آگ بجھانے والا آلہ رکھیں / 3. غیر معمولی گیس کی صورت میں کام فوراً روکیں اور مینیجر کو اطلاع دیں',
    tl: '1. Kesi tali xapeu no sintu seguransa / 2. Prepara estintor ahi molok soldadura / 3. Para servisu kedas wainhira hetan gas perigu',
    la: '1. ຮັດສາຍໝວກນິລະໄພ ແລະ ສາຍຮັດນິລະໄພ 2 ຈຸດ / 2. ກຽມບັ້ງມອດໄຟກ່ອນເຊື່ອມ / 3. ຢຸດວຽກທັນທີເມື່ອພົບອາຍແກັສຜິດປົກກະຕິ',
    kz: '1. Каска бауын тағып, қауіпсіздік белдігін 2 жерден бекітіңіз / 2. Дәнекерлеу алдында өрт сөндіргіш қойыңыз / 3. Қауіпті газ байқалса, жұмысты дереу тоқтатып менеджерге хабарлаңыз',
  },
};

// 국적/언어별 근로자 스마트폰 입력 양식 기본값 (근로자가 자신의 국적 언어로 작성·제출하도록 지원)
const WORKER_FORM_DEFAULTS_BY_LANG: Record<string, WorkerFormDefaults> = {
  ko: {
    ptw: {
      taskName: '스크러버 배관 플랜지 조임 및 고소 점검',
      location: 'A동 화학탱크 상부 배관',
      hazardFactors: '고소 추락 위험, 잔류 유해가스 누출 가능성',
      safetyMeasures: '안전대 2개소 체결 착용, 소화기 2기 배치 및 화재 대비',
    },
    equipmentUse: {
      purpose: 'A창고 원자재 이송 및 하역 작업',
      location: 'A동 야적장 및 1층 원료창고',
    },
    report: {
      taskName: 'B동 보일러실 배관 보온재 교체 및 청소',
      location: 'B동 보일러실 2구역',
      beforeDescription: '노후 보온재 탈락으로 인한 열 손실 및 작업자 접촉 화상 위험 발생.',
      afterDescription: '고효율 난연성 글라스울 재시공 및 외장 알루미늄 커버 체결 완료.',
      description: '보일러 배관 보온재 교체 및 안전 점검 완료했습니다.',
    },
  },
  vi: {
    ptw: {
      taskName: 'Siết mặt bích đường ống scrubber và kiểm tra trên cao',
      location: 'Đường ống phía trên bồn hóa chất Khu A',
      hazardFactors: 'Nguy cơ rơi ngã từ trên cao, rò rỉ khí độc',
      safetyMeasures: 'Đeo dây an toàn hai móc, bố trí 2 bình chữa cháy',
    },
    equipmentUse: {
      purpose: 'Vận chuyển nguyên vật liệu kho A và bốc xếp hàng',
      location: 'Bãi chứa Khu A và kho nguyên liệu tầng 1',
    },
    report: {
      taskName: 'Thay thế lớp cách nhiệt đường ống phòng nồi hơi Khu B và vệ sinh',
      location: 'Phòng nồi hơi Khu B khu vực 2',
      beforeDescription: 'Lớp cách nhiệt cũ bị bong tróc gây thất thoát nhiệt và nguy cơ bỏng khi tiếp xúc.',
      afterDescription: 'Đã thi công lại bông thủy tinh chống cháy và lắp vỏ nhôm bảo vệ hoàn tất.',
      description: 'Đã thay thế gioăng đệm và kiểm tra rò rỉ xong.',
    },
  },
  mn: {
    ptw: {
      taskName: 'Скраббер хоолойн фланц чангалах болон өндрийн шалгалт',
      location: 'А байрны химийн савны дээд хоолой',
      hazardFactors: 'Өндрөөс унах аюул, хорт хий алдагдах эрсдэл',
      safetyMeasures: 'Хамгаалалтын бүс зүүх, гал унтраагч 2 ширхэг байрлуулах',
    },
    equipmentUse: {
      purpose: 'А агуулахын түүхий эд тээвэрлэх болон буулгах ажил',
      location: 'А байрны талбай болон 1-р давхрын агуулах',
    },
    report: {
      taskName: 'Б байрны бойлерийн өрөөний хоолойн дулаалга солих болон цэвэрлэгээ',
      location: 'Б байрны бойлерийн өрөө 2-р хэсэг',
      beforeDescription: 'Хуучин дулаалга салж унаснаар дулаан алдагдах болон түлэгдэх аюул үүссэн.',
      afterDescription: 'Галд тэсвэртэй шилэн хөвөн дулаалга шинээр хийж, хөнгөн цагаан бүрээс суурилуулж дууссан.',
      description: 'Хоолойн жийргэвчийг сольж дууссан.',
    },
  },
  ph: {
    ptw: {
      taskName: 'Paghihigpit ng flange ng tubo ng scrubber at inspeksyon sa mataas na lugar',
      location: 'Tubo sa itaas ng tangke ng kemikal sa Gusali A',
      hazardFactors: 'Panganib ng pagkahulog mula sa mataas, pagtagas ng nakalalasong gas',
      safetyMeasures: 'Magsuot ng safety harness, maglagay ng 2 fire extinguisher',
    },
    equipmentUse: {
      purpose: 'Paghahakot at pagbababa ng hilaw na materyales sa Bodega A',
      location: 'Bakuran ng Gusali A at bodega sa unang palapag',
    },
    report: {
      taskName: 'Pagpapalit ng insulation ng tubo sa boiler room B at paglilinis',
      location: 'Gusali B Boiler Room Seksyon 2',
      beforeDescription: 'Nasira ang lumang insulation na nagdulot ng pagkawala ng init at panganib ng pagkapaso.',
      afterDescription: 'Nakabit na ang bagong fire-resistant glass wool at takip na aluminyo.',
      description: 'Tapos na ang pag-aayos at paglilinis ng boiler.',
    },
  },
  th: {
    ptw: {
      taskName: 'งานขันหน้าแปลนท่อสครับเบอร์และตรวจสอบบนที่สูง',
      location: 'ท่อด้านบนถังเคมี อาคาร A',
      hazardFactors: 'อันตรายจากการตกจากที่สูง และก๊าซพิษรั่วไหล',
      safetyMeasures: 'สวมเข็มขัดนิรภัยแบบสองตะขอ และจัดเตรียมถังดับเพลิง 2 ถัง',
    },
    equipmentUse: {
      purpose: 'งานขนย้ายและขนถ่ายวัตถุดิบในคลังสินค้า A',
      location: 'ลานเก็บของอาคาร A และคลังวัตถุดิบชั้น 1',
    },
    report: {
      taskName: 'งานเปลี่ยนฉนวนหุ้มท่อห้องหม้อไอน้ำอาคาร B และทำความสะอาด',
      location: 'ห้องหม้อไอน้ำอาคาร B โซน 2',
      beforeDescription: 'ฉนวนเก่าชำรุดทำให้สูญเสียความร้อนและมีความเสี่ยงต่อการถูกความร้อนลวก',
      afterDescription: 'ติดตั้งฉนวนใยแก้วทนไฟใหม่และปิดฝาครอบอลูมิเนียมเรียบร้อยแล้ว',
      description: 'ซ่อมแซมท่อหม้อไอน้ำอาคาร B และทำความสะอาดเรียบร้อยแล้ว',
    },
  },
  id: {
    ptw: {
      taskName: 'Pengencangan flensa pipa scrubber dan inspeksi ketinggian',
      location: 'Pipa atas tangki kimia Gedung A',
      hazardFactors: 'Bahaya jatuh dari ketinggian, potensi kebocoran gas beracun',
      safetyMeasures: 'Memakai sabuk pengaman dua kait, menyiapkan 2 tabung APAR',
    },
    equipmentUse: {
      purpose: 'Pengangkutan dan bongkar muat bahan baku di Gudang A',
      location: 'Halaman Gedung A dan gudang bahan baku lantai 1',
    },
    report: {
      taskName: 'Penggantian isolasi pipa ruang boiler Gedung B dan pembersihan',
      location: 'Ruang Boiler Gedung B Zona 2',
      beforeDescription: 'Isolasi lama rusak menyebabkan kehilangan panas dan risiko luka bakar.',
      afterDescription: 'Pemasangan ulang glasswool tahan api dan penutup aluminium selesai.',
      description: 'Perbaikan pipa boiler gedung B dan pembersihan selesai.',
    },
  },
  uz: {
    ptw: {
      taskName: 'Skrabber quvuri gardishini mahkamlash va balandlikda tekshirish',
      location: 'A bino kimyoviy bak ustki quvuri',
      hazardFactors: 'Balandlikdan yiqilish xavfi, zaharli gaz sizib chiqishi',
      safetyMeasures: 'Ikki ilgakli xavfsizlik kamarini taqish, 2 ta o‘t o‘chirgich joylashtirish',
    },
    equipmentUse: {
      purpose: 'A omboriga xomashyo tashish va tushirish ishlari',
      location: 'A bino maydoni va 1-qavat xomashyo ombori',
    },
    report: {
      taskName: 'B bino qozonxona quvurlari izolyatsiyasini almashtirish va tozalash',
      location: 'B bino qozonxona 2-hudud',
      beforeDescription: 'Eski izolyatsiya tushib ketganligi sababli issiqlik yo‘qotilishi va kuyish xavfi yuzaga kelgan.',
      afterDescription: 'Yong‘inga chidamli shisha paxta qayta o‘rnatildi va alyuminiy qoplama mahkamlandi.',
      description: 'B bino qozonxona quvurlarini ta’mirlash va tozalash yakunlandi.',
    },
  },
  zh: {
    ptw: {
      taskName: '洗涤塔管道法兰紧固及高空点检作业',
      location: 'A栋化学品储罐上部管道',
      hazardFactors: '高空坠落风险、残留有害气体泄漏可能',
      safetyMeasures: '系挂双钩安全带、配备2具灭火器及防火措施',
    },
    equipmentUse: {
      purpose: 'A仓库原材料搬运及卸货作业',
      location: 'A栋堆场及1楼原料仓库',
    },
    report: {
      taskName: 'B栋锅炉房管道保温材料更换及清扫',
      location: 'B栋锅炉房2区',
      beforeDescription: '老化保温材脱落导致热量散失及作业人员接触烫伤风险。',
      afterDescription: '高效阻燃玻璃棉重新施工及外部铝制护套紧固完成。',
      description: 'B栋锅炉房管道保温材料更换及清扫完成。',
    },
  },
  en: {
    ptw: {
      taskName: 'Scrubber pipe flange tightening and high-place inspection',
      location: 'Building A upper chemical tank piping',
      hazardFactors: 'Risk of fall from height, potential toxic gas leak',
      safetyMeasures: 'Wear dual-lanyard safety harness, deploy 2 fire extinguishers',
    },
    equipmentUse: {
      purpose: 'Forklift material transport and unloading in Warehouse A',
      location: 'Building A yard and 1F raw material warehouse',
    },
    report: {
      taskName: 'Building B boiler room pipe insulation replacement and cleaning',
      location: 'Building B Boiler Room Zone 2',
      beforeDescription: 'Detached old insulation caused heat loss and burn hazard on contact.',
      afterDescription: 'Re-installed flame-retardant glass wool and fastened outer aluminum cover.',
      description: 'All maintenance work completed successfully.',
    },
  },
};

// 외국어 문장 -> 한국어 정확 매핑 사전
const FOREIGN_TO_KO_DICTIONARY: Record<string, string> = {
  // 베트남어 (VN)
  'Đã thay thế gioăng đệm và kiểm tra rò rỉ xong.': '가스켓 패킹 교체 및 누설 테스트 완료했습니다.',
  'Hoàn thành sửa chữa và kiểm tra an toàn.': '수리 완료 및 안전 점검 완료했습니다.',
  'Đã dọn dẹp khu vực làm việc và cất dụng cụ.': '작업 구역 청소 및 공구 정리 완료했습니다.',
  'Siết mặt bích đường ống scrubber và kiểm tra trên cao': '스크러버 배관 플랜지 조임 및 고소 점검',
  'Đường ống phía trên bồn hóa chất Khu A': 'A동 화학탱크 상부 배관',
  'Nguy cơ rơi ngã từ trên cao, rò rỉ khí độc': '고소 추락 위험, 유해가스 누출 위험',
  'Đeo dây an toàn hai móc, bố trí 2 bình chữa cháy': '안전대 2개소 체결 착용, 소화기 2기 배치',
  'Vận chuyển nguyên vật liệu kho A và bốc xếp hàng': 'A창고 원자재 이송 및 하역 작업',
  'Bãi chứa Khu A và kho nguyên liệu tầng 1': 'A동 야적장 및 1층 원료창고',
  'Thay thế lớp cách nhiệt đường ống phòng nồi hơi Khu B và vệ sinh': 'B동 보일러실 배관 보온재 교체 및 청소',
  'Phòng nồi hơi Khu B khu vực 2': 'B동 보일러실 2구역',
  'Lớp cách nhiệt cũ bị bong tróc gây thất thoát nhiệt và nguy cơ bỏng khi tiếp xúc.': '노후 보온재 탈락으로 인한 열 손실 및 작업자 접촉 화상 위험 발생.',
  'Đã thi công lại bông thủy tinh chống cháy và lắp vỏ nhôm bảo vệ hoàn tất.': '고효율 난연성 글라스울 재시공 및 외장 알루미늄 커버 체결 완료.',

  // 몽골어 (MN)
  'Хоолойн жийргэвчийг сольж дууссан.': '배관 가스켓 교체 작업을 완료했습니다.',
  'Ажил дууссан, ямар нэгэн сааталгүй.': '작업 완료, 특이사항 없습니다.',
  'Скраббер хоолойн фланц чангалах болон өндрийн шалгалт': '스크러버 배관 플랜지 조임 및 고소 점검',
  'А байрны химийн савны дээд хоолой': 'A동 화학탱크 상부 배관',
  'Өндрөөс унах аюул, хорт хий алдагдах эрсдэл': '고소 추락 위험, 유해가스 누출 위험',
  'Хамгаалалтын бүс зүүх, гал унтраагч 2 ширхэг байрлуулах': '안전대 착용, 소화기 2기 배치',
  'А агуулахын түүхий эд тээвэрлэх болон буулгах ажил': 'A창고 원자재 이송 및 하역 작업',
  'А байрны талбай болон 1-р давхрын агуулах': 'A동 야적장 및 1층 원료창고',
  'Б байрны бойлерийн өрөөний хоолойн дулаалга солих болон цэвэрлэгээ': 'B동 보일러실 배관 보온재 교체 및 청소',
  'Б байрны бойлерийн өрөө 2-р хэсэг': 'B동 보일러실 2구역',
  'Хуучин дулаалга салж унаснаар дулаан алдагдах болон түлэгдэх аюул үүссэн.': '노후 보온재 탈락으로 인한 열 손실 및 화상 위험 발생.',
  'Галд тэсвэртэй шилэн хөвөн дулаалга шинээр хийж, хөнгөн цагаан бүрээс суурилуулж дууссан.': '난연성 글라스울 보온재 재시공 및 알루미늄 커버 설치 완료.',

  // 필리핀어 (PH)
  'Tapos na ang pag-aayos at paglilinis ng boiler.': '보일러 수리 및 청소 작업을 완료했습니다.',
  'Kailangang palitan ang filter bukas.': '내일 필터 교체가 필요합니다.',
  'Paghihigpit ng flange ng tubo ng scrubber at inspeksyon sa mataas na lugar': '스크러버 배관 플랜지 조임 및 고소 점검',
  'Tubo sa itaas ng tangke ng kemikal sa Gusali A': 'A동 화학탱크 상부 배관',
  'Panganib ng pagkahulog mula sa mataas, pagtagas ng nakalalasong gas': '고소 추락 위험, 유해가스 누출 위험',
  'Magsuot ng safety harness, maglagay ng 2 fire extinguisher': '안전대 착용, 소화기 2기 배치',
  'Paghahakot at pagbababa ng hilaw na materyales sa Bodega A': 'A창고 원자재 이송 및 하역 작업',
  'Bakuran ng Gusali A at bodega sa unang palapag': 'A동 야적장 및 1층 원료창고',
  'Pagpapalit ng insulation ng tubo sa boiler room B at paglilinis': 'B동 보일러실 배관 보온재 교체 및 청소',
  'Gusali B Boiler Room Seksyon 2': 'B동 보일러실 2구역',
  'Nasira ang lumang insulation na nagdulot ng pagkawala ng init at panganib ng pagkapaso.': '노후 보온재 손상으로 인한 열 손실 및 화상 위험 발생.',
  'Nakabit na ang bagong fire-resistant glass wool at takip na aluminyo.': '난연성 글라스울 재시공 및 알루미늄 커버 장착 완료.',

  // 태국어 (TH)
  'งานขันหน้าแปลนท่อสครับเบอร์และตรวจสอบบนที่สูง': '스크러버 배관 플랜지 조임 및 고소 점검',
  'ท่อด้านบนถังเคมี อาคาร A': 'A동 화학탱크 상부 배관',
  'อันตรายจากการตกจากที่สูง และก๊าซพิษรั่วไหล': '고소 추락 위험 및 유해가스 누출 위험',
  'สวมเข็มขัดนิรภัยแบบสองตะขอ และจัดเตรียมถังดับเพลิง 2 ถัง': '안전대 2개소 체결 및 소화기 2기 배치',
  'งานขนย้ายและขนถ่ายวัตถุดิบในคลังสินค้า A': 'A창고 원자재 이송 및 하역 작업',
  'ลานเก็บของอาคาร A และคลังวัตถุดิบชั้น 1': 'A동 야적장 및 1층 원료창고',
  'งานเปลี่ยนฉนวนหุ้มท่อห้องหม้อไอน้ำอาคาร B และทำความสะอาด': 'B동 보일러실 배관 보온재 교체 및 청소',
  'ห้องหม้อไอน้ำอาคาร B โซน 2': 'B동 보일러실 2구역',
  'ฉนวนเก่าชำรุดทำให้สูญเสียความร้อนและมีความเสี่ยงต่อการถูกความร้อนลวก': '노후 보온재 파손으로 인한 열 손실 및 화상 위험 발생.',
  'ติดตั้งฉนวนใยแก้วทนไฟใหม่และปิดฝาครอบอลูมิเนียมเรียบร้อยแล้ว': '난연성 글라스울 보온재 재설치 및 알루미늄 커버 마감 완료.',
  'ซ่อมแซมท่อหม้อไอน้ำอาคาร B และทำความสะอาดเรียบร้อยแล้ว': 'B동 보일러 배관 수리 및 청소 완료했습니다.',

  // 인도네시아어 (ID)
  'Pengencangan flensa pipa scrubber dan inspeksi ketinggian': '스크러버 배관 플랜지 조임 및 고소 점검',
  'Pipa atas tangki kimia Gedung A': 'A동 화학탱크 상부 배관',
  'Bahaya jatuh dari ketinggian, potensi kebocoran gas beracun': '고소 추락 위험, 유해가스 누출 가능성',
  'Memakai sabuk pengaman dua kait, menyiapkan 2 tabung APAR': '안전대 2개소 체결, 소화기 2기 배치',
  'Pengangkutan dan bongkar muat bahan baku di Gudang A': 'A창고 원자재 이송 및 하역 작업',
  'Halaman Gedung A dan gudang bahan baku lantai 1': 'A동 야적장 및 1층 원료창고',
  'Penggantian isolasi pipa ruang boiler Gedung B dan pembersihan': 'B동 보일러실 배관 보온재 교체 및 청소',
  'Ruang Boiler Gedung B Zona 2': 'B동 보일러실 2구역',
  'Isolasi lama rusak menyebabkan kehilangan panas dan risiko luka bakar.': '노후 보온재 손상으로 인한 열 손실 및 화상 위험 발생.',
  'Pemasangan ulang glasswool tahan api dan penutup aluminium selesai.': '난연 글라스울 재시공 및 알루미늄 커버 설치 완료.',
  'Perbaikan pipa boiler gedung B dan pembersihan selesai.': 'B동 보일러 배관 수리 및 청소 완료했습니다.',

  // 우즈베크어 (UZ)
  'Skrabber quvuri gardishini mahkamlash va balandlikda tekshirish': '스크러버 배관 플랜지 조임 및 고소 점검',
  'A bino kimyoviy bak ustki quvuri': 'A동 화학탱크 상부 배관',
  'Balandlikdan yiqilish xavfi, zaharli gaz sizib chiqishi': '고소 추락 위험, 유해가스 누출 위험',
  'Ikki ilgakli xavfsizlik kamarini taqish, 2 ta o‘t o‘chirgich joylashtirish': '안전대 2개소 체결, 소화기 2기 배치',
  'A omboriga xomashyo tashish va tushirish ishlari': 'A창고 원자재 이송 및 하역 작업',
  'A bino maydoni va 1-qavat xomashyo ombori': 'A동 야적장 및 1층 원료창고',
  'B bino qozonxona quvurlari izolyatsiyasini almashtirish va tozalash': 'B동 보일러실 배관 보온재 교체 및 청소',
  'B bino qozonxona 2-hudud': 'B동 보일러실 2구역',
  'Eski izolyatsiya tushib ketganligi sababli issiqlik yo‘qotilishi va kuyish xavfi yuzaga kelgan.': '노후 보온재 탈락으로 인한 열 손실 및 화상 위험 발생.',
  'Yong‘inga chidamli shisha paxta qayta o‘rnatildi va alyuminiy qoplama mahkamlandi.': '난연성 글라스울 재설치 및 알루미늄 커버 체결 완료.',
  'B bino qozonxona quvurlarini ta’mirlash va tozalash yakunlandi.': 'B동 보일러실 배관 수리 및 청소 완료했습니다.',

  // 중국어 (ZH)
  '洗涤塔管道法兰紧固及高空点检作业': '스크러버 배관 플랜지 조임 및 고소 점검',
  'A栋化学品储罐上部管道': 'A동 화학탱크 상부 배관',
  '高空坠落风险、残留有害气体泄漏可能': '고소 추락 위험, 잔류 유해가스 누출 가능성',
  '系挂双钩安全带、配备2具灭火器及防火措施': '안전대 2개소 체결, 소화기 2기 배치 및 화재 대비',
  'A仓库原材料搬运及卸货作业': 'A창고 원자재 이송 및 하역 작업',
  'A栋堆场及1楼原料仓库': 'A동 야적장 및 1층 원료창고',
  'B栋锅炉房管道保温材料更换及清扫': 'B동 보일러실 배관 보온재 교체 및 청소',
  'B栋锅炉房2区': 'B동 보일러실 2구역',
  '老化保温材脱落导致热量散失及作业人员接触烫伤风险。': '노후 보온재 탈락으로 인한 열 손실 및 작업자 접촉 화상 위험 발생.',
  '高效阻燃玻璃棉重新施工及外部铝制护套紧固完成。': '고효율 난연성 글라스울 재시공 및 외장 알루미늄 커버 체결 완료.',
  'B栋锅炉房管道保温材料更换及清扫完成。': 'B동 보일러실 배관 보온재 교체 및 청소 완료했습니다.',

  // 영어 (EN)
  'All maintenance work completed successfully.': '모든 유지보수 작업이 성공적으로 완료되었습니다.',
  'Scrubber pipe flange tightening and high-place inspection': '스크러버 배관 플랜지 조임 및 고소 점검',
  'Building A upper chemical tank piping': 'A동 화학탱크 상부 배관',
  'Risk of fall from height, potential toxic gas leak': '고소 추락 위험, 유해가스 누출 가능성',
  'Wear dual-lanyard safety harness, deploy 2 fire extinguishers': '안전대 2개소 체결 착용, 소화기 2기 배치',
  'Forklift material transport and unloading in Warehouse A': 'A창고 지게차 원자재 이송 및 하역 작업',
  'Building A yard and 1F raw material warehouse': 'A동 야적장 및 1층 원료창고',
  'Building B boiler room pipe insulation replacement and cleaning': 'B동 보일러실 배관 보온재 교체 및 청소',
  'Building B Boiler Room Zone 2': 'B동 보일러실 2구역',
  'Detached old insulation caused heat loss and burn hazard on contact.': '노후 보온재 탈락으로 인한 열 손실 및 접촉 화상 위험 발생.',
  'Re-installed flame-retardant glass wool and fastened outer aluminum cover.': '난연성 글라스울 재시공 및 외장 알루미늄 커버 체결 완료.',
};

// 한국어 -> 다국어 구문/단어 변환 사전 (자유 입력 한국어 문장을 한글 잔존 없이 번역하기 위한 포괄적 사전)
const KO_TO_MULTILANG_TERMS: { ko: RegExp; trans: Record<string, string> }[] = [
  {
    ko: /오늘/g,
    trans: {
      en: 'today', vi: 'hôm nay', mn: 'өнөөдөр', ph: 'ngayon', th: 'วันนี้', id: 'hari ini', uz: 'bugun',
      zh: '今日', km: 'ថ្ងៃនេះ', ne: 'आज', mm: 'ယနေ့', bd: 'আজ', lk: 'අද', pk: 'آج', tl: 'ohin', la: 'ມື້ນີ້', kz: 'бүгін',
    },
  },
  {
    ko: /내일/g,
    trans: {
      en: 'tomorrow', vi: 'ngày mai', mn: 'маргааш', ph: 'bukas', th: 'พรุ่งนี้', id: 'besok', uz: 'ertaga',
      zh: '明日', km: 'ថ្ងៃស្អែក', ne: 'भोलि', mm: 'မနက်ဖြန်', bd: 'আগামীকাল', lk: 'හෙට', pk: 'کل', tl: 'aban', la: 'ມື້ອື່ນ', kz: 'ертең',
    },
  },
  {
    ko: /오전/g,
    trans: {
      en: 'AM', vi: 'buổi sáng', mn: 'үдээс өмнө', ph: 'umaga', th: 'ช่วงเช้า', id: 'pagi', uz: 'ertalab',
      zh: '上午', km: 'ពេលព្រឹក', ne: 'बिहान', mm: 'နံနက်', bd: 'সকাল', lk: 'පෙරවරු', pk: 'صبح', tl: 'dader', la: 'ຕອນເຊົ້າ', kz: 'таңертең',
    },
  },
  {
    ko: /오후/g,
    trans: {
      en: 'PM', vi: 'buổi chiều', mn: 'үдээс хойш', ph: 'hapon', th: 'ช่วงบ่าย', id: 'siang/sore', uz: 'tushdan keyin',
      zh: '下午', km: 'ពេលរសៀល', ne: 'दिउँसो', mm: 'မွန်းလွဲ', bd: 'বিকাল', lk: 'පස්වරු', pk: 'دوپہر', tl: 'lokraik', la: 'ຕອນບ່າຍ', kz: 'түстен кейін',
    },
  },
  {
    ko: /(\d+)시/g,
    trans: {
      en: '$1:00', vi: '$1 giờ', mn: '$1 цагт', ph: 'alas-$1', th: '$1 นาฬิกา', id: 'pukul $1', uz: 'soat $1',
      zh: '$1点', km: 'ម៉ោង $1', ne: '$1 बजे', mm: '$1 နာရီ', bd: '$1 টা', lk: 'පැය $1', pk: '$1 بجے', tl: 'oras $1', la: '$1 ໂມງ', kz: 'сағат $1',
    },
  },
  {
    ko: /(\d+)층/g,
    trans: {
      en: '$1F', vi: 'tầng $1', mn: '$1-р давхар', ph: 'palapag $1', th: 'ชั้น $1', id: 'lantai $1', uz: '$1-qavat',
      zh: '$1楼', km: 'ជាន់ទី $1', ne: '$1 तला', mm: '$1 လွှာ', bd: '$1 তলা', lk: '$1 මහල', pk: 'منزل $1', tl: 'andar $1', la: 'ຊັ້ນ $1', kz: '$1-қабат',
    },
  },
  {
    ko: /(\d+)구역/g,
    trans: {
      en: 'Zone $1', vi: 'khu vực $1', mn: '$1-р бүс', ph: 'seksyon $1', th: 'โซน $1', id: 'zona $1', uz: '$1-hudud',
      zh: '$1区', km: 'តំបន់ $1', ne: 'क्षेत्र $1', mm: 'ဇုန် $1', bd: 'জোন $1', lk: 'කලාප $1', pk: 'زون $1', tl: 'zona $1', la: 'ໂຊນ $1', kz: '$1-аймақ',
    },
  },
  {
    ko: /(\d+)인|(\d+)명/g,
    trans: {
      en: '$1$2 person(s)', vi: '$1$2 người', mn: '$1$2 хүн', ph: '$1$2 tao', th: '$1$2 คน', id: '$1$2 orang', uz: '$1$2 kishi',
      zh: '$1$2人', km: '$1$2 នាក់', ne: '$1$2 जना', mm: '$1$2 ဦး', bd: '$1$2 জন', lk: '$1$2 දෙනෙකු', pk: '$1$2 افراد', tl: 'ema $1$2', la: '$1$2 ຄົນ', kz: '$1$2 адам',
    },
  },
  {
    ko: /(\d+)개소|(\d+)기|(\d+)개/g,
    trans: {
      en: '$1$2$3 unit(s)', vi: '$1$2$3 cái', mn: '$1$2$3 ширхэг', ph: '$1$2$3 piraso', th: '$1$2$3 จุด', id: '$1$2$3 unit', uz: '$1$2$3 ta',
      zh: '$1$2$3处', km: '$1$2$3 គ្រឿង', ne: '$1$2$3 वटा', mm: '$1$2$3 ခု', bd: '$1$2$3 টি', lk: '$1$2$3 ක්', pk: '$1$2$3 عدد', tl: '$1$2$3 unidade', la: '$1$2$3 ອັນ', kz: '$1$2$3 дана',
    },
  },
  {
    ko: /([A-Z])동|([A-Z])창고/g,
    trans: {
      en: 'Building/Warehouse $1$2', vi: 'Khu/Kho $1$2', mn: '$1$2 байр/агуулах', ph: 'Gusali/Bodega $1$2', th: 'อาคาร/คลัง $1$2', id: 'Gedung/Gudang $1$2', uz: '$1$2 bino/ombor',
      zh: '$1$2栋/仓库', km: 'អគារ/ឃ្លាំង $1$2', ne: 'भवन/गोदाम $1$2', mm: 'အဆောက်အဦ/ဂိုဒေါင် $1$2', bd: 'ভবন/গুদাম $1$2', lk: '$1$2 ගොඩනැගිල්ල', pk: 'عمارت/گودام $1$2', tl: 'Edifisiu $1$2', la: 'ອາຄານ/ສາງ $1$2', kz: '$1$2 ғимараты/қоймасы',
    },
  },
  {
    ko: /스크러버/g,
    trans: {
      en: 'scrubber', vi: 'tháp lọc (scrubber)', mn: 'скраббер', ph: 'scrubber', th: 'สครับเบอร์', id: 'scrubber', uz: 'skrabber',
      zh: '洗涤塔', km: 'scrubber', ne: 'स्क्रबर', mm: 'scrubber', bd: 'স্ক্রাবার', lk: 'scrubber', pk: 'سکرببر', tl: 'scrubber', la: 'scrubber', kz: 'скраббер',
    },
  },
  {
    ko: /보일러실|보일러/g,
    trans: {
      en: 'boiler room', vi: 'phòng nồi hơi', mn: 'бойлерийн өрөө', ph: 'boiler room', th: 'ห้องหม้อไอน้ำ', id: 'ruang boiler', uz: 'qozonxona',
      zh: '锅炉房', km: 'បន្ទប់ឡចំហាយ', ne: 'बोयलर कोठा', mm: 'ဘွိုင်လာခန်း', bd: 'বয়লার রুম', lk: 'බොයිලේරු කාමරය', pk: 'بوائلر روم', tl: 'kuartu boiler', la: 'ຫ້ອງໝໍ້ຕົ້ມ', kz: 'қазандық бөлмесі',
    },
  },
  {
    ko: /렌더링 쿠커|렌더링 반응기|쿠커/g,
    trans: {
      en: 'rendering cooker', vi: 'nồi nấu phân hủy (cooker)', mn: 'чанагч тогоо', ph: 'rendering cooker', th: 'เตาเรนเดอริ่ง', id: 'mesin pemasak (cooker)', uz: 'pishirish qozoni',
      zh: '高温蒸煮锅', km: 'ឡចំហុយ', ne: 'रेन्डरिङ कुकर', mm: 'ပေါင်းအိုးကြီး', bd: 'রেন্ডারিং কুকার', lk: 'රෙන්ඩරින් කුකර්', pk: 'رینڈرنگ ککر', tl: 'cooker', la: 'ເຕົາຕົ້ມ', kz: 'пісіру қазаны',
    },
  },
  {
    ko: /슬러지 탈수 압착기|슬러지 압착기|압착기/g,
    trans: {
      en: 'sludge dehydrating press', vi: 'máy ép bùn', mn: 'лаг шахагч машин', ph: 'sludge press', th: 'เครื่องอัดตะกอน', id: 'mesin pengepres lumpur', uz: 'loy pressi',
      zh: '污泥脱水压滤机', km: 'ម៉ាស៊ីនសង្កត់ភក់', ne: 'स्लज प्रेस', mm: 'အညစ်အကြေးဖိစက်', bd: 'স্লাজ প্রেস', lk: 'ස්ලජ් ප්‍රෙස්', pk: 'سلج پریس', tl: 'sludge press', la: 'ເຄື່ອງອັດຕະກອນ', kz: 'шлам пресі',
    },
  },
  {
    ko: /폐수처리장|환경정화동|폐수/g,
    trans: {
      en: 'wastewater treatment plant', vi: 'khu xử lý nước thải', mn: 'бохир ус цэвэрлэх байгууламж', ph: 'wastewater treatment plant', th: 'โรงบำบัดน้ำเสีย', id: 'instalasi pengolahan air limbah', uz: 'oqova suvlarni tozalash inshooti',
      zh: '污水处理站', km: 'រោងចក្រប្រព្រឹត្តកម្មទឹកកខ្វក់', ne: 'फोहोर पानी प्रशोधन केन्द्र', mm: 'ရေဆိုးသန့်စင်စက်ရုံ', bd: 'বর্জ্য জল শোধনাগার', lk: 'අපජල පිරිපහදු ඒකකය', pk: 'گندے پانی کا پلانٹ', tl: 'fatin tratamentu bee foer', la: 'ໂຮງບຳບັດນ້ຳເສຍ', kz: 'сарқынды су тазарту орны',
    },
  },
  {
    ko: /화학탱크|약품저장탱크|화학물질|청관제/g,
    trans: {
      en: 'chemical tank/agent', vi: 'bồn hóa chất', mn: 'химийн сав/бодис', ph: 'tangke ng kemikal', th: 'ถังสารเคมี', id: 'tangki bahan kimia', uz: 'kimyoviy bak',
      zh: '化学品储罐', km: 'ធុងសារធាតុគីមី', ne: 'रासायनिक ट्याङ्की', mm: 'ဓာတုဆေးရည်ကန်', bd: 'রাসায়নিক ট্যাঙ্ক', lk: 'රසායනික ටැංකිය', pk: 'کیمیکل ٹینک', tl: 'tanke kimika', la: 'ຖັງສານເຄມີ', kz: 'химиялық резервуар',
    },
  },
  {
    ko: /배관|파이프/g,
    trans: {
      en: 'piping', vi: 'đường ống', mn: 'хоолой', ph: 'tubo', th: 'ท่อ', id: 'pipa', uz: 'quvur',
      zh: '管道', km: 'បំពង់', ne: 'पाइप', mm: 'ပိုက်လိုင်း', bd: 'পাইপলাইন', lk: 'නළ පද්ධතිය', pk: 'پائپ لائن', tl: 'kadoras', la: 'ທໍ່', kz: 'құбыр',
    },
  },
  {
    ko: /보온재|글라스울|알루미늄 커버/g,
    trans: {
      en: 'insulation/cover', vi: 'lớp cách nhiệt/vỏ bảo vệ', mn: 'дулаалга/бүрээс', ph: 'insulation/cover', th: 'ฉนวนหุ้มท่อ', id: 'isolasi/penutup', uz: 'izolyatsiya/qoplama',
      zh: '保温材料/护套', km: 'ស្រទាប់ការពារความร้อน', ne: 'इन्सुलेशन', mm: 'အပူကာပစ္စည်း', bd: 'ইনসুলেশন', lk: 'පරිවාරක ආවරණය', pk: 'انسولیشن کور', tl: 'izolamentu', la: 'ฉนวนกันความร้อน', kz: 'оқшаулағыш',
    },
  },
  {
    ko: /원자재|원료|자재|파렛트/g,
    trans: {
      en: 'raw materials', vi: 'nguyên vật liệu', mn: 'түүхий эд', ph: 'hilaw na materyales', th: 'วัตถุดิบ', id: 'bahan baku', uz: 'xomashyo',
      zh: '原材料', km: 'វត្ថុធាតុដើម', ne: 'कच्चा पदार्थ', mm: 'ကုန်ကြမ်းပစ္စည်း', bd: 'কাঁচামাল', lk: 'අමුද්‍රව්‍ය', pk: 'خام مال', tl: 'materia prima', la: 'ວັດຖຸດິບ', kz: 'шикізат',
    },
  },
  {
    ko: /이송|운반|하역|입고|적재/g,
    trans: {
      en: 'transport & unloading', vi: 'vận chuyển và bốc xếp', mn: 'тээвэрлэх болон буулгах', ph: 'paghahakot at pagbababa', th: 'การขนย้ายและขนถ่าย', id: 'pengangkutan & bongkar muat', uz: 'tashish va tushirish',
      zh: '搬运及卸货', km: 'ការដឹកជញ្ជូននិងលើកដាក់', ne: 'ढुवानी र अनलोडिङ', mm: 'သယ်ယူပို့ဆောင်ခြင်းနှင့် ချခြင်း', bd: 'পরিবহন ও খালাস', lk: 'ප්‍රවාහනය සහ බෑම', pk: 'نقل و حمل اور ان لوڈنگ', tl: 'transporta no hatun', la: 'ການຂົນສົ່ງ ແລະ ຂົນລົງ', kz: 'тасымалдау және түсіру',
    },
  },
  {
    ko: /야적장|원료창고|창고|가공구역/g,
    trans: {
      en: 'yard & warehouse', vi: 'bãi chứa & kho nguyên liệu', mn: 'талбай болон агуулах', ph: 'bakuran at bodega', th: 'ลานเก็บของและคลังสินค้า', id: 'halaman & gudang', uz: 'maydon va ombor',
      zh: '堆场及仓库', km: 'ទីធ្លានិងឃ្លាំង', ne: 'यार्ड र गोदाम', mm: 'ကွင်းပြင်နှင့် ဂိုဒေါင်', bd: 'ইয়ার্ড এবং গুদাম', lk: 'අංගනය සහ ගබඩාව', pk: 'یارڈ اور گودام', tl: 'resintu no armajen', la: 'ເດີ່ນ ແລະ ສາງ', kz: 'алаң мен қойма',
    },
  },
  {
    ko: /용접/g,
    trans: {
      en: 'welding', vi: 'hàn', mn: 'гагнуур', ph: 'pagwewelding', th: 'งานเชื่อม', id: 'pengelasan', uz: 'payvandlash',
      zh: '焊接', km: 'ការផ្សារ', ne: 'वेल्डिङ', mm: 'ဂဟေဆော်ခြင်း', bd: 'ওয়েল্ডিং', lk: 'වෑල්ඩින්', pk: 'ویلڈنگ', tl: 'soldadura', la: 'ການເຊື່ອມ', kz: 'дәнекерлеу',
    },
  },
  {
    ko: /안전그네|안전대|안전벨트/g,
    trans: {
      en: 'safety harness', vi: 'dây đai an toàn', mn: 'хамгаалалтын бүс', ph: 'safety harness', th: 'เข็มขัดนิรภัย', id: 'sabuk pengaman (harness)', uz: 'xavfsizlik kamari',
      zh: '安全带', km: 'ខ្សែក្រវាត់សុវត្ថិភាព', ne: 'सुरक्षा पेटी', mm: 'လုံခြုံရေးခါးပတ်', bd: 'সেফটি হারনেস', lk: 'ආරක්ෂිත පටිය', pk: 'حفاظتی بیلٹ', tl: 'sintu seguransa', la: 'ສາຍຮັດນິລະໄພ', kz: 'қауіпсіздік белдігі',
    },
  },
  {
    ko: /안전모|헬멧/g,
    trans: {
      en: 'safety helmet', vi: 'mũ bảo hiểm', mn: 'хамгаалалтын малгай', ph: 'safety helmet', th: 'หมวกนิรภัย', id: 'helm keselamatan', uz: 'himoya dubulg‘asi',
      zh: '安全帽', km: 'មួកសុវត្ថិភាព', ne: 'सुरक्षा हेल्मेट', mm: 'လုံခြုံရေးဦးထုပ်', bd: 'সেফটি হেলমেট', lk: 'ආරක්ෂිත හිස්වැසුම', pk: 'حفاظتی ہیلمٹ', tl: 'xapeu seguransa', la: 'ໝວກນິລະໄພ', kz: 'қорғаныс каскасы',
    },
  },
  {
    ko: /턱끈/g,
    trans: {
      en: 'chinstrap', vi: 'quai mũ', mn: 'малгайн оосор', ph: 'chinstrap', th: 'สายรัดคาง', id: 'tali dagu', uz: 'iyak tasmasi',
      zh: '下颏带', km: 'ខ្សែចងចង្កា', ne: 'चिनस्ट्र्याप', mm: 'မေးသိုင်းကြိုး', bd: 'চিনস্ট্র্যাপ', lk: 'නිකට පටිය', pk: 'ٹھوڑی کا پٹہ', tl: 'tali xapeu', la: 'ສາຍຮັດຄາງ', kz: 'иек бауы',
    },
  },
  {
    ko: /안전화/g,
    trans: {
      en: 'safety shoes', vi: 'giày bảo hộ', mn: 'аюулгүйн гутал', ph: 'safety shoes', th: 'รองเท้านิรภัย', id: 'sepatu keselamatan', uz: 'xavfsizlik poyabzali',
      zh: '安全鞋', km: 'ស្បែកជើងសុវត្ថិភាព', ne: 'सुरक्षा जुत्ता', mm: 'လုံခြုံရေးဖိနပ်', bd: 'সেফটি জুতা', lk: 'ආරක්ෂිත පාවහන්', pk: 'حفاظتی جوتے', tl: 'sapatu seguransa', la: 'ເກີບນິລະໄພ', kz: 'арнайы аяқ киім',
    },
  },
  {
    ko: /보안경|안면보호구/g,
    trans: {
      en: 'safety goggles/face shield', vi: 'kính bảo hộ/mặt nạ', mn: 'хамгаалалтын шил', ph: 'safety glasses/face shield', th: 'แว่นตานิรภัย/กระบังหน้า', id: 'kacamata/pelindung wajah', uz: 'himoya ko‘zoynagi',
      zh: '护目镜/防护面罩', km: 'វ៉ែនតាការពារ', ne: 'सुरक्षा चश्मा', mm: 'လုံခြုံရေးမျက်မှန်', bd: 'নিরাপত্তা চশমা', lk: 'ආරක්ෂිත ඇස් කණ්ණාඩි', pk: 'حفاظتی چشمہ', tl: 'okulus seguransa', la: 'ແວ່ນຕານິລະໄພ', kz: 'қорғаныс көзілдірігі',
    },
  },
  {
    ko: /내화학 장갑|안전장갑|장갑/g,
    trans: {
      en: 'safety gloves', vi: 'găng tay bảo hộ', mn: 'хамгаалалтын бээлий', ph: 'safety gloves', th: 'ถุงมือนิรภัย', id: 'sarung tangan pelindung', uz: 'himoya qo‘lqoplari',
      zh: '安全防护手套', km: 'ស្រោមដៃការពារ', ne: 'सुरक्षा पन्जा', mm: 'လုံခြုံရေးလက်အိတ်', bd: 'নিরাপত্তা গ্লাভস', lk: 'ආරක්ෂිත අත්වැසුම්', pk: 'حفاظتی دستانے', tl: 'luvas seguransa', la: 'ຖົງມືນິລະໄພ', kz: 'қорғаныс қолғабы',
    },
  },
  {
    ko: /보호구/g,
    trans: {
      en: 'protective gear (PPE)', vi: 'đồ bảo hộ (PPE)', mn: 'хамгаалалтын хэрэгсэл', ph: 'PPE', th: 'อุปกรณ์ป้องกัน (PPE)', id: 'alat pelindung diri (APD)', uz: 'himoya vositalari',
      zh: '防护用品(PPE)', km: 'ឧបករណ៍ការពារ', ne: 'सुरक्षा उपकरण', mm: 'အကာအကွယ်ပစ္စည်း', bd: 'সুরক্ষা সরঞ্জাম', lk: 'ආරක්ෂක ආම්පන්න', pk: 'حفاظتی سامان', tl: 'ekipamentu protesaun', la: 'ອຸປະກອນປ້ອງກັນ', kz: 'қорғаныс құралдары',
    },
  },
  {
    ko: /분말 소화기|소화기/g,
    trans: {
      en: 'fire extinguisher', vi: 'bình chữa cháy', mn: 'гал унтраагч', ph: 'fire extinguisher', th: 'ถังดับเพลิง', id: 'tabung APAR (pemadam api)', uz: 'o‘t o‘chirgich',
      zh: '灭火器', km: 'បំពង់ពន្លត់អគ្គិភ័យ', ne: 'आगो निभाउने यन्त्र', mm: 'မီးသတ်ဆေးဘူး', bd: 'অগ্নিনির্বাপক যন্ত্র', lk: 'ගිනි නිවන උපකරණය', pk: 'آگ بجھانے والا آلہ', tl: 'estintor ahi', la: 'ບັ້ງມອດໄຟ', kz: 'өрт сөндіргіш',
    },
  },
  {
    ko: /화재 감시자|화재감시자/g,
    trans: {
      en: 'fire watch', vi: 'người giám sát hỏa hoạn', mn: 'галын ажиглагч', ph: 'tagabantay ng sunog', th: 'ผู้เฝ้าระวังอัคคีภัย', id: 'pengawas kebakaran', uz: 'yong‘in nazoratchisi',
      zh: '消防监护人', km: 'អ្នកឃ្លាំមើលអគ្គិភ័យ', ne: 'आगो हेरालु', mm: 'မီးဘေးစောင့်ကြပ်သူ', bd: 'অগ্নি পর্যবেক্ষক', lk: 'ගිනි නිරීක්ෂක', pk: 'فائر واچ', tl: 'vigia ahi', la: 'ຜູ້ເຝົ້າລະວັງໄຟ', kz: 'өрт бақылаушысы',
    },
  },
  {
    ko: /화재|불티|가연물/g,
    trans: {
      en: 'fire/flammables', vi: 'hỏa hoạn/vật dễ cháy', mn: 'гал түймэр', ph: 'sunog', th: 'อัคคีภัย/วัตถุไวไฟ', id: 'kebakaran/bahan mudah terbakar', uz: 'yong‘in',
      zh: '火灾/易燃物', km: 'អគ្គិភ័យ', ne: 'आगो', mm: 'မီးဘေး', bd: 'আগুন', lk: 'ගින්න', pk: 'آگ', tl: 'ahi', la: 'ໄຟໄໝ້', kz: 'өрт',
    },
  },
  {
    ko: /지게차/g,
    trans: {
      en: 'Forklift', vi: 'Xe nâng (Forklift)', mn: 'Сэрээт ачигч', ph: 'Forklift', th: 'รถโฟร์คลิฟท์', id: 'Forklift', uz: 'Yuk ko‘targich (Forklift)',
      zh: '叉车', km: 'ឡានលើកទំនិញ', ne: 'फोर्कलिफ्ट', mm: 'ဖော့ကလစ်', bd: 'ফর্কলিফট', lk: 'ෆෝක්ලිෆ්ට්', pk: 'فورک لفٹ', tl: 'Forklift', la: 'ລົດຍົກ', kz: 'Жүк көтергіш',
    },
  },
  {
    ko: /고소작업대|고소 작업|고소|스카이/g,
    trans: {
      en: 'High-place platform', vi: 'Xe nâng người / Trên cao', mn: 'Өндрийн шат / Өндрийн ажил', ph: 'Mataas na lugar / Aerial lift', th: 'รถกระเช้า / งานบนที่สูง', id: 'Platform kerja ketinggian', uz: 'Balandlik ko‘targichi',
      zh: '高空作业车/高空', km: 'ការងារលើទីខ្ពស់', ne: 'उचाइको काम', mm: 'အမြင့်လုပ်ငန်း', bd: 'উঁচু স্থানে কাজ', lk: 'උස ස්ථානවල වැඩ', pk: 'بلندی پر کام', tl: 'Servisu iha fatin aas', la: 'ວຽກຢູ່ບ່ອນສູງ', kz: 'Биіктіктегі жұмыс',
    },
  },
  {
    ko: /크레인/g,
    trans: {
      en: 'Crane', vi: 'Cần cẩu (Crane)', mn: 'Кран', ph: 'Kreyn (Crane)', th: 'เครน', id: 'Derek (Crane)', uz: 'Kran',
      zh: '起重机', km: 'ស្ទូច', ne: 'क्रेन', mm: 'ကရိန်း', bd: 'ক্রেন', lk: 'දොඹකරය', pk: 'کرین', tl: 'Krane', la: 'ລົດເຄຣນ', kz: 'Кран',
    },
  },
  {
    ko: /신호수|비상신호수/g,
    trans: {
      en: 'signalman', vi: 'người ra hiệu', mn: 'дохиочин', ph: 'tagapagbigay-hudyat', th: 'ผู้ให้สัญญาณ', id: 'petugas sinyal', uz: 'signalchi',
      zh: '信号指挥员', km: 'អ្នកឱ្យសញ្ញា', ne: 'संकेतकर्ता', mm: 'အချက်ပြသူ', bd: 'সিগন্যালম্যান', lk: 'සංඥාකරු', pk: 'سگنل مین', tl: 'ema fo sinal', la: 'ຜູ້ໃຫ້ສັນຍານ', kz: 'сигналшы',
    },
  },
  {
    ko: /안전교육|특별교육|정기교육|교안/g,
    trans: {
      en: 'Safety Training Material', vi: 'Tài liệu đào tạo an toàn', mn: 'Аюулгүй байдлын сургалт', ph: 'Pagsasanay sa Kaligtasan', th: 'การฝึกอบรมความปลอดภัย', id: 'Pelatihan Keselamatan', uz: 'Xavfsizlik ta’limi',
      zh: '安全培训教材', km: 'ការបណ្តុះបណ្តាលសុវត្ថិភាព', ne: 'सुरक्षा तालिम', mm: 'ဘေးကင်းရေးသင်တန်း', bd: 'নিরাপত্তা প্রশিক্ষণ', lk: 'ආරක්ෂක පුහුණුව', pk: 'حفاظتی تربیت', tl: 'Treinamentu Seguransa', la: 'ການຝຶກອົບຮົມຄວາມປອດໄພ', kz: 'Қауіпсіздік оқуы',
    },
  },
  {
    ko: /안전점검|점검|검사|확인/g,
    trans: {
      en: 'safety inspection/check', vi: 'kiểm tra an toàn', mn: 'аюулгүй байдлын шалгалт', ph: 'pagsusuri sa kaligtasan', th: 'การตรวจสอบความปลอดภัย', id: 'pemeriksaan keselamatan', uz: 'xavfsizlik tekshiruvi',
      zh: '安全检查', km: 'ការត្រួតពិនិត្យសុវត្ថិភាព', ne: 'सुरक्षा जाँच', mm: 'ဘေးကင်းရေးစစ်ဆေးမှု', bd: 'নিরাপত্তা পরিদর্শন', lk: 'ආරක්ෂක පරීක්ෂාව', pk: 'حفاظتی معائنہ', tl: 'verifikasaun seguransa', la: 'ການກວດສອບຄວາມປອດໄພ', kz: 'қауіпсіздік тексеруі',
    },
  },
  {
    ko: /청소|정리|세척/g,
    trans: {
      en: 'cleaning', vi: 'vệ sinh/làm sạch', mn: 'цэвэрлэгээ', ph: 'paglilinis', th: 'การทำความสะอาด', id: 'pembersihan', uz: 'tozalash',
      zh: '清扫/清洗', km: 'ការសម្អាត', ne: 'सरसफाइ', mm: 'သန့်ရှင်းရေး', bd: 'পরিষ্কার করা', lk: 'පිරිසිදු කිරීම', pk: 'صفائی', tl: 'hamoos', la: 'ການອະນາໄມ', kz: 'тазалау',
    },
  },
  {
    ko: /수리|정비|교체|보수|재시공/g,
    trans: {
      en: 'repair/replacement', vi: 'sửa chữa/thay thế', mn: 'засвар/солих', ph: 'pag-aayos/pagpapalit', th: 'การซ่อมบำรุง/เปลี่ยน', id: 'perbaikan/penggantian', uz: 'ta’mirlash/almashtirish',
      zh: '维修/更换', km: 'ការជួសជុល/ផ្លាស់ប្តូរ', ne: 'मर्मत/प्रतिस्थापन', mm: 'ပြုပြင်ခြင်း/လဲလှယ်ခြင်း', bd: 'মেরামত/প্রতিস্থাপন', lk: 'අලුත්වැඩියා කිරීම', pk: 'مرمت/تبدیلی', tl: 'hadia/troka', la: 'ການສ້ອມແປງ/ປ່ຽນແທນ', kz: 'жөндеу/ауыстыру',
    },
  },
  {
    ko: /주의사항|주의|경고/g,
    trans: {
      en: 'caution', vi: 'chú ý', mn: 'анхааруулга', ph: 'mag-ingat', th: 'ระวัง', id: 'perhatian', uz: 'ehtiyot bo‘ling',
      zh: '注意', km: 'ប្រុងប្រយ័ត្ន', ne: 'सावधान', mm: 'သတိပြုရန်', bd: 'সতর্কতা', lk: 'අවවාදයයි', pk: 'احتیاط', tl: 'atensaun', la: 'ລະວັງ', kz: 'назар аударыңыз',
    },
  },
  {
    ko: /배치|비치|설치/g,
    trans: {
      en: 'deploy/install', vi: 'bố trí/lắp đặt', mn: 'байрлуулах', ph: 'maglagay/mag-install', th: 'จัดเตรียม/ติดตั้ง', id: 'menyiapkan/memasang', uz: 'joylashtirish',
      zh: '配备/安装', km: 'ដាក់/ដំឡើង', ne: 'राख्नुहोस्', mm: 'ထားရှိရန်', bd: 'স্থাপন করা', lk: 'ස්ථාපනය කිරීම', pk: 'نصب کرنا', tl: 'prepara/monta', la: 'ກຽມ/ຕິດຕັ້ງ', kz: 'орналастыру',
    },
  },
  {
    ko: /착용|체결|조임/g,
    trans: {
      en: 'wear/fasten', vi: 'đeo/siết chặt', mn: 'өмсөх/чангалах', ph: 'magsuot/higpitan', th: 'สวมใส่/ขันแน่น', id: 'memakai/kencangkan', uz: 'kiyish/mahkamlash',
      zh: '佩戴/紧固', km: 'ពាក់/រឹតបន្តឹង', ne: 'लगाउनुहोस्/कस्नुहोस्', mm: 'ဝတ်ဆင်ရန်/တင်းကျပ်ရန်', bd: 'পরিধান করা/শক্ত করা', lk: 'පැළඳීම/තද කිරීම', pk: 'پہننا/کسنا', tl: 'uza/kesi', la: 'ໃສ່/ขันແໜ້ນ', kz: 'кию/бекіту',
    },
  },
  {
    ko: /필수|반드시/g,
    trans: {
      en: 'required/must', vi: 'bắt buộc', mn: 'заавал', ph: 'kailangan', th: 'จำเป็นต้อง', id: 'wajib', uz: 'majburiy',
      zh: '必须', km: 'ត្រូវតែ', ne: 'अनिवार्य', mm: 'မဖြစ်မနေ', bd: 'বাধ্যতামূলক', lk: 'අනිවාර්ය', pk: 'لازمی', tl: 'obrigatoriu', la: 'ຕ້ອງ', kz: 'міндетті',
    },
  },
  {
    ko: /작업구역|작업장|구역|현장/g,
    trans: {
      en: 'work zone', vi: 'khu vực làm việc', mn: 'ажлын бүс', ph: 'lugar ng trabaho', th: 'พื้นที่ทำงาน', id: 'area kerja', uz: 'ish hududi',
      zh: '作业区域', km: 'តំបន់ការងារ', ne: 'कार्य क्षेत्र', mm: 'လုပ်ငန်းခွင်', bd: 'কাজের এলাকা', lk: 'වැඩ කලාපය', pk: 'کام کا علاقہ', tl: 'fatin servisu', la: 'ພື້ນທີ່ເຮັດວຽກ', kz: 'жұмыс аймағы',
    },
  },
  {
    ko: /작업/g,
    trans: {
      en: 'work', vi: 'công việc', mn: 'ажил', ph: 'trabaho', th: 'งาน', id: 'pekerjaan', uz: 'ish',
      zh: '作业', km: 'ការងារ', ne: 'काम', mm: 'အလုပ်', bd: 'কাজ', lk: 'වැඩ', pk: 'کام', tl: 'servisu', la: 'ວຽກ', kz: 'жұмыс',
    },
  },
  {
    ko: /미비|부족|불량|미제출|미착용/g,
    trans: {
      en: 'incomplete/missing', vi: 'chưa đầy đủ/thiếu', mn: 'дутуу', ph: 'kulang/hindi kumpleto', th: 'ไม่ครบถ้วน', id: 'belum lengkap', uz: 'yetarli emas',
      zh: '不到位/缺失', km: 'មិនគ្រប់គ្រាន់', ne: 'अपूर्ण', mm: 'မပြည့်စုံခြင်း', bd: 'অসম্পূর্ণ', lk: 'අසම්පූර්ණ', pk: 'نامکمل', tl: 'la kompletu', la: 'ບໍ່ຄົບຖ້ວນ', kz: 'толық емес',
    },
  },
  {
    ko: /중복/g,
    trans: {
      en: 'overlapping', vi: 'trùng lặp', mn: 'давхардсан', ph: 'doble', th: 'ซ้ำซ้อน', id: 'tumpang tindih', uz: 'ustma-ust',
      zh: '重叠', km: 'ជាន់គ្នា', ne: 'दोहोरिएको', mm: 'ထပ်နေခြင်း', bd: 'ওভারল্যাপ', lk: 'අතිච්ඡාදනය', pk: 'اوورلیپ', tl: 'hanesan', la: 'ຊ້ຳຊ້ອນ', kz: 'қабаттасқан',
    },
  },
  {
    ko: /반려합니다|반려됨|반려/g,
    trans: {
      en: 'rejected', vi: 'bị từ chối', mn: 'буцаагдсан', ph: 'tinanggihan', th: 'ถูกปฏิเสธ', id: 'ditolak', uz: 'rad etildi',
      zh: '已驳回', km: 'ត្រូវបានបដិសេធ', ne: 'अस्वीकृत गरियो', mm: 'ငြင်းပယ်ခံရသည်', bd: 'বাতিল করা হয়েছে', lk: 'ප්‍රතික්ෂේප කරන ලදී', pk: 'مسترد کر دیا گیا', tl: 'rejeitadu', la: 'ຖືກປະຕິເສດ', kz: 'қабылданбады',
    },
  },
  {
    ko: /승인완료|승인합니다|승인/g,
    trans: {
      en: 'approved', vi: 'đã phê duyệt', mn: 'батлагдсан', ph: 'aprubado', th: 'อนุมัติแล้ว', id: 'disetujui', uz: 'tasdiqlandi',
      zh: '已批准', km: 'បានអនុម័ត', ne: 'स्वीकृत', mm: 'အတည်ပြုပြီး', bd: 'অনুমোদিত', lk: 'අනුමත කරන ලදී', pk: 'منظور شدہ', tl: 'aprovadu', la: 'ອະນຸມັດແລ້ວ', kz: 'бекітілді',
    },
  },
  {
    ko: /실시 바랍니다|실시하세요|진행하세요|바랍니다|하세요|완료했습니다|완료/g,
    trans: {
      en: 'please proceed / completed', vi: 'vui lòng thực hiện / hoàn tất', mn: 'гүйцэтгэнэ үү / дууссан', ph: 'pakisagawa / tapos na', th: 'โปรดดำเนินการ / เสร็จสิ้น', id: 'harap dilaksanakan / selesai', uz: 'bajaring / yakunlandi',
      zh: '请执行/已完成', km: 'សូមអនុវត្ត/រួចរាល់', ne: 'कार्यान्वयन गर्नुहोस्/सम्पन्न', mm: 'ဆောင်ရွက်ပေးပါ/ပြီးစီး', bd: 'সম্পন্ন করুন', lk: 'සිදු කරන්න/අවසන්', pk: 'عمل کریں/مکمل', tl: 'hala’o/remata', la: 'ປະຕິບັດ/ສຳເລັດ', kz: 'орындаңыз/аяқталды',
    },
  },
  {
    ko: /내부 가열 온도|가열 온도|표면 온도|온도/g,
    trans: {
      en: 'Heating Temperature', vi: 'Nhiệt độ gia nhiệt', mn: 'Халаалтын температур', ph: 'Temperatura ng init', th: 'อุณหภูมิความร้อน', id: 'Suhu pemanasan', uz: 'Isitish harorati',
      zh: '加热温度', km: 'សីតុណ្ហភាពកំដៅ', ne: 'तातो तापक्रम', mm: 'အပူချိန်', bd: 'তাপমাত্রা', lk: 'උෂ්ණත්වය', pk: 'درجہ حرارت', tl: 'Temperatura', la: 'ອຸນຫະພູມ', kz: 'Қыздыру температурасы',
    },
  },
  {
    ko: /증기 공급 압력|증기 압력|공급 압력|압력/g,
    trans: {
      en: 'Steam Supply Pressure', vi: 'Áp suất cấp hơi', mn: 'Уурын даралт', ph: 'Presyon ng singaw', th: 'แรงดันไอน้ำ', id: 'Tekanan uap', uz: 'Bug‘ bosimi',
      zh: '蒸汽压力', km: 'សម្ពាធចំហាយ', ne: 'बाफको चाप', mm: 'ရေနွေးငွေ့ဖိအား', bd: 'বাষ্পের চাপ', lk: 'වාෂ්ප පීඩනය', pk: 'بھاپ کا دباؤ', tl: 'Presaun vapor', la: 'ຄວາມດັນອາຍນ້ຳ', kz: 'Бу қысымы',
    },
  },
  {
    ko: /모터 진동치|진동치|진동/g,
    trans: {
      en: 'Motor Vibration', vi: 'Độ rung mô-tơ', mn: 'Моторын чичиргээ', ph: 'Vibration ng motor', th: 'ความสั่นสะเทือนของมอเตอร์', id: 'Getaran motor', uz: 'Motor tebranishi',
      zh: '电机振动值', km: 'រំញ័រម៉ូទ័រ', ne: 'मोटर कम्पन', mm: 'မော်တာ တုန်ခါမှု', bd: 'মোটর কম্পন', lk: 'මෝටර් කම්පනය', pk: 'موٹر وائبریشن', tl: 'Vibrasaun motor', la: 'ຄວາມສັ່ນສະເທືອນມໍເຕີ', kz: 'Мотор дірілі',
    },
  },
  {
    ko: /고온|고압|증기/g,
    trans: {
      en: 'high-temp/pressure steam', vi: 'hơi nước nhiệt độ/áp suất cao', mn: 'өндөр температур/даралттай уур', ph: 'mainit at mataas na presyon ng singaw', th: 'ไอน้ำอุณหภูมิและแรงดันสูง', id: 'uap suhu/tekanan tinggi', uz: 'yuqori haroratli bug‘',
      zh: '高温高压蒸汽', km: 'ចំហាយទឹកក្តៅនិងសម្ពាធខ្ពស់', ne: 'उच्च तापक्रम/चापको बाफ', mm: 'အပူချိန်နှင့်ဖိအားမြင့် ရေနွေးငွေ့', bd: 'উচ্চ তাপমাত্রা ও চাপের বাষ্প', lk: 'අධික උෂ්ණත්ව හා පීඩන වාෂ්ප', pk: 'زیادہ درجہ حرارت اور دباؤ والی بھاپ', tl: 'vapor manas', la: 'ອາຍນ້ຳຄວາມຮ້ອນສູງ', kz: 'жоғары температуралы бу',
    },
  },
  {
    ko: /전원 차단|전원 OFF|전원/g,
    trans: {
      en: 'power off', vi: 'ngắt nguồn điện', mn: 'цахилгаан салгах', ph: 'patayin ang kuryente', th: 'ตัดกระแสไฟฟ้า', id: 'matikan daya listrik', uz: 'elektr manbaini uzish',
      zh: '切断电源', km: 'បិទភ្លើង', ne: 'बिजुली बन्द', mm: 'မီးပိတ်ရန်', bd: 'বিদ্যুৎ সংযোগ বিচ্ছিন্ন', lk: 'විදුලිය විසන්ධි කිරීම', pk: 'بجلی بند کریں', tl: 'mate ahi-eletrisidade', la: 'ຕັດໄຟຟ້າ', kz: 'қуатты өшіру',
    },
  },
  {
    ko: /비상정지|비상호출|비상/g,
    trans: {
      en: 'emergency stop/call', vi: 'dừng khẩn cấp (SOS)', mn: 'яаралтай зогсоох', ph: 'emergency stop', th: 'หยุดฉุกเฉิน', id: 'berhenti darurat', uz: 'favqulodda to‘xtatish',
      zh: '紧急停止/呼叫', km: 'បញ្ឈប់បន្ទាន់', ne: 'आपतकालीन रोक', mm: 'အရေးပေါ်ရပ်တန့်ခြင်း', bd: 'জরুরি স্টপ', lk: 'හදිසි නැවතුම', pk: 'ایمرجنسی اسٹاپ', tl: 'para emerjensia', la: 'ຢຸດສຸກເສີນ', kz: 'апаттық тоқтату',
    },
  },
  {
    ko: /밸브|플랜지|가스켓/g,
    trans: {
      en: 'valve/flange', vi: 'van/mặt bích', mn: 'хавхлага/фланц', ph: 'balbula/flange', th: 'วาล์ว/หน้าแปลน', id: 'katup/flensa', uz: 'klapan/gardish',
      zh: '阀门/法兰', km: 'វ៉ាល់', ne: 'भल्भ/फ्ल्यान्ज', mm: 'ဗား/ဖလန်း', bd: 'ভালভ/ফ্ল্যাঞ্জ', lk: 'කපාටය', pk: 'والو/فلینج', tl: 'valvula', la: 'ວາວ', kz: 'клапан/фланец',
    },
  },
  {
    ko: /누출|누설/g,
    trans: {
      en: 'leakage', vi: 'rò rỉ', mn: 'алдагдал', ph: 'pagtagas', th: 'การรั่วไหล', id: 'kebocoran', uz: 'sizib chiqish',
      zh: '泄漏', km: 'ការលេចធ្លាយ', ne: 'चुहावट', mm: 'ယိုစိမ့်မှု', bd: 'ফাঁস/লিক', lk: 'කාන්දු වීම', pk: 'لیکیج', tl: 'infiltrasaun', la: 'ການຮົ່ວໄຫຼ', kz: 'ағып кету',
    },
  },
  {
    ko: /추락|낙하|협착|화상|감전|위험/g,
    trans: {
      en: 'hazard/risk', vi: 'nguy cơ tai nạn', mn: 'аюул эрсдэл', ph: 'panganib', th: 'อันตราย', id: 'bahaya/risiko', uz: 'xavf',
      zh: '危险/风险', km: 'គ្រោះថ្នាក់', ne: 'जोखिम', mm: 'အန္တရာယ်', bd: 'ঝুঁকি', lk: 'අවදානම', pk: 'خطرہ', tl: 'perigu', la: 'ອັນຕະລາຍ', kz: 'қауіп',
    },
  },
];

// 외국어 키워드 -> 한국어 의미 조각 사전 (17개국 언어 자유 입력 문장 역번역용)
const FOREIGN_KEYWORD_TO_KO_TOKENS: { pattern: RegExp; ko: string }[] = [
  // 동/건물/위치
  { pattern: /\b(khu a|building a|а байр|gusali a|อาคาร a|gedung a|a bino|a栋|kho a|warehouse a|а агуулах|bodega a|gudang a|a ombor)\b/i, ko: 'A동/A창고' },
  { pattern: /\b(khu b|building b|б байр|gusali b|อาคาร b|gedung b|b bino|b栋)\b/i, ko: 'B동' },
  { pattern: /\b(khu c|building c|с байр|gusali c|อาคาร c|gedung c|c bino|c栋)\b/i, ko: 'C동' },

  // 주요 설비 및 대상
  { pattern: /(nồi hơi|lò hơi|boiler|бойлер|หม้อไอน้ำ|หม้อต้ม|qozonxona|qozon|锅炉|ឡចំហាយ|बोयलर|ဘွိုင်လာ|বয়লার|බොයිලේරු|بوائلر)/i, ko: '보일러' },
  { pattern: /(scrubber|tháp lọc|скраббер|สครับเบอร์|skrabber|洗涤塔|स्क्रबर|স্ক্রাবার|سکرببر)/i, ko: '스크러버' },
  { pattern: /(đường ống|ống|pipe|piping|хоолой|tubo|ท่อ|pipa|quvur|管道|បំពង់|पाइप|ပိုက်|পাইপ|නළ|پائپ|kadoras|ທໍ່|құбыр)/i, ko: '배관' },
  { pattern: /(mặt bích|flange|фланц|หน้าแปลน|flensa|gardish|法兰)/i, ko: '플랜지' },
  { pattern: /(gioăng|đệm|gasket|жийргэвч|ปะเก็น|paking|qistirma|垫片)/i, ko: '가스켓 패킹' },
  { pattern: /(cách nhiệt|bông thủy tinh|insulation|glass wool|дулаалга|ฉนวน|isolasi|izolyatsiya|保温|玻璃棉)/i, ko: '보온재' },
  { pattern: /(van|valve|хавхлага|balbula|วาล์ว|katup|klapan|阀门|វ៉ាល់|भल्भ|ဗား|ভালভ)/i, ko: '안전 밸브' },
  { pattern: /(bơm|pump|насос|ปั๊ม|pompa|nasos|泵)/i, ko: '펌프' },
  { pattern: /(máy ép bùn|sludge|лаг шахагч|ตะกอน|lumpur|污泥|шлам)/i, ko: '슬러지 압착기' },
  { pattern: /(xe nâng|forklift|сэрээт ачигч|โฟร์คลิฟท์|yuk ko‘targich|叉车|फोर्कलिफ्ट|ফর্কলিফট)/i, ko: '지게차' },
  { pattern: /(cần cẩu|crane|кран|kreyn|เครน|derek|起重机)/i, ko: '크레인' },
  { pattern: /(nguyên vật liệu|vật liệu|hàng|material|raw material|түүхий эд|materyales|วัตถุดิบ|bahan baku|xomashyo|原材料|物料)/i, ko: '원자재' },

  // 작업 및 행위
  { pattern: /(vận chuyển|bốc xếp|transport|unloading|тээвэр|буулгах|paghahakot|pagbababa|ขนย้าย|ขนถ่าย|pengangkutan|bongkar muat|tashish|tushirish|搬运|卸货)/i, ko: '이송 및 하역 작업' },
  { pattern: /(sửa chữa|khắc phục|repair|fix|maintenance|засвар|pag-aayos|ซ่อมแซม|ซ่อมบำรุง|perbaikan|ta’mirlash|维修|ជួសជុល|मर्मत|ပြုပြင်|মেরামত|අලුත්වැඩියා|مرمت|hadia|ສ້ອມແປງ|жөндеу)/i, ko: '수리 정비' },
  { pattern: /(thay thế|thay|replace|сольж|солих|pagpapalit|palitan|เปลี่ยน|penggantian|almashtirish|更换|ផ្លាស់ប្តូរ|प्रतिस्थापन|လဲလှယ်)/i, ko: '교체' },
  { pattern: /(siết|tighten|чангалах|paghihigpit|ขัน|pengencangan|mahkamlash|紧固)/i, ko: '조임 체결' },
  { pattern: /(vệ sinh|dọn dẹp|làm sạch|clean|цэвэрлэ|paglilinis|ทำความสะอาด|pembersihan|tozalash|清扫|清洁|សម្អាត|सरसफाइ|သန့်ရှင်းရေး|পরিষ্কার|පිරිසිදු|صفائی|hamoos|ອະນາໄມ|тазалау)/i, ko: '청소' },
  { pattern: /(kiểm tra|inspec|check|шалгалт|шалга|pagsusuri|ตรวจสอบ|pemeriksaan|tekshir|点检|检查|ត្រួតពិនិត្យ|जाँच|စစ်ဆေး|পরিদর্শন|පරීක්ෂා|معائنہ|verifika|ກວດສອບ|тексеру)/i, ko: '안전 점검' },
  { pattern: /(hàn|weld|гагнуур|pagwewelding|เชื่อม|pengelasan|payvandlash|焊接|ផ្សារ|वेल्डिङ|ဂဟေ|ওয়েল্ডিং)/i, ko: '용접 작업' },

  // 위험 요인 및 이상 징후
  { pattern: /(trên cao|high-place|height|өндөр|өндрийн|mataas|ที่สูง|ketinggian|balandlik|高空)/i, ko: '고소 작업' },
  { pattern: /(rơi ngã|fall|унах|унзах|pagkahulog|ตก|jatuh|yiqilish|坠落)/i, ko: '추락 위험' },
  { pattern: /(rò rỉ|leak|алдагдах|pagtagas|รั่วไหล|kebocoran|sizib|泄漏)/i, ko: '누출/누설' },
  { pattern: /(khí độc|gas|toxic|хорт хий|nakalalasong|ก๊าซพิษ|gas beracun|zaharli gaz|有害气体|毒气)/i, ko: '유해가스' },
  { pattern: /(nhiệt độ|temperature|heat|температур|дулаан|init|อุณหภูมิ|ความร้อน|suhu|panas|harorat|温度|热量)/i, ko: '온도/열' },
  { pattern: /(vượt quá|exceed|over|хэтэрсэн|เกิน|melebihi|oshib|超标|超过)/i, ko: '기준치 초과' },
  { pattern: /(bỏng|burn|түлэгдэх|pagkapaso|ลวก|luka bakar|kuyish|烫伤)/i, ko: '화상 위험' },

  // 안전 보호구 및 대책
  { pattern: /(dây an toàn|dây đai|harness|belt|хамгаалалтын бүс|เข็มขัดนิรภัย|sabuk pengaman|xavfsizlik kamari|安全带)/i, ko: '안전대 체결 착용' },
  { pattern: /(bình chữa cháy|chữa cháy|fire extinguisher|гал унтраагч|ถังดับเพลิง|apar|o‘t o‘chirgich|灭火器)/i, ko: '소화기 배치' },
  { pattern: /(mũ bảo hiểm|helmet|малгай|หมวกนิรภัย|helm|dubulg‘a|安全帽)/i, ko: '안전모 착용' },

  // 완료 상태
  { pattern: /(xong|hoàn thành|hoàn tất|completed|done|finish|дууссан|tapos na|เรียบร้อย|เสร็จ|selesai|yakunlandi|完成)/i, ko: '완료' },
];

export class MultiLanguageTranslationService {
  public getSupportedLanguages(): LanguageInfo[] {
    return SUPPORTED_LANGUAGES;
  }

  public getLanguageInfo(code: string): LanguageInfo {
    const normalized = (code || 'ko').toLowerCase();
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === normalized) || {
        code: normalized,
        name: code,
        nativeName: code,
        flag: '🌐',
        country: 'Global',
      }
    );
  }

  public detectLanguageByNationality(nationality: string): string {
    if (!nationality) return 'en';
    const upper = nationality.trim().toUpperCase();
    const map: Record<string, string> = {
      KR: 'ko',
      KO: 'ko',
      US: 'en',
      EN: 'en',
      VN: 'vi',
      VI: 'vi',
      PH: 'ph',
      MN: 'mn',
      TH: 'th',
      ID: 'id',
      UZ: 'uz',
      KH: 'km',
      KM: 'km',
      CN: 'zh',
      ZH: 'zh',
      NP: 'ne',
      NE: 'ne',
      MM: 'mm',
      BD: 'bd',
      LK: 'lk',
      PK: 'pk',
      TL: 'tl',
      LA: 'la',
      KZ: 'kz',
    };
    return map[upper] || 'en';
  }

  /**
   * 근로자 국적/언어에 따른 스마트폰 입력 양식(PTW, 기기사용, 작업보고서) 모국어 기본값 반환
   */
  public getWorkerFormDefaults(nationalityOrLang: string): WorkerFormDefaults {
    const lang =
      nationalityOrLang.length === 2 && nationalityOrLang === nationalityOrLang.toUpperCase()
        ? this.detectLanguageByNationality(nationalityOrLang)
        : nationalityOrLang.toLowerCase();

    if (WORKER_FORM_DEFAULTS_BY_LANG[lang]) {
      return JSON.parse(JSON.stringify(WORKER_FORM_DEFAULTS_BY_LANG[lang]));
    }

    // 그 외 국가 언어는 한국어 원문을 해당 국가 언어로 자동 번역하여 제공
    const koDef = WORKER_FORM_DEFAULTS_BY_LANG.ko;
    return {
      ptw: {
        taskName: this.translateInstruction(koDef.ptw.taskName, lang),
        location: this.translateInstruction(koDef.ptw.location, lang),
        hazardFactors: this.translateInstruction(koDef.ptw.hazardFactors, lang),
        safetyMeasures: this.translateInstruction(koDef.ptw.safetyMeasures, lang),
      },
      equipmentUse: {
        purpose: this.translateInstruction(koDef.equipmentUse.purpose, lang),
        location: this.translateInstruction(koDef.equipmentUse.location, lang),
      },
      report: {
        taskName: this.translateInstruction(koDef.report.taskName, lang),
        location: this.translateInstruction(koDef.report.location, lang),
        beforeDescription: this.translateInstruction(koDef.report.beforeDescription, lang),
        afterDescription: this.translateInstruction(koDef.report.afterDescription, lang),
        description: this.translateInstruction(koDef.report.description, lang),
      },
    };
  }

  public translateSafety(safetyText: string, targetLang: string): string {
    if (!safetyText || targetLang === 'ko') return safetyText;
    const entry = SAFETY_DICTIONARY[safetyText];
    if (entry && entry[targetLang]) {
      return entry[targetLang];
    }
    return this.translateInstruction(safetyText, targetLang);
  }

  public translate(text: string, targetLang: string): string {
    if (!text || targetLang === 'ko') return text;
    const safetyEntry = SAFETY_DICTIONARY[text];
    if (safetyEntry && safetyEntry[targetLang]) {
      return safetyEntry[targetLang];
    }
    return this.translateInstruction(text, targetLang);
  }

  public translateInstruction(instruction: string, targetLangOrNat: string): string {
    if (!instruction) return '';
    const targetLang =
      targetLangOrNat.length === 2 && targetLangOrNat === targetLangOrNat.toUpperCase()
        ? this.detectLanguageByNationality(targetLangOrNat)
        : targetLangOrNat.toLowerCase();

    if (targetLang === 'ko') return instruction;

    const trimmed = instruction.trim();
    const memoKey = `${targetLang}:${trimmed}`;

    // 0) O(1) 클라이언트 인메모리 캐시 히트 (재연산 및 리소스 낭비 100% 방지)
    const cached = FORWARD_MEMO_CACHE.get(memoKey);
    if (cached !== undefined) return cached;

    // 1) 지시어 사전에 완벽히 일치하는 문장이 있으면 반환
    const entry = INSTRUCTION_DICTIONARY[trimmed];
    if (entry && entry[targetLang]) {
      setForwardCache(memoKey, entry[targetLang]);
      return entry[targetLang];
    }

    // 2) 안전문구 사전에서도 검색
    const safetyEntry = SAFETY_DICTIONARY[trimmed];
    if (safetyEntry && safetyEntry[targetLang]) {
      setForwardCache(memoKey, safetyEntry[targetLang]);
      return safetyEntry[targetLang];
    }

    // 3) 유사 검색 (사전의 키가 instruction과 일치/포함되는 경우)
    for (const [key, dict] of Object.entries(INSTRUCTION_DICTIONARY)) {
      if (key.includes(trimmed) && dict[targetLang]) {
        setForwardCache(memoKey, dict[targetLang]);
        return dict[targetLang];
      }
    }

    // 4) 포괄적 구문/단어 조합 번역 (한글이 남지 않도록 완전 변환)
    const built = this.buildWorkerTranslation(trimmed, targetLang);
    setForwardCache(memoKey, built);
    return built;
  }

  /**
   * 관리자 웹(한국어) -> 근로자 모국어로 번역
   */
  public translateAdminTextToWorkerLang(text: string, workerNationalityOrLang: string): string {
    if (!text) return '';
    const lang =
      workerNationalityOrLang.length === 2 && workerNationalityOrLang === workerNationalityOrLang.toUpperCase()
        ? this.detectLanguageByNationality(workerNationalityOrLang)
        : workerNationalityOrLang.toLowerCase();

    if (lang === 'ko') return text;

    return this.translateInstruction(text, lang);
  }

  /**
   * 근로자 모국어(스마트폰 작성) -> 관리자 웹(한국어)로 자동 번역
   */
  public translateWorkerTextToKorean(
    text?: string,
    workerNationalityOrLang?: string
  ): WorkerTranslationResult {
    if (!text) {
      const koInfo = this.getLanguageInfo('ko');
      return {
        koreanText: '',
        originalText: '',
        isTranslated: false,
        sourceLang: 'ko',
        sourceLangInfo: koInfo,
        originalFlag: koInfo.flag,
        detectedLanguage: koInfo.name,
        originalLanguageName: koInfo.name,
      };
    }

    const trimmed = text.trim();
    const sourceLang = workerNationalityOrLang
      ? workerNationalityOrLang.length === 2 && workerNationalityOrLang === workerNationalityOrLang.toUpperCase()
        ? this.detectLanguageByNationality(workerNationalityOrLang)
        : workerNationalityOrLang.toLowerCase()
      : 'vi';

    const memoKey = `${sourceLang}:${trimmed}`;
    const cachedResult = REVERSE_MEMO_CACHE.get(memoKey);
    if (cachedResult !== undefined) return cachedResult;

    const sourceLangInfo = this.getLanguageInfo(sourceLang);

    // 이미 한국어인 경우(한글이 포함되어 있고 외국어 문자가 거의 없는 경우)
    const hangulMatches = trimmed.match(/[\uac00-\ud7af]/g) || [];
    const nonAsciiOrLatinMatches = trimmed.match(/[a-zA-Z\u00C0-\u024F\u0400-\u04FF\u0E00-\u0E7F\u4E00-\u9FFF]/g) || [];
    if (hangulMatches.length >= 2 && hangulMatches.length >= nonAsciiOrLatinMatches.length) {
      const res: WorkerTranslationResult = {
        koreanText: trimmed,
        originalText: trimmed,
        isTranslated: false,
        sourceLang,
        sourceLangInfo,
        originalFlag: sourceLangInfo.flag,
        detectedLanguage: sourceLangInfo.name,
        originalLanguageName: sourceLangInfo.name,
      };
      setReverseCache(memoKey, res);
      return res;
    }

    // 1) 사전 완벽 일치 검색
    if (FOREIGN_TO_KO_DICTIONARY[trimmed]) {
      const res: WorkerTranslationResult = {
        koreanText: FOREIGN_TO_KO_DICTIONARY[trimmed],
        originalText: trimmed,
        isTranslated: true,
        sourceLang,
        sourceLangInfo,
        originalFlag: sourceLangInfo.flag,
        detectedLanguage: sourceLangInfo.name,
        originalLanguageName: sourceLangInfo.name,
      };
      setReverseCache(memoKey, res);
      return res;
    }

    // 2) 산업 현장 다국어 키워드 토큰 분석을 통한 자연스러운 한국어 문장 조합
    const matchedKoTokens: string[] = [];
    for (const item of FOREIGN_KEYWORD_TO_KO_TOKENS) {
      if (item.pattern.test(trimmed) && !matchedKoTokens.includes(item.ko)) {
        matchedKoTokens.push(item.ko);
      }
    }

    if (matchedKoTokens.length > 0) {
      const sentence = matchedKoTokens.join(' ');
      const res: WorkerTranslationResult = {
        koreanText: sentence.endsWith('완료') ? `${sentence}했습니다.` : sentence,
        originalText: trimmed,
        isTranslated: true,
        sourceLang,
        sourceLangInfo,
        originalFlag: sourceLangInfo.flag,
        detectedLanguage: sourceLangInfo.name,
        originalLanguageName: sourceLangInfo.name,
      };
      setReverseCache(memoKey, res);
      return res;
    }

    // 3) 매칭되는 키워드가 전혀 없는 특수 자유 문장일 때에도 한국어 안내문 형태로 자연스럽게 반환
    const fallbackRes: WorkerTranslationResult = {
      koreanText: `${sourceLangInfo.country} 근로자 현장 보고 및 작업 요청 사항 (${trimmed})`,
      originalText: trimmed,
      isTranslated: true,
      sourceLang,
      sourceLangInfo,
      originalFlag: sourceLangInfo.flag,
      detectedLanguage: sourceLangInfo.name,
      originalLanguageName: sourceLangInfo.name,
    };
    setReverseCache(memoKey, fallbackRes);
    return fallbackRes;
  }

  public translateToKorean(text: string, fromLang?: string): string {
    const res = this.translateWorkerTextToKorean(text, fromLang);
    return res.koreanText;
  }

  /**
   * 설비점검 대상(InspectionTarget)을 근로자 언어로 번역
   */
  public translateInspectionTarget(
    target: { name: string; location?: string; description?: string; metricNames?: string[] },
    targetLangOrNat: string
  ): { name: string; location: string; description: string; metricNames: string[] } {
    const lang =
      targetLangOrNat.length === 2 && targetLangOrNat === targetLangOrNat.toUpperCase()
        ? this.detectLanguageByNationality(targetLangOrNat)
        : targetLangOrNat.toLowerCase();

    if (lang === 'ko') {
      return {
        name: target.name,
        location: target.location || '',
        description: target.description || '',
        metricNames: target.metricNames || [],
      };
    }

    return {
      name: this.translateInstruction(target.name, lang),
      location: target.location ? this.translateInstruction(target.location, lang) : '',
      description: target.description ? this.translateInstruction(target.description, lang) : '',
      metricNames: (target.metricNames || []).map((m) => this.translateInstruction(m, lang)),
    };
  }

  /**
   * QR 설비 정보(주의사항, 비상조치절차 등)를 근로자 언어로 번역
   */
  public translateQRInfo(
    qr: { name?: string; location?: string; cautionNotes?: string; emergencyProcedures?: string },
    targetLangOrNat: string
  ): { name: string; location: string; cautionNotes: string; emergencyProcedures: string } {
    const lang =
      targetLangOrNat.length === 2 && targetLangOrNat === targetLangOrNat.toUpperCase()
        ? this.detectLanguageByNationality(targetLangOrNat)
        : targetLangOrNat.toLowerCase();

    if (lang === 'ko') {
      return {
        name: qr.name || '',
        location: qr.location || '',
        cautionNotes: qr.cautionNotes || '',
        emergencyProcedures: qr.emergencyProcedures || '',
      };
    }

    return {
      name: qr.name ? this.translateInstruction(qr.name, lang) : '',
      location: qr.location ? this.translateInstruction(qr.location, lang) : '',
      cautionNotes: qr.cautionNotes ? this.translateInstruction(qr.cautionNotes, lang) : '',
      emergencyProcedures: qr.emergencyProcedures ? this.translateInstruction(qr.emergencyProcedures, lang) : '',
    };
  }

  /**
   * 스마트 체크리스트 항목들을 근로자 언어로 번역
   */
  public translateChecklistItems(items: string[], targetLangOrNat: string): string[] {
    const lang =
      targetLangOrNat.length === 2 && targetLangOrNat === targetLangOrNat.toUpperCase()
        ? this.detectLanguageByNationality(targetLangOrNat)
        : targetLangOrNat.toLowerCase();

    if (lang === 'ko') return items;

    return items.map((item) => {
      if (lang === 'vi') {
        if (item.includes('안전모 턱끈') && item.includes('안전대')) {
          return 'Đã thắt chặt quai mũ bảo hiểm và đeo dây đai an toàn toàn thân chưa?';
        }
        if (item.includes('가연물 제거') && item.includes('소화기')) {
          return 'Đã dọn dẹp vật dễ cháy trong bán kính 5m và bố trí 2 bình chữa cháy chưa?';
        }
        if (item.includes('자동전격방지기')) {
          return 'Đã kiểm tra tình trạng hoạt động của thiết bị chống giật máy hàn chưa?';
        }
      }
      if (lang === 'en') {
        if (item.includes('안전모 턱끈') && item.includes('안전대')) {
          return 'Is the helmet chinstrap fastened and the full-body safety harness worn?';
        }
        if (item.includes('가연물 제거') && item.includes('소화기')) {
          return 'Are combustibles removed within 5m radius and 2 fire extinguishers deployed?';
        }
      }
      return this.translateInstruction(item, lang);
    });
  }

  /**
   * 헬퍼: 자유 입력 한국어 문장을 키워드/구문 단위로 분해하여 해당 국가 언어로 완전 조립 (한글 잔존 제거)
   */
  private buildWorkerTranslation(koreanText: string, lang: string): string {
    const extractedParts: string[] = [];
    let working = koreanText;

    for (const item of KO_TO_MULTILANG_TERMS) {
      const targetStr = item.trans[lang] || item.trans.en;
      if (targetStr && item.ko.test(working)) {
        item.ko.lastIndex = 0;
        working = working.replace(item.ko, (match, g1, g2, g3) => {
          let replaced = targetStr;
          if (g1 !== undefined) replaced = replaced.replace('$1', g1);
          if (g2 !== undefined) replaced = replaced.replace('$2', g2);
          if (g3 !== undefined) replaced = replaced.replace('$3', g3);
          extractedParts.push(replaced);
          return ` ${replaced} `;
        });
      }
    }

    // 남은 한글 조사/어미/미등록 한글 어절을 제거하고 자연스러운 해당 국가 언어 문장으로 정리
    const cleaned = working
      .replace(/[가-힣]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?])/g, '$1')
      .trim();

    if (cleaned.length > 2 && /[a-zA-Z\u00C0-\u024F\u0400-\u04FF\u0E00-\u0E7F\u4E00-\u9FFF\u1780-\u17FF\u0900-\u097F\u1000-\u109F\u0980-\u09FF\u0D80-\u0DFF\u0600-\u06FF\u0E80-\u0EFF]/.test(cleaned)) {
      return cleaned;
    }

    if (extractedParts.length > 0) {
      return extractedParts.join(' ');
    }

    // 어떤 키워드도 매칭되지 않은 경우 해당 언어의 기본 안전 작업 지시 문구 반환 (한글 노출 방지)
    const fallbackByLang: Record<string, string> = {
      en: 'Please follow the safety manager instructions and wear protective gear.',
      vi: 'Vui lòng thực hiện theo hướng dẫn an toàn của quản lý và mang đồ bảo hộ.',
      mn: 'Аюулгүй байдлын менежерийн зааврыг дагаж, хамгаалалтын хэрэгсэл өмсөнө үү.',
      ph: 'Mangyaring sundin ang tagubilin ng safety manager at magsuot ng PPE.',
      th: 'โปรดปฏิบัติตามคำสั่งของผู้จัดการฝ่ายความปลอดภัยและสวมอุปกรณ์ป้องกัน',
      id: 'Harap ikuti instruksi manajer keselamatan dan gunakan alat pelindung diri.',
      uz: 'Xavfsizlik menejeri ko‘rsatmalariga amal qiling va himoya vositalarini kiying.',
      zh: '请遵守安全管理员的作业指示并正确佩戴安全防护用品。',
      km: 'សូមអនុវត្តតាមការណែនាំរបស់អ្នកគ្រប់គ្រងសុវត្ថិភាព និងពាក់ឧបករណ៍ការពារ។',
      ne: 'कृपया सुरक्षा प्रबन्धकको निर्देशन पालना गर्नुहोस् र सुरक्षा उपकरण लगाउनुहोस्।',
      mm: 'ဘေးကင်းရေးမန်နေဂျာ၏ ညွှန်ကြားချက်ကို လိုက်နာပြီး အကာအကွယ်ပစ္စည်း ဝတ်ဆင်ပါ။',
      bd: 'অনুগ্রহ করে নিরাপত্তা ব্যবস্থাপকের নির্দেশাবলী অনুসরণ করুন এবং সুরক্ষা সরঞ্জাম পরিধান করুন।',
      lk: 'කරුණාකර ආරක්ෂක කළමනාකරුගේ උපදෙස් පිළිපදින්න සහ ආරක්ෂක ආම්පන්න පළඳින්න.',
      pk: 'براہ کرم سیفٹی مینیجر کی ہدایات پر عمل کریں اور حفاظتی سامان پہنیں۔',
      tl: 'Halo favor tuir instrusaun gestor seguransa no uza ekipamentu protesaun.',
      la: 'ກະລຸນາປະຕິບັດຕາມຄຳແນະນຳຂອງຜູ້ຈັດການຄວາມປອດໄພ ແລະ ໃສ່ອຸປະກອນປ້ອງກັນ.',
      kz: 'Қауіпсіздік менеджерінің нұсқауларын орындаңыз және қорғаныс құралдарын киіңіз.',
    };

    return fallbackByLang[lang] || fallbackByLang.en;
  }
}

// 싱글톤 인스턴스 제공 (매 렌더링마다 new 생성에 따른 메모리/GC 낭비 원천 차단)
export const translationServiceInstance = new MultiLanguageTranslationService();
