// Jahon banki "Ta'limda SI tayyorgarligini baholash" so'rovnomalari (o'zbekcha)

const SCALE_5 = { min: 1, max: 5 }

export const SURVEYS = {
  talaba: {
    type: 'talaba',
    title: 'Talabalar va o\'quvchilar uchun so\'rovnoma',
    subtitle: 'Ta\'lim tizimining sun\'iy intellektga tayyorligini baholash',
    intro: `Ushbu so'rovnoma O'zbekistonda ta'lim tizimining sun'iy intellektdan (SI) mas'uliyatli va samarali foydalanishga tayyorgarligini o'rganishga qaratilgan tadqiqotning bir qismidir. So'rovnoma anonim bo'lib, unda to'g'ri yoki noto'g'ri javoblar yo'q. Biz sizning haqiqiy tajribangiz, jumladan qiyinchiliklar va xavotirlaringiz bilan qiziqamiz. Rahmat!`,
    questions: [
      {
        id: 'edu_level', type: 'radio', required: true,
        label: 'Ta\'lim darajasi',
        options: ['Texnikum', 'Bakalavriat', 'Magistratura', 'PhD (doktorantura)', 'Boshqa']
      },
      {
        id: 'field', type: 'radio', required: true,
        label: 'Ta\'lim yo\'nalishi',
        options: ['STEM (aniq va texnika fanlari)', 'Ijtimoiy fanlar', 'Gumanitar fanlar', 'Pedagogika / ta\'lim']
      },
      {
        id: 'usage_level', type: 'scale', required: true, ...SCALE_5,
        label: 'Hozirda o\'quv faoliyatingizda sun\'iy intellekt asosidagi vositalardan qay darajada foydalanasiz?',
        leftLabel: 'Umuman foydalanmayman', rightLabel: 'Juda faol'
      },
      {
        id: 'tools', type: 'checkbox', required: true,
        label: 'Quyidagi SI asosidagi ilovalardan qaysilarini o\'qish amaliyotingizga integratsiya qilgansiz?',
        hint: 'Mos keladiganlarning barchasini belgilang',
        options: [
          'Chat-asosli SI vositalari (ChatGPT, Copilot va boshqalar)',
          'SI asosidagi tarjima vositalari',
          'Matnlarni qisqartirish (xulosa qilish) uchun SI vositalari',
          'Muammolarni yechish uchun SI vositalari (matematika, kod yozish va h.k.)',
          'Ta\'lim platformalariga integratsiyalangan SI vositalari',
          'Hech qanday SI vositalaridan foydalanmaganman'
        ]
      },
      {
        id: 'activities', type: 'checkbox', required: true,
        label: 'SI vositalaridan o\'qish bilan bog\'liq qaysi faoliyatlar uchun foydalanasiz?',
        hint: 'Mos keladiganlarning barchasini belgilang',
        options: [
          'Murakkab mavzu yoki tushunchalarni tushunish',
          'Uy vazifalari yoki topshiriqlar',
          'Imtihonga tayyorgarlik',
          'Matn yozish yoki tahrirlash',
          'Tadqiqot (ma\'lumot topish yoki qisqacha bayon qilish)',
          'Men SI vositalaridan foydalanmayman'
        ]
      },
      {
        id: 'tool_type', type: 'radio', required: true,
        label: 'Hozir qaysi turdagi SI vositalaridan foydalanasiz yoki qaysilarini afzal ko\'rasiz?',
        options: ['Faqat bepul vositalar', 'Asosan bepul vositalar', 'Bepul ham, pullik ham', 'Asosan pullik vositalar', 'Men SI vositalaridan foydalanmayman']
      },
      {
        id: 'paid_willing', type: 'radio', required: true,
        label: 'Agar muassasangiz kirish imkonini bersa, pullik SI vositalaridan foydalanishga tayyormisiz?',
        options: ['Ha', 'Yo\'q', 'Ishonchim komil emas']
      },
      {
        id: 'use_mode', type: 'radio', required: true,
        label: 'Ta\'limda SI vositalaridan qanday foydalanishingizni quyidagilardan qaysi biri eng yaxshi tasvirlaydi?',
        options: [
          'To\'liq o\'zimning tashabbusim bilan',
          'Asosan o\'zimning tashabbusim bilan, ba\'zi norasmiy yo\'l-yo\'riqlar bilan',
          'Ham mustaqil, ham tuzilgan faoliyatlar doirasida',
          'Asosan muassasa tomonidan tasdiqlangan faoliyatlar doirasida',
          'Men SI vositalaridan foydalanmayman'
        ]
      },
      {
        id: 'agreement', type: 'matrix', required: true, ...SCALE_5,
        label: 'Quyidagi bayonotlarga qanchalik qo\'shilishingizni ko\'rsating',
        leftLabel: 'Mutlaqo rozi emasman', rightLabel: 'To\'liq rozi',
        statements: [
          { id: 'eff', text: 'SI menga samaraliroq o\'rganishga yordam beradi' },
          { id: 'time', text: 'SI o\'qishimda vaqtni tejaydi' },
          { id: 'understand', text: 'SI fanlarni yaxshiroq tushunishimni oshiradi' },
          { id: 'reduce_thinking', text: 'SI mustaqil fikrlash ehtiyojimni kamaytiradi' },
          { id: 'integrate', text: 'SIni ta\'limga ko\'proq integratsiya qilish kerak' }
        ]
      },
      {
        id: 'barriers', type: 'checkbox', required: true, max: 3,
        label: 'Muassasangizda SIdan samarali foydalanishga to\'sqinlik qilayotgan asosiy omillar nimalar?',
        hint: '3 tagacha variantni tanlang',
        options: [
          'SI natijalari noaniq yoki chalg\'ituvchi bo\'lishi xavfi',
          'Aniq qoidalar yoki yo\'l-yo\'riqlar yo\'qligi',
          'SI ma\'lumotlarini tanqidiy baholash ko\'nikmalarining yetishmasligi',
          'Nusxa ko\'chirish yoki plagiat bo\'yicha xavotirlar',
          'Qurilmalar yoki internetga kirishning cheklanganligi',
          'Maxfiylik va ma\'lumotlarni himoya qilish bo\'yicha xavotirlar',
          'Men jiddiy to\'siqlarga duch kelmayman'
        ]
      },
      {
        id: 'future', type: 'matrix', required: true, ...SCALE_5,
        label: 'Kelgusi 10 yil ichida SI kasb-hunar (TVET) va oliy ta\'lim muassasalarini qanday o\'zgartiradi, deb o\'ylaysiz?',
        leftLabel: 'Mutlaqo rozi emasman', rightLabel: 'To\'liq rozi',
        statements: [
          { id: 's1', text: 'SI talabalarning o\'rganish jarayonini sezilarli darajada o\'zgartiradi (shaxsiylashtirilgan ta\'lim, SI tutorlar)' },
          { id: 's2', text: 'SI o\'qituvchi va instruktorlarning rolini o\'zgartiradi (ko\'proq fasilitatsiya, kamroq rutinali vazifalar)' },
          { id: 's3', text: 'SI chekka hududlar yoki ijtimoiy nochor qatlamlardan bo\'lgan talabalar uchun ta\'limga kirishni yaxshilaydi' },
          { id: 's4', text: 'SI TVET va oliy ta\'lim dasturlarini mehnat bozori ehtiyojlariga ko\'proq moslashtiradi' },
          { id: 's5', text: 'SI texnologiyaga haddan tashqari tayanish xavfini oshiradi va zarur insoniy ko\'nikmalarni kamaytiradi' },
          { id: 's6', text: 'Umuman olganda, SI TVET va oliy ta\'lim sifatiga ijobiy ta\'sir ko\'rsatadi' }
        ]
      }
    ]
  },

  oqituvchi: {
    type: 'oqituvchi',
    title: 'Professor-o\'qituvchilar uchun so\'rovnoma',
    subtitle: 'Ta\'limda sun\'iy intellektga tayyorgarlikni baholash',
    intro: `Ushbu so'rovnoma O'zbekistonda ta'lim tizimining sun'iy intellektdan (SI) mas'uliyatli va samarali foydalanishga tayyorgarligini o'rganishga qaratilgan tadqiqotning bir qismidir. So'rovnoma anonimdir. To'g'ri yoki noto'g'ri javoblar yo'q. Biz sizning haqiqiy tajribangiz, jumladan qiyinchiliklar va xavotirlaringiz bilan qiziqamiz. Rahmat!`,
    questions: [
      {
        id: 'role', type: 'radio', required: true,
        label: 'Sizning rolingiz',
        options: ['Tyutor', 'O\'qituvchi', 'Akademik administrator']
      },
      {
        id: 'experience', type: 'radio', required: true,
        label: 'O\'qituvchilik tajribangiz (yillarda)',
        options: ['5 yildan kam', '5–10 yil', '10–20 yil', '20 yildan ortiq']
      },
      {
        id: 'usage_level', type: 'scale', required: true, ...SCALE_5,
        label: 'Hozirgi vaqtda o\'qitish faoliyatingizda SI vositalardan qay darajada foydalanasiz?',
        leftLabel: 'Umuman foydalanmayman', rightLabel: 'Juda faol foydalanaman'
      },
      {
        id: 'tools_used', type: 'checkbox', required: true,
        label: 'Siz shaxsan qaysi SI vositalari yoki xizmatlaridan foydalangansiz?',
        hint: 'Bir nechta javobni tanlash mumkin',
        options: [
          'Chatga asoslangan SI vositalari',
          'Ta\'lim platformalariga integratsiya qilingan SI vositalari',
          'Avtomatik baholash yoki fikr-mulohaza berish uchun SI vositalari',
          'Ma\'lumotlarni tahlil qilish uchun SI vositalari',
          'Hech biri'
        ]
      },
      {
        id: 'tasks', type: 'checkbox', required: true,
        label: 'Kasbingizdagi qaysi vazifalarda SI vositalaridan foydalanasiz?',
        hint: 'Bir nechta javobni tanlash mumkin',
        options: [
          'O\'quv materiallarini tayyorlash',
          'Topshiriqlar yoki baholash materiallarini ishlab chiqish',
          'Tadqiqot yoki adabiyotlar sharhini amalga oshirish',
          'Akademik matnlarni yozish yoki tahrirlash',
          'Ma\'muriy vazifalar (elektron pochta, hisobotlar)',
          'Men kasbiy faoliyatda SI vositalaridan foydalanmayman'
        ]
      },
      {
        id: 'tool_type', type: 'radio', required: true,
        label: 'Siz hozirda qaysi turdagi SI vositalaridan foydalanasiz yoki qaysilarini afzal ko\'rasiz?',
        options: ['Faqat bepul vositalar', 'Asosan bepul vositalar', 'Ham bepul, ham pullik vositalar', 'Asosan pullik vositalar', 'Men SI vositalaridan foydalanmayman']
      },
      {
        id: 'paid_willing', type: 'radio', required: true,
        label: 'Agar SI vositalari ta\'lim muassasasi tomonidan rasmiy tasdiqlanib, moliyalashtirilsa, siz ularni qo\'llashga tayyormisiz?',
        options: ['Ha', 'Balki', 'Yo\'q']
      },
      {
        id: 'agreement', type: 'matrix', required: true, ...SCALE_5,
        label: 'Quyidagi fikrlarga qay darajada qo\'shilishingizni belgilang',
        leftLabel: 'Umuman qo\'shilmayman', rightLabel: 'To\'liq qo\'shilaman',
        statements: [
          { id: 'eff', text: 'SI o\'qitish samaradorligini oshiradi' },
          { id: 'admin', text: 'SI ma\'muriy yuklamani kamaytirishga yordam beradi' },
          { id: 'pers', text: 'SI shaxsiylashtirilgan ta\'limni qo\'llab-quvvatlaydi' },
          { id: 'critical', text: 'SI talabalarning tanqidiy fikrlashini pasaytiradi' },
          { id: 'integrate', text: 'SI o\'qitish jarayoniga rasmiy tarzda integratsiya qilinishi kerak' }
        ]
      },
      {
        id: 'readiness', type: 'scale', required: true, ...SCALE_5,
        label: 'Siz o\'qitish faoliyatingizda SIdan mas\'uliyatli foydalanishga qanchalik tayyorman deb hisoblaysiz?',
        leftLabel: 'Tayyor emasman', rightLabel: 'To\'liq tayyorman'
      },
      {
        id: 'training_received', type: 'radio', required: true,
        label: 'Ta\'lim muassasangiz SIdan foydalanish bo\'yicha yo\'riqnoma yoki treninglar olib bordimi?',
        options: ['Ha, rasmiy treninglar', 'Norasmiy tavsiyalar', 'Hech qanday yo\'riqnoma yoki treninglar yo\'q', 'Bilmayman']
      },
      {
        id: 'training_views', type: 'matrix', required: true, ...SCALE_5,
        label: 'Treninglar va SI tayyorgarligi haqidagi fikrlar',
        leftLabel: 'Umuman qo\'shilmayman', rightLabel: 'To\'liq qo\'shilaman',
        statements: [
          { id: 't1', text: 'Generativ SIdan foydalanish bo\'yicha treninglar o\'qituvchilar uchun majburiy bo\'lishi kerak' },
          { id: 't2', text: 'O\'qituvchilar ta\'lim jarayonida SI vositalari qanday ishlashini tushunishi kerak' },
          { id: 't3', text: 'O\'qituvchilar tadqiqot faoliyati uchun SIni tushunishi zarur' },
          { id: 't4', text: 'Ta\'lim muassasalari generativ SI bo\'yicha boshlang\'ich treninglarni taklif qilishi kerak' },
          { id: 't5', text: 'Ta\'lim muassasalari generativ SI bo\'yicha ilg\'or (chuqurlashtirilgan) treninglarni taklif qilishi kerak' },
          { id: 't6', text: 'Treninglarning yetishmasligi ta\'limda SIdan samarali foydalanishni cheklaydi' }
        ]
      },
      {
        id: 'training_format', type: 'checkbox', required: true, max: 2,
        label: 'Qaysi trening formati siz uchun eng samarali bo\'lardi?',
        hint: '2 tagacha variantni tanlang',
        options: [
          'Mustaqil o\'rganishga mo\'ljallangan onlayn kurslar',
          'Jonli onlayn seminarlar / vebinarlar',
          'Yuzma-yuz (oflayn) treninglar',
          'Aralash format (onlayn + oflayn)',
          'Hamkasblardan o\'rganish / amaliyot hamjamiyatlari'
        ]
      },
      {
        id: 'barriers', type: 'checkbox', required: true, max: 3,
        label: 'O\'qitish faoliyatingizda SIdan foydalanishga to\'sqinlik qilayotgan asosiy omillar qaysilar?',
        hint: '3 tagacha variantni tanlang',
        options: [
          'SI tomonidan yaratilgan noto\'g\'ri, soxta yoki tarafkash ma\'lumotlar xavfi',
          'SIdan foydalanish bo\'yicha institutsional siyosat yoki aniq yo\'riqnomalarning yo\'qligi',
          'SIdan ishonchli va mas\'uliyatli foydalanish uchun yetarli bilim va treninglarning yo\'qligi',
          'Akademik halollikni ta\'minlashdagi qiyinchiliklar (ko\'chirish, plagiat, baholashning ishonchliligi)',
          'Mos SI vositalari yoki infratuzilmaga cheklangan kirish',
          'Huquqiy, axloqiy yoki shaxsiy ma\'lumotlarni himoya qilish bilan bog\'liq xavotirlar'
        ]
      }
    ]
  }
}

export function getSurvey(type) { return SURVEYS[type] }
