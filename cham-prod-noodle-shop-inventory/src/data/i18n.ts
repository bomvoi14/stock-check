import { Language } from '../types';

export interface Dictionary {
  title: string;
  subtitle: string;
  modeCheck: string;
  modeReceive: string;
  menu1: string;
  menu2: string;
  menu3: string;
  menu4: string;
  menu5: string;
  menu6: string;
  menu7: string;
  menu8: string;
  historyBtn: string;
  restockBtn: string;
  catalogBtn: string;
  settingsBtn: string;
  back: string;
  staffPlaceholder: string;
  searchPh: string;
  colItem: string;
  colQty: string;
  colUnit: string;
  colNote: string;
  colPrice: string;
  colShop: string;
  colStaff: string;
  colAction: string;
  colCurrent: string;
  colBuy: string;
  colMinMax: string;
  saveBtn: string;
  saveReceiveBtn: string;
  saving: string;
  searchTitle: string;
  allShops: string;
  allStaff: string;
  allActions: string;
  loading: string;
  noRecord: string;
  confirmTitle: string;
  editBtn: string;
  confirmBtn: string;
  noChange: string;
  catOthers: string;
  restockTitle: string;
  copyListBtn: string;
  restockHint: string;
  cartTitle: string;
  emptyCart: string;
  totalPrice: string;
  todayCountAlert: string;
  zeroQtyNoteAlert: string;
  emptyCartAlert: string;
  staffRequiredAlert: string;
  copiedSuccess: string;
  copyError: string;
  noItemsToBuy: string;
  manageCatalog: string;
  addItem: string;
  editItem: string;
  deleteItem: string;
  syncGas: string;
  syncLocal: string;
  minStock: string;
  maxStock: string;
  category: string;
  shopStation: string;
  actionCheck: string;
  actionReceive: string;
}

