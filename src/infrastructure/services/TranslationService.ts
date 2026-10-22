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
    km: 'សូមប្រាកដថាបានធ្វើការត្រួតពិនិត្យសុវត្ថិភាពមុនពេលចាប់ផ្តើមการងារ។',
    zh: '作业前务必进行安全检查。',
    ne: 'काम सुरु गर्नु अघि सुरक्षा जाँच गर्न निश्चित गर्नुहोस्।',
    mm: 'အလုပ်မစတင်မီ ဘေးကင်းရေးစစ်ဆေးမှု သေချာပြုလုပ်ပါ။',
    bd: 'কাজ शुरू করার আগে অবশ্যই নিরাপত্তা পরীক্ষা করুন।',
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
    mn: 'Хамгаалалтын хэрэгсেল (малгай, гутал, шил) заавал өмсөх',
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
    mn: 'Мэргэжлийн үнэмлэхийн хуулбар ирүүлээгүй болон хамгаалалтын хэрэгсেল өмсөөгүй тул буцаав',
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
};

// 외국어 키워드 -> 한국어 번역 역방향 사전 (자주 쓰이는 현장 용어 매핑)
const FOREIGN_TO_KO_DICTIONARY: Record<string, string> = {
  'Đã thay thế gioăng đệm và kiểm tra rò rỉ xong.': '가스켓 패킹 교체 및 누설 테스트 완료했습니다.',
  'Hoàn thành sửa chữa và kiểm tra an toàn.': '수리 완료 및 안전 점검 완료했습니다.',
  'Đã dọn dẹp khu vực làm việc và cất dụng cụ.': '작업 구역 청소 및 공구 정리 완료했습니다.',
  'Хоолойн жийргэвчийг сольж дууссан.': '배관 가스켓 교체 작업을 완료했습니다.',
  'Ажил дууссан, ямар нэгэн сааталгүй.': '작업 완료, 특이사항 없습니다.',
  'Tapos na ang pag-aayos at paglilinis ng boiler.': '보일러 수리 및 청소 작업을 완료했습니다.',
  'Kailangang palitan ang filter bukas.': '내일 필터 교체가 필요합니다.',
  'All maintenance work completed successfully.': '모든 유지보수 작업이 성공적으로 완료되었습니다.',
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

  public detectLanguageByNationality(nationality: string): string {
    const map: Record<string, string> = {
      KR: 'ko',
      US: 'en',
      VN: 'vi',
      PH: 'ph',
      MN: 'mn',
      TH: 'th',
      ID: 'id',
      UZ: 'uz',
      KH: 'km',
      CN: 'zh',
      NP: 'ne',
      MM: 'mm',
      BD: 'bd',
      LK: 'lk',
      PK: 'pk',
      TL: 'tl',
      LA: 'la',
      KZ: 'kz',
    };
    return map[nationality.toUpperCase()] || 'en';
  }

  public translateSafety(safetyText: string, targetLang: string): string {
    if (targetLang === 'ko') return safetyText;
    const entry = SAFETY_DICTIONARY[safetyText];
    if (entry && entry[targetLang]) {
      return entry[targetLang];
    }
    return safetyText;
  }

  public translate(text: string, targetLang: string): string {
    const safetyRes = this.translateSafety(text, targetLang);
    if (safetyRes !== text) return safetyRes;
    return this.translateInstruction(text, targetLang);
  }

  public translateInstruction(instruction: string, targetLang: string): string {
    if (!instruction || targetLang === 'ko') return instruction;

    // 1) 지시어 사전에 완벽히 일치하는 문장이 있으면 반환
    const entry = INSTRUCTION_DICTIONARY[instruction];
    if (entry && entry[targetLang]) {
      return entry[targetLang];
    }

    // 2) 유사 검색 (사전의 키가 instruction에 포함되는 경우)
    for (const [key, dict] of Object.entries(INSTRUCTION_DICTIONARY)) {
      if (instruction.includes(key) && dict[targetLang]) {
        return dict[targetLang];
      }
      if (key.includes(instruction) && dict[targetLang]) {
        return dict[targetLang];
      }
    }

    // 3) 안전문구 사전에서도 검색
    const safetyEntry = SAFETY_DICTIONARY[instruction];
    if (safetyEntry && safetyEntry[targetLang]) {
      return safetyEntry[targetLang];
    }

    // 4) 규칙 기반 키워드 조립 번역
    return this.buildWorkerTranslation(instruction, targetLang);
  }

  /**
   * 관리자 웹(한국어) -> 근로자 모국어로 번역
   */
  public translateAdminTextToWorkerLang(text: string, workerNationalityOrLang: string): string {
    if (!text) return '';
    const lang =
      workerNationalityOrLang.length === 2 && workerNationalityOrLang === workerNationalityOrLang.toUpperCase()
        ? this.detectLanguageByNationality(workerNationalityOrLang)
        : workerNationalityOrLang;

    if (lang === 'ko') return text;

    return this.translateInstruction(text, lang);
  }

  /**
   * 근로자 모국어(스마트폰 작성) -> 관리자 웹(한국어)로 자동 번역
   */
  public translateWorkerTextToKorean(
    text: string,
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
      };
    }

    const sourceLang = workerNationalityOrLang
      ? workerNationalityOrLang.length === 2 && workerNationalityOrLang === workerNationalityOrLang.toUpperCase()
        ? this.detectLanguageByNationality(workerNationalityOrLang)
        : workerNationalityOrLang
      : 'vi';

    const sourceLangInfo = this.getLanguageInfo(sourceLang);

    // 이미 한국어인 경우(국적이 KR이거나, 한글이 충분히 포함되어 있고 영문보다 많은 경우)
    const hangulMatches = text.match(/[\uac00-\ud7af]/g) || [];
    if (sourceLang === 'ko' || hangulMatches.length >= 2) {
      // 순수 외국어가 주를 이루지 않는 한 한국어 원문 보존
      const latinMatches = text.match(/[a-zA-Z]/g) || [];
      if (hangulMatches.length >= latinMatches.length) {
        return {
          koreanText: text,
          originalText: text,
          isTranslated: false,
          sourceLang,
          sourceLangInfo,
          originalFlag: sourceLangInfo.flag,
        };
      }
    }

    // 1) 사전 완벽 일치 검색
    if (FOREIGN_TO_KO_DICTIONARY[text]) {
      return {
        koreanText: FOREIGN_TO_KO_DICTIONARY[text],
        originalText: text,
        isTranslated: true,
        sourceLang,
        sourceLangInfo,
        originalFlag: sourceLangInfo.flag,
      };
    }

    // 2) 산업 현장 문맥 키워드 기반 스마트 번역
    const lower = text.toLowerCase();
    const matches: string[] = [];

    // 가스켓 / 패킹 / 누설
    if (lower.includes('gioăng') || lower.includes('đệm') || lower.includes('gasket') || lower.includes('жийргэвч')) {
      matches.push('가스켓/패킹 부품 교체');
    }
    if (lower.includes('rò rỉ') || lower.includes('leak') || lower.includes('누설')) {
      matches.push('누설 점검 완료');
    }

    // 자재 운반 / 하역 / 지게차
    if (
      lower.includes('vận chuyển') ||
      lower.includes('nguyên vật liệu') ||
      lower.includes('kho') ||
      lower.includes('transport') ||
      lower.includes('material') ||
      lower.includes('bốc xếp') ||
      lower.includes('forklift') ||
      lower.includes('тээвэр')
    ) {
      if (lower.includes('kho a') || lower.includes('warehouse a')) {
        matches.push('A창고 원자재 이송 및 하역 작업');
      } else {
        matches.push('공장 원자재 운반 및 하역 작업');
      }
    }

    // 추락 / 낙하 / 고소 작업
    if (lower.includes('rơi ngã') || lower.includes('trên cao') || lower.includes('fall') || lower.includes('унзах') || lower.includes('높이')) {
      matches.push('고소 추락 위험');
    }

    // 유해가스 / 화학물질
    if (lower.includes('khí độc') || lower.includes('gas') || lower.includes('toxic') || lower.includes('хорт хий') || lower.includes('hóa chất') || lower.includes('chemical')) {
      matches.push('유해가스 노출 및 누출 위험');
    }

    // 화재 / 스파크 / 소화기
    if (lower.includes('chữa cháy') || lower.includes('fire') || lower.includes('гал') || lower.includes('bình chữa cháy') || lower.includes('bảo vệ')) {
      matches.push('소화기 2기 배치 및 화재 대비');
    }

    // 안전대 / 보호구
    if (lower.includes('dây an toàn') || lower.includes('harness') || lower.includes('хамгаалалтын бүс') || lower.includes('hai móc')) {
      matches.push('안전대 2개소 체결 착용');
    }

    // 온도 초과 / 점검 수치
    if (lower.includes('nhiệt độ') || lower.includes('vượt quá') || lower.includes('temperature') || lower.includes('температур')) {
      matches.push('설비 내부 온도 기준치 초과 및 이상 감지');
    }

    // 보일러 / 세척 / 펌프
    if (lower.includes('boiler') || lower.includes('lò hơi') || lower.includes('quạt') || lower.includes('bơm') || lower.includes('pump')) {
      matches.push('보일러 및 펌프 라인 점검 정비');
    }

    if (matches.length > 0) {
      const translated = matches.join(', ');
      return {
        koreanText: `${translated}`,
        originalText: text,
        isTranslated: true,
        sourceLang,
        sourceLangInfo,
        originalFlag: sourceLangInfo.flag,
      };
    }

    // 기본 외국어 표기 변환
    return {
      koreanText: `[번역 (${sourceLangInfo.flag} ${sourceLangInfo.name})] ${text}`,
      originalText: text,
      isTranslated: true,
      sourceLang,
      sourceLangInfo,
      originalFlag: sourceLangInfo.flag,
    };
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
        : targetLangOrNat;

    if (lang === 'ko') {
      return {
        name: target.name,
        location: target.location || '',
        description: target.description || '',
        metricNames: target.metricNames || [],
      };
    }

    const langInfo = this.getLanguageInfo(lang);

    const nameMap: Record<string, string> = {
      vi: target.name
        .replace('A동', 'Khu A')
        .replace('B동', 'Khu B')
        .replace('C동', 'Khu C')
        .replace('렌더링 쿠커', 'Nồi nấu phân hủy')
        .replace('보일러', 'Lò hơi')
        .replace('배관', 'đường ống'),
      mn: target.name
        .replace('A동', 'А байр')
        .replace('B동', 'Б байр')
        .replace('C동', 'С байр')
        .replace('보일러', 'Бойлер')
        .replace('배관', 'хоолой'),
      en: target.name
        .replace('A동', 'Building A')
        .replace('B동', 'Building B')
        .replace('C동', 'Building C')
        .replace('렌더링 쿠커', 'Rendering Cooker')
        .replace('보일러', 'Boiler')
        .replace('배관', 'Piping'),
    };

    const locationMap: Record<string, string> = {
      vi: (target.location || '')
        .replace('A동', 'Khu A')
        .replace('B동', 'Khu B')
        .replace('C동', 'Khu C')
        .replace('공장', 'nhà máy')
        .replace('보일러실', 'Phòng nồi hơi'),
      en: (target.location || '')
        .replace('A동', 'Building A')
        .replace('B동', 'Building B')
        .replace('C동', 'Building C')
        .replace('공장', 'Plant')
        .replace('보일러실', 'Boiler Room'),
    };

    const descMap: Record<string, string> = {
      vi: (target.description || '')
        .replace('고온·고압 증기', 'Hơi nước nhiệt độ/áp suất cao')
        .replace('비상', 'Khẩn cấp')
        .replace('검사', 'kiểm tra'),
      mn: (target.description || '')
        .replace('고온·고압 증기', 'Өндөр температур ба даралттай уур')
        .replace('비상', 'Яаралтай'),
      en: (target.description || '')
        .replace('고온·고압 증기', 'High-temp, high-pressure steam')
        .replace('비상', 'Emergency'),
    };

    const translatedName = nameMap[lang] || `[${langInfo.flag}] ${target.name}`;
    const translatedLocation = locationMap[lang] || (target.location ? `[${langInfo.flag}] ${target.location}` : '');
    const translatedDesc = descMap[lang] || (target.description ? `[${langInfo.flag}] ${target.description}` : '');

    const translatedMetrics = (target.metricNames || []).map((m) => {
      if (lang === 'vi') {
        return m
          .replace('내부 가열 온도', 'Nhiệt độ gia nhiệt bên trong')
          .replace('증기 공급 압력', 'Áp suất cấp hơi')
          .replace('표면 온도', 'Nhiệt độ bề mặt')
          .replace('진동치', 'Độ rung');
      }
      if (lang === 'en') {
        return m
          .replace('내부 가열 온도', 'Internal Heating Temp')
          .replace('증기 공급 압력', 'Steam Supply Pressure')
          .replace('표면 온도', 'Surface Temp')
          .replace('진동치', 'Vibration');
      }
      return `[${langInfo.flag}] ${m}`;
    });

    return {
      name: translatedName,
      location: translatedLocation,
      description: translatedDesc,
      metricNames: translatedMetrics,
    };
  }

  /**
   * QR 설비 정보(주의사항, 비상조치절차 등)를 근로자 언어로 번역
   */
  public translateQRInfo(
    qr: { name?: string; cautionNotes?: string; emergencyProcedures?: string },
    targetLangOrNat: string
  ): { name: string; cautionNotes: string; emergencyProcedures: string } {
    const lang =
      targetLangOrNat.length === 2 && targetLangOrNat === targetLangOrNat.toUpperCase()
        ? this.detectLanguageByNationality(targetLangOrNat)
        : targetLangOrNat;

    if (lang === 'ko') {
      return {
        name: qr.name || '',
        cautionNotes: qr.cautionNotes || '',
        emergencyProcedures: qr.emergencyProcedures || '',
      };
    }

    const langInfo = this.getLanguageInfo(lang);

    const cautionVN = (qr.cautionNotes || '')
      .replace('강염기성 유해화학물질', 'Hóa chất độc hại kiềm mạnh')
      .replace('흡입 및 피부 접촉 시 심각한 화상 위험', 'Nguy cơ bỏng nặng khi hít phải hoặc tiếp xúc da')
      .replace('내화학 장갑/보안경 필수', 'Bắt buộc đeo găng tay chống hóa chất và kính bảo hộ')
      .replace('고온·고압 증기 위험', 'Nguy hiểm hơi nước nhiệt độ cao, áp suất cao')
      .replace('롤러 협착 위험', 'Nguy hiểm kẹt con lăn');

    const emergVN = (qr.emergencyProcedures || '')
      .replace('피부 접촉 시 흐르는 물에 15분 이상 세척', 'Khi tiếp xúc da, rửa dưới vòi nước chảy trên 15 phút')
      .replace('눈 유입 시 즉시 세안기 사용 후 병원 이송', 'Khi vào mắt, rửa mắt khẩn cấp ngay và chuyển viện')
      .replace('비상정지', 'Dừng khẩn cấp')
      .replace('전원 차단', 'Ngắt nguồn điện');

    const cautionEN = (qr.cautionNotes || '')
      .replace('강염기성 유해화학물질', 'Strong alkaline hazardous chemical')
      .replace('흡입 및 피부 접촉 시 심각한 화상 위험', 'Severe burn risk on inhalation or skin contact')
      .replace('내화학 장갑/보안경 필수', 'Chemical gloves and safety glasses required')
      .replace('고온·고압 증기 위험', 'High-temp, high-pressure steam hazard')
      .replace('롤러 협착 위험', 'Roller pinch hazard');

    const emergEN = (qr.emergencyProcedures || '')
      .replace('피부 접촉 시 흐르는 물에 15분 이상 세척', 'Rinse with running water for 15+ minutes if in contact with skin')
      .replace('눈 유입 시 즉시 세안기 사용 후 병원 이송', 'Immediately use eyewash station and transport to hospital')
      .replace('비상정지', 'Emergency stop')
      .replace('전원 차단', 'Cut off main power');

    return {
      name: qr.name ? (lang === 'vi' ? qr.name.replace('보일러', 'Lò hơi').replace('청관제', 'Chất làm sạch') : `[${langInfo.flag}] ${qr.name}`) : '',
      cautionNotes: lang === 'vi' ? cautionVN : lang === 'en' ? cautionEN : `[${langInfo.flag} ${langInfo.name}] ${qr.cautionNotes || ''}`,
      emergencyProcedures:
        lang === 'vi' ? emergVN : lang === 'en' ? emergEN : `[${langInfo.flag} ${langInfo.name}] ${qr.emergencyProcedures || ''}`,
    };
  }

  /**
   * 스마트 체크리스트 항목들을 근로자 언어로 번역
   */
  public translateChecklistItems(items: string[], targetLangOrNat: string): string[] {
    const lang =
      targetLangOrNat.length === 2 && targetLangOrNat === targetLangOrNat.toUpperCase()
        ? this.detectLanguageByNationality(targetLangOrNat)
        : targetLangOrNat;

    if (lang === 'ko') return items;
    const langInfo = this.getLanguageInfo(lang);

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
      return `[${langInfo.flag} ${langInfo.name}] ${item}`;
    });
  }

  /**
   * 헬퍼: 한국어 문장을 키워드 단위로 분해하여 각 언어로 조립
   */
  private buildWorkerTranslation(koreanText: string, lang: string): string {
    const langInfo = this.getLanguageInfo(lang);

    const patterns: { ko: RegExp; translations: Record<string, string> }[] = [
      {
        ko: /용접/g,
        translations: {
          vi: 'hàn (welding)',
          en: 'welding',
          mn: 'гагнуур',
          ph: 'pagwewelding',
          th: 'การเชื่อม',
          id: 'pengelasan',
          uz: 'payvandlash',
          zh: '焊接',
          km: 'ការផ្សារ',
          ne: 'वेल्डिङ',
          mm: 'ဂဟေဆော်ခြင်း',
          bd: 'ওয়েল্ডিং',
          lk: 'වෑල්ඩින්',
          pk: 'ویلڈنگ',
          tl: 'soldadura',
          la: 'ການເຊື່ອມ',
          kz: 'дәнекерлеу',
        },
      },
      {
        ko: /화재|불/g,
        translations: {
          vi: 'cháy nổ/hỏa hoạn',
          en: 'fire hazard',
          mn: 'гал түймэр',
          ph: 'sunog',
          th: 'อัคคีภัย',
          id: 'kebakaran',
          uz: 'yong‘in',
          zh: '火灾',
          km: 'អគ្គិភ័យ',
          ne: 'आगो',
          mm: 'မီးဘေး',
          bd: 'আগুন',
          lk: 'ගින්න',
          pk: 'آگ',
          tl: 'ahi',
          la: 'ໄຟໄໝ້',
          kz: 'өрт',
        },
      },
      {
        ko: /보호구|안전모|안전대/g,
        translations: {
          vi: 'trang bị bảo hộ (mũ, dây an toàn)',
          en: 'PPE (helmet, harness)',
          mn: 'хамгаалалтын хэрэгсেল',
          ph: 'kagamitang pangkaligtasan',
          th: 'อุปกรณ์ป้องกันภัยส่วนบุคคล',
          id: 'alat pelindung diri',
          uz: 'himoya vositalari',
          zh: '劳保防护用品',
          km: 'ឧបករណ៍ការពារសុវត្ថិភាព',
          ne: 'सुरक्षा उपकरण',
          mm: 'လုံခြုံရေးအကာအကွယ်ပစ္စည်း',
          bd: 'সুরক্ষা সরঞ্জাম',
          lk: 'ආරක්ෂක ආම්පන්න',
          pk: 'حفاظتی سامان',
          tl: 'ekipamentu protesaun',
          la: 'ອຸປະກອນປ້ອງກັນ',
          kz: 'жеке қорғаныс құралдары',
        },
      },
      {
        ko: /반려/g,
        translations: {
          vi: 'Bị từ chối (Rejected)',
          en: 'Rejected',
          mn: 'Буцаагдсан (Rejected)',
          ph: 'Tinanggihan',
          th: 'ถูกปฏิเสธ (Rejected)',
          id: 'Ditolak (Rejected)',
          uz: 'Rad etildi (Rejected)',
          zh: '已驳回 (Rejected)',
          km: 'ត្រូវបានបដិសេធ',
          ne: 'अस्वीकृत गरियो',
          mm: 'ငြင်းပယ်ခံရသည်',
          bd: 'বাতিল করা হয়েছে',
          lk: 'ප්‍රතික්ෂේප කරන ලදී',
          pk: 'مسترد کر دیا گیا',
          tl: 'Rejeitadu',
          la: 'ຖືກປະຕິເສດ',
          kz: 'Қабылданбады',
        },
      },
    ];

    let result = koreanText;
    let hasMatched = false;

    for (const p of patterns) {
      if (p.ko.test(koreanText) && p.translations[lang]) {
        result = result.replace(p.ko, `[${p.translations[lang]}]`);
        hasMatched = true;
      }
    }

    if (hasMatched) {
      return `[${langInfo.flag} ${langInfo.nativeName}] ${result}`;
    }

    return `[${langInfo.flag} ${langInfo.nativeName}] ${koreanText}`;
  }
}
