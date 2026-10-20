export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  country: string;
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
    ne: 'सुरक्षा उपकरण (हेルメट, सुरक्षा जुत्ता, चश्मा) अनिवार्य लगाउनुहोस्',
    mm: 'အကာအကွယ်ပစ္စည်း (ဦးထုပ်၊ လုံခြုံရေးဖိနပ်၊ မျက်မှန်) မဖြစ်မနေ ဝတ်ဆင်ပါ',
    bd: 'সুরক্ষা সরঞ্জাম (হেলমেট, সুরক্ষা জুতা, চশমা) পরা বাধ্যতামূলক',
    lk: 'ආරක්ෂක ආම්පන්න (තොප්පිය, පාවහන්, ඇස් කණ්ණාඩි) පැළඳීම අනිවාර්ය වේ',
    pk: 'حفاظتی سامان (ہیلمٹ، حفاظتی جوتے، چشمہ) پہننا لازمی ہے',
    tl: 'Uza ekipamentu protesaun (xapeu, sapatu seguransa, okulus)',
    la: 'ຕ້ອງໃສ່ອຸປະກອນປ້ອງກັນ (ໝວກນິລະໄພ ເກີບນິລະໄພ ແວ່ນຕານິລະໄພ)',
    kz: 'Жеке қорғаныс құралдарын (каска, арнайы аяқ киім, көзілдірік) кию міндетті',
  },
};

export class MultiLanguageTranslationService {
  public getSupportedLanguages(): LanguageInfo[] {
    return SUPPORTED_LANGUAGES;
  }

  public getLanguageInfo(code: string): LanguageInfo {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === code) || {
        code,
        name: code,
        nativeName: code,
        flag: '🌐',
        country: 'Global',
      }
    );
  }

  public translate(phrase: string, targetLang: string): string {
    if (targetLang === 'ko') return phrase;

    const matched = SAFETY_DICTIONARY[phrase];
    if (matched && matched[targetLang]) {
      return matched[targetLang];
    }

    // Default to dynamic translation
    return this.translateInstruction(phrase, targetLang);
  }

  public translateInstruction(instruction: string, targetLang: string): string {
    if (targetLang === 'ko') return instruction;

    // Smart heuristic keyword translation simulation for standard factory safety instructions
    const sampleTranslations: Record<string, Record<string, string>> = {
      '오늘 스크러버 배관 용접 작업 주의': {
        en: 'Caution: Scrubber pipe welding work today',
        vi: 'Hôm nay chú ý công việc hàn đường ống tháp lọc (scrubber)',
        ph: 'Mag-ingat sa gawaing pagwewelding ng tubo ng scrubber ngayon',
        mn: 'Өнөөдөр скраббер хоолойн гагнуурын ажилд анхаарал хандуулна уу',
        th: 'ระวังงานเชื่อมท่อสครับเบอร์ในวันนี้',
        id: 'Perhatian untuk pekerjaan pengelasan pipa scrubber hari ini',
        uz: 'Bugun skrabber quvurini payvandlash ishlarida ehtiyot bo‘ling',
        km: 'ការប្រុងប្រយ័ត្នចំពោះការងារផ្សារបំពង់ scrubber ថ្ងៃនេះ',
        zh: '今日请注意洗涤塔管道焊接作业安全',
        ne: 'आज स्क्रबर पाइप वेल्डिङ कार्यमा ध्यान दिनुहोस्',
        mm: 'ယနေ့ scrubber ပိုက် ဂဟေဆော်ခြင်းလုပ်ငန်း သတိပြုပါ',
        bd: 'আজ স্ক্রাবার পাইপ ওয়েল্ডিং কাজের ক্ষেত্রে সতর্ক থাকুন',
        lk: 'අද scrubber බට වෑල්ඩින් කිරීමේ කාර්යය පිළිබඳව සැලකිලිමත් වන්න',
        pk: 'آج سکرببر پائپ ویلڈنگ کے کام میں احتیاط برتیں',
        tl: 'Atensaun ba servisu soldadura kadoras scrubber ohin',
        la: 'ມື້ນີ້ໃຫ້ລະວັງວຽກເຊື່ອມທໍ່ scrubber',
        kz: 'Бүгін скраббер құбырын дәнекерлеу жұмысында сақ болыңыз',
      },
    };

    if (sampleTranslations[instruction] && sampleTranslations[instruction][targetLang]) {
      return sampleTranslations[instruction][targetLang];
    }

    const lang = this.getLanguageInfo(targetLang);
    return `[${lang.flag} ${lang.nativeName}] ${instruction}`;
  }

  public detectLanguageByNationality(nationality: string): string {
    const nat = (nationality || '').toUpperCase().trim();
    const map: Record<string, string> = {
      VN: 'vi',
      MN: 'mn',
      PH: 'ph',
      TH: 'th',
      ID: 'id',
      UZ: 'uz',
      KM: 'km',
      KH: 'km',
      ZH: 'zh',
      CN: 'zh',
      NE: 'ne',
      NP: 'ne',
      MM: 'mm',
      MY: 'mm',
      BD: 'bd',
      LK: 'lk',
      PK: 'pk',
      TL: 'tl',
      LA: 'la',
      KZ: 'kz',
      KR: 'ko',
      US: 'en',
      EN: 'en',
    };
    return map[nat] || 'vi';
  }

  public translateToKorean(text: string, fromLang?: string): string {
    if (!text) return '';
    // If it's already mostly Korean, return as is
    if (/[\uac00-\ud7af]/.test(text)) {
      return text;
    }

    const reverseDictionary: Record<string, string> = {
      'Đã thay thế gioăng đệm và kiểm tra rò rỉ xong.': '가스켓 패킹 교체 및 누설 테스트 완료했습니다.',
      'Hoàn thành sửa chữa và kiểm tra an toàn.': '수리 완료 및 안전 점검 완료했습니다.',
      'Đã dọn dẹp khu vực làm việc và cất dụng cụ.': '작업 구역 청소 및 공구 정리 완료했습니다.',
      'Хоолойн жийргэвчийг сольж дууссан.': '배관 가스켓 교체 작업을 완료했습니다.',
      'Ажил дууссан, ямар нэгэн сааталгүй.': '작업 완료, 특이사항 없습니다.',
      'Tapos na ang pag-aayos at paglilinis ng boiler.': '보일러 수리 및 청소 작업을 완료했습니다.',
      'Kailangang palitan ang filter bukas.': '내일 필터 교체가 필요합니다.',
      'All maintenance work completed successfully.': '모든 유지보수 작업이 성공적으로 완료되었습니다.',
    };

    if (reverseDictionary[text]) {
      return reverseDictionary[text];
    }

    // Heuristic keyword match
    if (text.toLowerCase().includes('gioăng') || text.toLowerCase().includes('đệm')) {
      return `[🇰🇷 번역] 가스켓/패킹 부품 교체 및 작업 완료: "${text}"`;
    }
    if (text.toLowerCase().includes('nhiệt độ') || text.toLowerCase().includes('температур')) {
      return `[🇰🇷 번역] 설비 온도 상태 점검 보고: "${text}"`;
    }

    const langInfo = fromLang ? this.getLanguageInfo(fromLang) : null;
    const langFlag = langInfo ? langInfo.flag : '🌐';
    return `[🇰🇷 번역 (${langFlag})] ${text}`;
  }
}