export const i18nDict: Record<Language, Dictionary> = {
  th: {
    title: "ระบบสต็อกร้านชามโปรด",
    subtitle: "จัดการคลังสินค้า ตรวจนับสต็อก รับของเข้า และคำนวณการสั่งซื้อ ( Cham Prod ERP )",
    modeCheck: "ตรวจนับสต็อก",
    modeReceive: "รับของเข้า",
    menu1: "ก๋วยเตี๋ยวหมู",
    menu2: "ก๋วยเตี๋ยวไก่",
    menu3: "อาหารตามสั่ง",
    menu4: "อุปกรณ์ในร้าน",
    menu5: "ตู้แช่ 1",
    menu6: "สำรอง 2",
    menu7: "สำรอง 3",
    menu8: "สำรอง 4",
    historyBtn: "ประวัติย้อนหลัง",
    restockBtn: "สรุปของต้องซื้อ",
    catalogBtn: "แคตตาล็อกสินค้า",
    settingsBtn: "ตั้งค่าระบบ & Sheets",
    back: "กลับหน้าหลัก",
    staffPlaceholder: "กรุณากรอกชื่อพนักงานผู้บันทึก...",
    searchPh: "พิมพ์ชื่อของที่ซื้อมา (เช่น หมู, ผัก, น้ำซุป, แก้ว)...",
    colItem: "รายการสินค้า",
    colQty: "จำนวนนับได้",
    colUnit: "หน่วย",
    colNote: "หมายเหตุ",
    colPrice: "ราคา (บาท)",
    colShop: "ร้าน/สถานี",
    colStaff: "ผู้บันทึก",
    colAction: "ประเภท",
    colCurrent: "สต็อกมีอยู่",
    colBuy: "ต้องสั่งซื้อ",
    colMinMax: "เกณฑ์ (Min/Max)",
    saveBtn: "บันทึกผลตรวจนับ",
    saveReceiveBtn: "บันทึกรับของเข้า",
    saving: "กำลังบันทึกข้อมูล...",
    searchTitle: "ประวัติการทำรายการย้อนหลัง",
    allShops: "-- ทุกร้าน/สถานี --",
    allStaff: "-- พนักงานทุกคน --",
    allActions: "-- ทุกประเภท --",
    loading: "กำลังโหลดข้อมูล...",
    noRecord: "ไม่พบรายการบันทึกข้อมูล",
    confirmTitle: "สรุปรายการก่อนบันทึก",
    editBtn: "กลับไปแก้ไข",
    confirmBtn: "ยืนยันการบันทึก",
    noChange: "ไม่พบการเปลี่ยนแปลงข้อมูลที่ต้องบันทึก",
    catOthers: "หมวดหมู่ทั่วไป",
    restockTitle: "สรุปรายการของที่ต้องสั่งซื้อ",
    copyListBtn: "📋 คัดลอกใบสั่งซื้อ (ส่ง LINE/แชท)",
    restockHint: "คิดคำนวณจากยอดนับคงเหลือนำมาบวกยอดรับเข้าล่าสุดให้อัตโนมัติ",
    cartTitle: "🛒 บิลรายการรับของเข้า",
    emptyCart: "ค้นหาสินค้าด้านบนเพื่อเพิ่มลงในบิลรับของ",
    totalPrice: "รวมยอดเงินทั้งบิล:",
    todayCountAlert: "วันนี้มีการเช็คสต็อกไปแล้ว ล่าสุดโดย",
    zeroQtyNoteAlert: "กรุณาใส่หมายเหตุสำหรับรายการที่มีจำนวนเป็น 0 (เช่น 'สินค้าหมด')",
    emptyCartAlert: "ตะกร้าบิลยังว่างเปล่า กรุณาค้นหาและเลือกสินค้าที่ซื้อมา",
    staffRequiredAlert: "กรุณากรอกชื่อพนักงานผู้บันทึกก่อนทำรายการ",
    copiedSuccess: "คัดลอกใบสั่งซื้อเรียบร้อย! สามารถนำไปวางใน LINE หรือแชทได้ทันที",
    copyError: "ไม่สามารถคัดลอกอัตโนมัติได้",
    noItemsToBuy: "✨ สินค้าทุกรายการอยู่ในระดับปลอดภัย ไม่พบของที่ต้องสั่งซื้อเพิ่ม",
    manageCatalog: "จัดการแคตตาล็อกสินค้า Master Data",
    addItem: "+ เพิ่มสินค้าใหม่",
    editItem: "แก้ไขสินค้า",
    deleteItem: "ลบสินค้า",
    syncGas: "เชื่อมต่อ Google Sheets",
    syncLocal: "โหมด LocalStorage",
    minStock: "จุดสั่งซื้อ (Min)",
    maxStock: "เป้าหมายสูงสุด (Max)",
    category: "หมวดหมู่",
    shopStation: "ร้าน/สถานี",
    actionCheck: "เช็คสต็อก",
    actionReceive: "รับของเข้า"
  },
  la: {
    title: "ລະບົບສະຕັອກຮ້ານຊາມໂປຣດ",
    subtitle: "ຈັດການຄັງສິນຄ້າ ກວດນັບສະຕັອກ ຮັບເຄື່ອງເຂົ້າ ແລະຄຳນວນການສັ່ງຊື້",
    modeCheck: "ກວດນັບສະຕັອກ",
    modeReceive: "ຮັບເຄື່ອງເຂົ້າ",
    menu1: "ເຝີໝູ",
    menu2: "ເຝີໄກ່",
    menu3: "ອາຫານຕາມສັ່ງ",
    menu4: "ອຸປະກອນໃນຮ້ານ",
    menu5: "ສຳຮອງ 1",
    menu6: "ສຳຮອງ 2",
    menu7: "ສຳຮອງ 3",
    menu8: "ສຳຮອງ 4",
    historyBtn: "ເບິ່ງປະຫວັດ",
    restockBtn: "ສະຫຼຸບເຄື່ອງຕ້ອງຊື້",
    catalogBtn: "ແຄັດຕາລັອກສິນຄ້າ",
    settingsBtn: "ຕັ້ງຄ່າລະບົບ & Sheets",
    back: "ກັບຄືນ",
    staffPlaceholder: "ກະລຸນາໃສ່ຊື່ພະນັກງານ...",
    searchPh: "ພິມຊື່ເຄື່ອງທີ່ຊື້ (ເຊັ່ນ: ໝູ, ຜັກ, ແກ້ວ)...",
    colItem: "ລາຍການ",
    colQty: "ຈຳນວນ",
    colUnit: "ຫົວໜ່ວຍ",
    colNote: "ໝາຍເຫດ",
    colPrice: "ລາຄາ (ບາດ)",
    colShop: "ຮ້ານ",
    colStaff: "ຜູ້ບັນທຶກ",
    colAction: "ປະເພດ",
    colCurrent: "ມີຢູ່",
    colBuy: "ຕ້ອງຊື້",
    colMinMax: "ເກນ (Min/Max)",
    saveBtn: "ບັນທຶກຂໍ້ມູນ",
    saveReceiveBtn: "ບັນທຶກຮັບເຄື່ອງ",
    saving: "ກຳລັງດຳເນີນການ...",
    searchTitle: "ປະຫວັດຍ້ອນຫຼັງ",
    allShops: "-- ທຸກຮ້ານ --",
    allStaff: "-- ພະນັກງານ --",
    allActions: "-- ທຸກປະເພດ --",
    loading: "ກຳລັງໂຫຼດຂໍ້ມູນ...",
    noRecord: "ບໍ່ພົບລາຍການ",
    confirmTitle: "ສະຫຼຸບລາຍການ",
    editBtn: "ກັບໄປແກ້ໄຂ",
    confirmBtn: "ຢືນຢັນບັນທຶກ",
    noChange: "ບໍ່ມີການແກ້ໄຂຂໍ້ມູນ",
    catOthers: "ໝວດໝູ່ທົ່ວໄປ",
    restockTitle: "ສະຫຼຸບລາຍການຕ້ອງຊື້",
    copyListBtn: "📋 ສຳເນົາໃບສັ່ງຊື້ (ສົ່ງ Line/Chat)",
    restockHint: "ລະບົບຄຳນວນສະຕັອກຫຼ້າສຸດ + ຍອດຮັບເຂົ້າໃຫ້ແລ້ວ",
    cartTitle: "🛒 ລາຍການບິນຮັບເຄື່ອງ",
    emptyCart: "ຄົ້ນຫາສິນຄ້າດ້ານເທິງເພື່ອເພີ່ມ",
    totalPrice: "ລວມຍອດເງິນ:",
    todayCountAlert: "ມື້ນີ້ມີການກວດນັບສະຕັອກແລ້ວ ໂດຍ",
    zeroQtyNoteAlert: "ກະລຸນາໃສ່ໝາຍເຫດສຳລັບລາຍການທີ່ເປັນ 0",
    emptyCartAlert: "ກະຕ່າບິນຫວ່າງເປົ່າ",
    staffRequiredAlert: "ກະລຸນາກອກຊື່ພະນັກງານກ່ອນ",
    copiedSuccess: "ສຳເນົາໃບສັ່ງຊື້ສຳເລັດ!",
    copyError: "ບໍ່ສາມາດສຳເນົາໄດ້",
    noItemsToBuy: "✨ ສິນຄ້າຢູ່ໃນລະດັບປອດໄພ",
    manageCatalog: "ຈັດການແຄັດຕາລັອກສິນຄ້າ Master Data",
    addItem: "+ ເພີ່ມສິນຄ້າໃໝ່",
    editItem: "ແກ້ໄຂສິນຄ້າ",
    deleteItem: "ລົບສິນຄ້າ",
    syncGas: "ເຊື່ອມຕໍ່ Google Sheets",
    syncLocal: "ໂຫມດ LocalStorage",
    minStock: "ຈຸດສັ່ງຊື້ (Min)",
    maxStock: "ເປົ້າໝາຍສູງສຸດ (Max)",
    category: "ໝວດໝູ່",
    shopStation: "ຮ້ານ",
    actionCheck: "ກວດນັບສະຕັອກ",
    actionReceive: "ຮັບເຄື່ອງເຂົ້າ"
  },
  mm: {
    title: "စတော့ရှယ်ယာစနစ် (Cham Prod)",
    subtitle: "စတော့ရှယ်ယာ စစ်ဆေးခြင်း၊ ပစ္စည်းလက်ခံခြင်းနှင့် ဝယ်ယူမှုတွက်ချက်ခြင်း",
    modeCheck: "စတော့ရှယ်ယာစစ်ဆေးပါ",
    modeReceive: "ပစ္စည်းလက်ခံပါ",
    menu1: "ဝက်သားခေါက်ဆွဲ",
    menu2: "ကြက်သားခေါက်ဆွဲ",
    menu3: "မှာယူရန်အစားအစာ",
    menu4: "ဆိုင်သုံးပစ္စည်းများ",
    menu5: "အပို 1",
    menu6: "အပို 2",
    menu7: "အပို 3",
    menu8: "အပို 4",
    historyBtn: "သမိုင်းကြည့်ပါ",
    restockBtn: "ဝယ်ရန်စာရင်း",
    catalogBtn: "ပစ္စည်းစာရင်း",
    settingsBtn: "ဆက်တင်များ",
    back: "ပြန်သွားရန်",
    staffPlaceholder: "ဝန်ထမ်းအမည်ထည့်ပါ...",
    searchPh: "ပစ္စည်းအမည်ရိုက်ထည့်ပါ...",
    colItem: "အမည်",
    colQty: "အရေအတွက်",
    colUnit: "ယူနစ်",
    colNote: "မှတ်ချက်",
    colPrice: "စျေးနှုန်း (ဘတ်)",
    colShop: "ဆိုင်",
    colStaff: "မှတ်တမ်းတင်သူ",
    colAction: "အမျိုးအစား",
    colCurrent: "လက်ကျန်",
    colBuy: "ဝယ်ရန်",
    colMinMax: "သတ်မှတ်ချက် (Min/Max)",
    saveBtn: "သိမ်းဆည်းပါ",
    saveReceiveBtn: "ပစ္စည်းလက်ခံသိမ်းမည်",
    saving: "လုပ်ဆောင်နေသည်...",
    searchTitle: "သမိုင်းရှာဖွေပါ",
    allShops: "-- ဆိုင်အားလုံး --",
    allStaff: "-- ဝန်ထမ်းအားလုံး --",
    allActions: "-- အမျိုးအစားအားလုံး --",
    loading: "ဒေတာကို ဖွင့်နေသည်...",
    noRecord: "မှတ်တမ်းမတွေ့ပါ",
    confirmTitle: "စာရင်းအကျဉ်းချုပ်",
    editBtn: "တည်းဖြတ်ရန် ပြန်သွားပါ",
    confirmBtn: "အတည်ပြုသိမ်းဆည်းပါ",
    noChange: "ပြောင်းလဲမှုမရှိပါ",
    catOthers: "အထွေထွေအမျိုးအစား",
    restockTitle: "ဝယ်ရမည့်စာရင်း",
    copyListBtn: "📋 စာရင်းကို ကူးယူပါ",
    restockHint: "နောက်ဆုံးစတော့ခ်ကို တွက်ချက်ထားသည်။",
    cartTitle: "🛒 လက်ခံရရှိသည့် ဘေလ်စာရင်း",
    emptyCart: "ထည့်ရန် အထက်တွင်ရှာဖွေပါ",
    totalPrice: "စုစုပေါင်း ငွေပမာဏ:",
    todayCountAlert: "ယနေ့ စတော့ရှယ်ယာ စစ်ဆေးပြီးပါပြီ။",
    zeroQtyNoteAlert: "0 ဖြစ်နေသော ပစ္စည်းများအတွက် မှတ်ချက်ရေးပါ။",
    emptyCartAlert: "စျေးဝယ်လှည်း ဗလာဖြစ်နေသည်။",
    staffRequiredAlert: "ကျေးဇူးပြု၍ ဝန်ထမ်းအမည် ထည့်ပါ။",
    copiedSuccess: "ဝယ်ယူရန် စာရင်းကို ကူးယူပြီးပါပြီ။",
    copyError: "ကူးယူ၍ မရပါ။",
    noItemsToBuy: "✨ ပစ္စည်းအားလုံး လုံလောက်စွာရှိသည်။",
    manageCatalog: "ပစ္စည်းစာရင်း စီမံခန့်ခွဲမှု",
    addItem: "+ ပစ္စည်းအသစ်ထည့်ရန်",
    editItem: "ပြင်ဆင်ရန်",
    deleteItem: "ဖျက်ပါ",
    syncGas: "Google Sheets ချိတ်ဆက်မည်",
    syncLocal: "Local မုဒ်",
    minStock: "အနည်းဆုံး (Min)",
    maxStock: "အများဆုံး (Max)",
    category: "အမျိုးအစား",
    shopStation: "ဆိုင်",
    actionCheck: "စတော့စစ်မည်",
    actionReceive: "ပစ္စည်းလက်ခံမည်"
  }
};
